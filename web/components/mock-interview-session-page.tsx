"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { interviewApi } from "@/lib/interview-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  interviewPhases,
  INTERVIEW_PHASE_CONFIGS,
  MODE_CONFIGS,
  Mode,
  getExamTrack,
  InterviewPhase,
} from "@/lib/interview-types";
import BackButton from "@/components/auth/back-button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Loader2,
} from "lucide-react";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
  phase?: InterviewPhase;
}

export default function MockInterviewSession() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { isAuthenticated } = useAuth();

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const [sessionData, setSessionData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<any>(null);

  const [busy, setBusy] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const [canContinueInterview, setCanContinueInterview] = useState(true);

  const [ttsEnabled, setTtsEnabled] = useState(true);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStream, setCameraStream] =
    useState<MediaStream | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const [dictationEnabled, setDictationEnabled] = useState(false);
  const [panelSpeaking, setPanelSpeaking] = useState(false);

  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Prevent opening question from being requested multiple times.
  const openingLoadedRef = useRef(false);

  // Keep the accumulated speech-to-text answer.
  const speechTranscriptRef = useRef("");

  // ---------------------------------------------------------------------------
  // CURRENT PHASE
  // ---------------------------------------------------------------------------

  const currentPhase: InterviewPhase =
    interviewPhases[currentPhaseIndex] || "PROFILE_INCEPTION";

  const phaseConfig = INTERVIEW_PHASE_CONFIGS[currentPhase];

  // ---------------------------------------------------------------------------
  // LOAD SESSION
  // ---------------------------------------------------------------------------

  const {
    data: sessionDataQuery,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["interview-session", sessionId],

    queryFn: async () => {
      const data = await interviewApi.getSession(sessionId);
      return data.data;
    },

    enabled: isAuthenticated && !!sessionId,
  });

  useEffect(() => {
    if (sessionDataQuery) {
      setSessionData(sessionDataQuery);
    }
  }, [sessionDataQuery]);

  useEffect(() => {
    if (sessionError) {
      setError("Failed to load session. Please try again.");
      toast.error("Failed to load session");
    }
  }, [sessionError]);

  // ---------------------------------------------------------------------------
  // TIMER
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - startTime) / 1000)
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [startTime]);

  // ---------------------------------------------------------------------------
  // AUTO-SCROLL CHAT
  // ---------------------------------------------------------------------------

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  // ---------------------------------------------------------------------------
  // TEXT TO SPEECH
  // ---------------------------------------------------------------------------

  const speakText = useCallback(
    (
      text: string,
      locale = "en-IN",
      onEnd?: () => void
    ) => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = locale;
      utterance.rate = 0.95;

      utterance.onstart = () => {
        setPanelSpeaking(true);
      };

      utterance.onend = () => {
        setPanelSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = () => {
        setPanelSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Stop speech immediately when voice is disabled.
  useEffect(() => {
    if (!ttsEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPanelSpeaking(false);
    }
  }, [ttsEnabled]);

  // ---------------------------------------------------------------------------
  // STOP DICTATION
  // ---------------------------------------------------------------------------

  const stopDictation = useCallback(() => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.onend = null;

      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }

      recognitionRef.current = null;
    }

    setDictationEnabled(false);
  }, []);

  // ---------------------------------------------------------------------------
  // START DICTATION
  //
  // IMPORTANT:
  // There is ONLY ONE startDictation function now.
  // ---------------------------------------------------------------------------

  const startDictation = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech-to-text is not supported in this browser."
      );
      return;
    }

    // Avoid creating multiple recognition instances.
    if (recognitionRef.current) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sessionData?.locale || "en-IN";

    speechTranscriptRef.current = message;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]?.transcript || "";

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        speechTranscriptRef.current =
          `${speechTranscriptRef.current} ${finalTranscript}`.trim();
      }

      const displayText =
        `${speechTranscriptRef.current} ${interimTranscript}`.trim();

      setMessage(displayText);
    };

    recognition.onerror = (event: any) => {
      console.error("Dictation error:", event.error);

      if (event.error === "not-allowed") {
        toast.error(
          "Microphone permission denied for dictation."
        );
      }

      recognitionRef.current = null;
      setDictationEnabled(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setDictationEnabled(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setDictationEnabled(true);
    } catch (error) {
      console.error("Could not start dictation:", error);

      recognitionRef.current = null;
      setDictationEnabled(false);

      toast.error("Could not start microphone dictation.");
    }
  }, [message, sessionData?.locale]);

  // ---------------------------------------------------------------------------
  // LOAD OPENING QUESTION
  //
  // IMPORTANT:
  // This effect runs once per session.
  // Changing TTS on/off no longer calls the API again.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadOpening() {
      if (!sessionData?.id) {
        return;
      }

      if (openingLoadedRef.current) {
        return;
      }

      openingLoadedRef.current = true;

      try {
        const opening = await interviewApi.tutorReply(
          sessionData.id,
          {
            message:
              "Good day. I am present for the interview and ready to begin.",
            currentPhase: "PROFILE_INCEPTION",
            turnNumber: 1,
            history: [],
          }
        );

        const replyText =
          opening?.data?.text || opening?.text;

        if (!replyText) {
          throw new Error(
            "Empty response from interview panel."
          );
        }

        setChat([
          {
            role: "assistant",
            content: replyText,
            phase: "PROFILE_INCEPTION",
          },
        ]);

        if (ttsEnabled) {
          speakText(
            replyText,
            sessionData.locale,
            startDictation
          );
        } else {
          startDictation();
        }

        await interviewApi
          .ingestEvent(sessionData.id, {
            type: "SESSION_JOINED",
            occurredAt: new Date().toISOString(),
            payload: {
              client: "WebStudio",
              phase: "PROFILE_INCEPTION",
            },
          })
          .catch(() => {
            // Telemetry failure should not break interview.
          });
      } catch (e) {
        console.warn(
          "Could not fetch opening question:",
          e
        );

        openingLoadedRef.current = false;

        toast.error(
          "Could not load the opening interview question."
        );
      }
    }

    loadOpening();
  }, [
    sessionData?.id,
    sessionData?.locale,
    speakText,
    startDictation,
    ttsEnabled,
  ]);

  // ---------------------------------------------------------------------------
  // TUTOR MUTATION
  // ---------------------------------------------------------------------------

  const tutorMutation = useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: any;
    }) => {
      return interviewApi.tutorReply(
        sessionId,
        payload
      );
    },

    onSuccess: (response, variables) => {
      const replyText =
        response?.data?.text || response?.text;

      if (!replyText) {
        setError("Empty response from panel.");
        toast.error("Empty response from panel");
        setBusy(false);
        return;
      }

      /*
       * IMPORTANT:
       *
       * The response belongs to the phase that was actually
       * sent to the backend.
       *
       * We DO NOT immediately use currentPhaseIndex + 1 here
       * for the message itself.
       */

      const responsePhase =
        variables.payload.currentPhase as InterviewPhase;

      const shouldContinue =
        response?.data?.interviewState?.continueInterview !== false;

      setCanContinueInterview(shouldContinue);

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyText,
          phase: responsePhase,
        },
      ]);

      if (shouldContinue) {
        setCurrentPhaseIndex((previousIndex) => {
          return Math.min(
            interviewPhases.length - 1,
            previousIndex + 1
          );
        });
      }

      if (ttsEnabled && sessionData?.locale) {
        speakText(replyText, sessionData.locale, startDictation);
      } else {
        startDictation();
      }

      setBusy(false);
    },

    onError: (err: any) => {
      setError(
        err?.message ||
        "Unable to receive response from panel."
      );

      toast.error(
        err?.message ||
        "Failed to get response"
      );

      setBusy(false);
    },
  });

  // ---------------------------------------------------------------------------
  // COMPLETE INTERVIEW MUTATION
  // ---------------------------------------------------------------------------

  const completeMutation = useMutation({
    mutationFn: () => {
      if (!sessionData?.id) {
        throw new Error("Interview session is not available.");
      }

      const transcript = chat
        .map((item) => item.content)
        .join(" ");

      const durationMinutes = Math.max(
        1,
        Math.round(elapsedSeconds / 60)
      );

      return interviewApi.completeSession(
        sessionData.id,
        {
          transcript,
          segments: chat,
          durationMinutes,
        }
      );
    },

    onSuccess: (result) => {
      setFeedback(result.data);
      setCompleting(false);

      toast.success(
        "Interview completed! Here is your 360° feedback."
      );
    },

    onError: (err: any) => {
      setError(
        err?.message ||
        "Failed to generate evaluation report."
      );

      toast.error(
        err?.message ||
        "Failed to complete interview"
      );

      setCompleting(false);
    },
  });

  // ---------------------------------------------------------------------------
  // CONNECT CAMERA STREAM TO VIDEO ELEMENT
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!cameraStream) {
      video.srcObject = null;
      return;
    }

    video.srcObject = cameraStream;

    const attemptPlay = async () => {
      try {
        await video.play();
      } catch (playError) {
        console.error(
          "Video play failed:",
          playError
        );

        setDeviceError(
          "Camera started, but video playback failed."
        );
      }
    };

    attemptPlay();
  }, [cameraStream]);

  // ---------------------------------------------------------------------------
  // START CAMERA
  // ---------------------------------------------------------------------------

  const startCamera = useCallback(async () => {
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error(
          "Camera API is not supported in this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraStream(stream);
      setCameraEnabled(true);
      setDeviceError(null);
    } catch (err: any) {
      console.error("Camera error:", err);

      let message =
        "Unable to access camera.";

      switch (err?.name) {
        case "NotAllowedError":
        case "PermissionDeniedError":
          message =
            "Camera permission was denied. Please allow camera access in your browser settings and reload the page.";
          break;

        case "NotFoundError":
          message =
            "No camera was found on this device.";
          break;

        case "NotReadableError":
          message =
            "Camera is already being used by another application.";
          break;

        case "OverconstrainedError":
          message =
            "The requested camera settings are not supported.";
          break;

        case "SecurityError":
          message =
            "Camera access is blocked for security reasons.";
          break;

        case "NotSupportedError":
          message =
            "Camera access is not supported in this context. Ensure the site is loaded over HTTPS.";
          break;

        default:
          if (err?.message) {
            message = err.message;
          }
      }

      setCameraEnabled(false);
      setCameraStream(null);
      streamRef.current = null;
      setDeviceError(message);

      toast.error(message);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // STOP CAMERA
  // ---------------------------------------------------------------------------

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    streamRef.current = null;

    setCameraStream(null);
    setCameraEnabled(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // CAMERA TOGGLE
  // ---------------------------------------------------------------------------

  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  // ---------------------------------------------------------------------------
  // MICROPHONE TOGGLE
  // ---------------------------------------------------------------------------

  const toggleMic = async () => {
    if (panelSpeaking) {
      toast.error(
        "Please wait for the panel to finish speaking."
      );
      return;
    }

    if (dictationEnabled) {
      stopDictation();
    } else {
      startDictation();
    }
  };

  // ---------------------------------------------------------------------------
  // END SESSION
  // ---------------------------------------------------------------------------

  const endSession = () => {
    stopCamera();
    stopDictation();

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }

    router.push("/mock-interview");
  };

  // ---------------------------------------------------------------------------
  // SEND USER ANSWER
  // ---------------------------------------------------------------------------

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (busy || tutorMutation.isPending) {
      return;
    }

    if (!sessionData?.id) {
      toast.error(
        "Interview session is not ready."
      );
      return;
    }

    if (panelSpeaking) {
      toast.error(
        "Please wait for the panel to finish speaking."
      );
      return;
    }

    setBusy(true);
    setError(null);

    const userMsg = trimmedMessage;

    /*
     * IMPORTANT:
     *
     * The answer belongs to CURRENT phase.
     *
     * Do NOT increment the phase here.
     */

    const updatedChat: ChatMessage[] = [
      ...chat,
      {
        role: "user",
        content: userMsg,
        phase: currentPhase,
      },
    ];

    setChat(updatedChat);
    setMessage("");

    speechTranscriptRef.current = "";

    stopDictation();

    /*
     * Turn number is based on user responses.
     *
     * Count user messages instead of using total chat length.
     * This avoids errors caused by assistant/user message pairing.
     */

    const userTurnCount =
      updatedChat.filter(
        (item) => item.role === "user"
      ).length;

    const nextTurn = userTurnCount + 1;

    const isFinalPhase =
      currentPhaseIndex >= interviewPhases.length - 1;

    if (isFinalPhase) {
      setCanContinueInterview(false);
      setBusy(false);
      return;
    }

    tutorMutation.mutate({
      sessionId: sessionData.id,

      payload: {
        message: userMsg,

        /*
         * Send the phase the user is currently answering.
         */
        currentPhase,

        turnNumber: nextTurn,

        history: updatedChat,
      },
    });
  };

  // ---------------------------------------------------------------------------
  // FINISH INTERVIEW
  // ---------------------------------------------------------------------------

  const handleFinish = () => {
    if (completing || completeMutation.isPending) {
      return;
    }

    if (chat.length === 0) {
      toast.error(
        "Please answer at least one interview question first."
      );
      return;
    }

    stopCamera();
    stopDictation();

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }

    setCompleting(true);
    setError(null);

    completeMutation.mutate();
  };

  // ---------------------------------------------------------------------------
  // FORMAT TIMER
  // ---------------------------------------------------------------------------

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;

    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // ---------------------------------------------------------------------------
  // CLEANUP ON UNMOUNT
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      const stream = streamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      const recognition =
        recognitionRef.current;

      if (recognition) {
        recognition.onend = null;

        try {
          recognition.stop();
        } catch {
          // Ignore cleanup errors.
        }

        recognitionRef.current = null;
      }

      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------

  if (!isAuthenticated) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------------------------

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 font-[family-name:var(--font-poppins)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />

        <p className="mt-4 text-sm text-gray-600">
          Loading interview studio...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SESSION ERROR
  // ---------------------------------------------------------------------------

  if (error && !sessionData) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 font-[family-name:var(--font-poppins)]">
        <Card className="w-full max-w-md rounded-[20px] border-[#E2E6EE] p-6 text-center">
          <h2 className="text-lg font-bold text-red-600">
            Failed to Load Studio
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {error}
          </p>

          <Button
            onClick={() =>
              router.push("/mock-interview")
            }
            className="mt-4"
          >
            Return to Launchpad
          </Button>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SESSION INITIALIZING
  // ---------------------------------------------------------------------------

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 font-[family-name:var(--font-poppins)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />

        <p className="mt-4 text-sm text-gray-600">
          Initializing interview studio...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------------------

  const modeConfig =
    MODE_CONFIGS[
    sessionData.mode as Mode
    ] ||
    MODE_CONFIGS.MOCK_INTERVIEW;

  const examTrack = getExamTrack(
    sessionData.examId
  );

  // Prevent unused-variable lint errors if config is
  // intentionally loaded for future UI.
  void modeConfig;

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col font-[family-name:var(--font-poppins)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <BackButton
            onClick={() =>
              router.push("/mock-interview")
            }
          />

          <div>
            <div className="text-xs font-semibold text-teal-600">
              {examTrack?.name ||
                sessionData.examId}{" "}
              • {sessionData.mode}
            </div>

            <div className="text-sm font-bold text-slate-800">
              {sessionData.topic}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Tier: {sessionData.level}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {formatTime(elapsedSeconds)}
          </span>

          <Button
            variant="destructive"
            size="sm"
            onClick={endSession}
            className="h-8 rounded-full bg-red-600 text-xs text-white hover:bg-red-700"
          >
            <PhoneOff className="mr-1 h-3 w-3" />
            End
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left */}
        <div className="flex-1 border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0">
          {/* Video */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 overflow-hidden rounded-xl bg-black">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover sm:h-fit"
                  style={{
                    transform: "scaleX(-1)",
                  }}
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-slate-900 text-slate-400 sm:h-56">
                  <div className="text-center">
                    <VideoOff className="mx-auto h-8 w-8 opacity-70" />

                    <p className="mt-1 text-xs opacity-70">
                      Camera Off
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  You
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 sm:flex-col">
              <Button
                type="button"
                variant={
                  cameraEnabled
                    ? "default"
                    : "secondary"
                }
                size="icon"
                onClick={toggleCamera}
                className={`h-10 w-10 rounded-full ${cameraEnabled
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-slate-200 hover:bg-slate-300"
                  }`}
                title={
                  cameraEnabled
                    ? "Turn off camera"
                    : "Turn on camera"
                }
              >
                {cameraEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>

              <Button
                type="button"
                variant={
                  dictationEnabled
                    ? "default"
                    : "secondary"
                }
                size="icon"
                onClick={toggleMic}
                disabled={panelSpeaking}
                className={`h-10 w-10 rounded-full ${dictationEnabled
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-slate-200 hover:bg-slate-300"
                  }`}
                title={
                  dictationEnabled
                    ? "Stop dictation"
                    : "Start dictation"
                }
              >
                {dictationEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Device Error */}
          {deviceError && (
            <div className="mb-3 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-700">
              {deviceError}
            </div>
          )}

          {/* Phase Tracker */}
          <div className="mb-3 flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-200 p-1">
            {interviewPhases.map(
              (phase, index) => {
                const active =
                  index === currentPhaseIndex;

                const completed =
                  index < currentPhaseIndex;

                return (
                  <div
                    key={phase}
                    className={`flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-center text-xs font-medium transition-all ${active
                      ? "bg-teal-600 text-white"
                      : completed
                        ? "bg-slate-700 text-teal-300"
                        : "bg-transparent text-slate-500"
                      }`}
                  >
                    {completed
                      ? "✓ "
                      : `${index + 1}. `}

                    {INTERVIEW_PHASE_CONFIGS[
                      phase
                    ].name
                      .split(":")[1]
                      ?.trim() ||
                      phase}
                  </div>
                );
              }
            )}
          </div>

          {/* Phase Goal */}
          <Card className="mb-4 rounded-[20px] border-[#E2E6EE]">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Current Phase Goal
                </h3>

                <span className="text-xs text-slate-500">
                  {phaseConfig.focus}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-teal-600 transition-all"
                  style={{
                    width: `${((currentPhaseIndex + 1) /
                      interviewPhases.length) *
                      100
                      }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dialogue Header */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Interview Dialogue
            </h3>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setTtsEnabled((enabled) => !enabled)
              }
              className="text-xs"
            >
              {ttsEnabled
                ? "🔊 Voice On"
                : "🔈 Voice Off"}
            </Button>
          </div>

          {/* Chat */}
          <div className="h-[35vh] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
            {chat.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                <p className="font-semibold">
                  Panel is reviewing your profile.
                </p>

                <p>
                  Type your response below and
                  press Enter to submit.
                </p>
              </div>
            ) : (
              chat.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${item.role === "user"
                      ? "rounded-br-sm bg-teal-600 text-white"
                      : "rounded-bl-sm bg-slate-100 text-slate-800"
                      }`}
                  >
                    <div className="mb-1 text-xs font-semibold opacity-70">
                      {item.role === "user"
                        ? "You"
                        : "Panel Board"}
                    </div>

                    <div>{item.content}</div>
                  </div>
                </div>
              ))
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="mt-4 flex gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);

                if (!dictationEnabled) {
                  speechTranscriptRef.current =
                    event.target.value;
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your response (Enter to submit)..."
              rows={2}
              className="rounded-xl border-slate-200 bg-white"
              disabled={
                busy ||
                tutorMutation.isPending ||
                completing ||
                panelSpeaking
              }
            />

            <Button
              onClick={handleSend}
              disabled={
                !message.trim() ||
                busy ||
                tutorMutation.isPending ||
                completing ||
                panelSpeaking
              }
              className="h-12 rounded-xl bg-[#0f172a] px-5 font-semibold text-white hover:bg-[#1e293b]"
            >
              {busy ||
                tutorMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Finish */}
          <div className="mt-3">
            <Button
              onClick={handleFinish}
              disabled={
                completing ||
                completeMutation.isPending ||
                tutorMutation.isPending ||
                canContinueInterview
              }
              className="h-10 w-full rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500"
            >
              {completing ||
                completeMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring 360°...
                </span>
              ) : (
                "Conclude & Score Now"
              )}
            </Button>
          </div>
        </div>

        {/* Right: Feedback */}
        <div className="w-full bg-white p-4 lg:w-80">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            360° Feedback
          </h3>

          {feedback ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-800">
                  Score: {feedback.overall}/100
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${feedback.analytics
                    ?.passedThreshold
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {feedback.analytics
                    ?.passedThreshold
                    ? "QUALIFIED"
                    : "DEVELOPMENT NEEDED"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  🧠 Knowledge:{" "}
                  <b>
                    {feedback.dimensions
                      .knowledge}
                    %
                  </b>
                </div>

                <div>
                  ⚖️ Professionalism:{" "}
                  <b>
                    {
                      feedback.dimensions
                        .professionalJudgment
                    }
                    %
                  </b>
                </div>

                <div>
                  🛡️ Ethics:{" "}
                  <b>
                    {
                      feedback.dimensions
                        .ethicalReasoning
                    }
                    %
                  </b>
                </div>

                <div>
                  🧘 Emotional:{" "}
                  <b>
                    {
                      feedback.dimensions
                        .emotionalIntelligence
                    }
                    %
                  </b>
                </div>

                <div>
                  ⚡ Resilience:{" "}
                  <b>
                    {
                      feedback.dimensions
                        .psychologicalResilience
                    }
                    %
                  </b>
                </div>

                <div>
                  🗣️ Communication:{" "}
                  <b>
                    {
                      feedback.dimensions
                        .communication
                    }
                    %
                  </b>
                </div>
              </div>

              {feedback.phaseScores && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs">
                  <div className="mb-1 font-semibold text-slate-700">
                    Phase Performance
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      Phase 1:{" "}
                      <b>
                        {
                          feedback.phaseScores
                            .profileInception
                        }
                        %
                      </b>
                    </div>

                    <div>
                      Phase 2:{" "}
                      <b>
                        {
                          feedback.phaseScores
                            .domainDeepDive
                        }
                        %
                      </b>
                    </div>

                    <div>
                      Phase 3:{" "}
                      <b>
                        {
                          feedback.phaseScores
                            .situationalDilemma
                        }
                        %
                      </b>
                    </div>

                    <div>
                      Phase 4:{" "}
                      <b>
                        {
                          feedback.phaseScores
                            .stressCrossExam
                        }
                        %
                      </b>
                    </div>

                    <div>
                      Phase 5:{" "}
                      <b>
                        {
                          feedback.phaseScores
                            .concludingSynthesis
                        }
                        %
                      </b>
                    </div>
                  </div>
                </div>
              )}

              {feedback.analytics && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  <b>Telemetry:</b>{" "}
                  {feedback.analytics.estimatedWpm}{" "}
                  WPM •{" "}
                  {feedback.analytics.fillerCount}{" "}
                  Fillers •{" "}
                  {feedback.analytics.turnsCount}{" "}
                  Turns
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-green-700">
                  Key Strengths
                </div>

                <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                  {feedback.strengths.map(
                    (
                      strength: string,
                      index: number
                    ) => (
                      <li key={index}>
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <div className="text-xs font-semibold text-red-700">
                  Improvement Areas
                </div>

                <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                  {feedback.improvements.map(
                    (
                      improvement: string,
                      index: number
                    ) => (
                      <li key={index}>
                        {improvement}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <div className="text-xs font-semibold text-blue-700">
                  Targeted Drills
                </div>

                <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                  {feedback.nextActions.map(
                    (
                      action: string,
                      index: number
                    ) => (
                      <li key={index}>
                        {action}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>
                Complete the interview to view
                your 360° scorecard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


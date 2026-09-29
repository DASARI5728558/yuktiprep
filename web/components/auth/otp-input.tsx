"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";

interface OTPInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export default function OTPInput({ value, onChange, disabled, error, autoFocus }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    if (inputValue.length > 1) return;

    const newValue = (localValue ?? "").split("");
    newValue[index] = inputValue;
    const finalValue = newValue.slice(0, 6).join("");
    setLocalValue(finalValue);
    onChange(finalValue);

    if (inputValue && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !localValue[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    setLocalValue(paste);
    onChange(paste);
    const nextIndex = Math.min(paste.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="otp-0" className="text-sm font-medium text-gray-700">
        One-Time Password
      </Label>
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={localValue[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoComplete="one-time-code"
            className={`h-14 w-10 rounded-xl border text-center text-lg font-semibold transition ${error ? "border-rose-400" : "border-gray-200"
              } bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50`}
          />
        ))}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

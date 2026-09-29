"use client";
import { useState } from "react";

const navItems = [
  ["⌂", "Overview"],
  ["⌁", "My study plan"],
  ["◫", "Learn"],
  ["◉", "Mock tests"],
  ["◷", "Revision"],
  ["✦", "Current affairs"],
  ["◎", "Ask Yukti AI"],
];
const tasks = [
  {
    subject: "Indian Polity",
    title: "Fundamental Rights: Articles 12–35",
    meta: "Concept lesson · 42 min",
    tag: "HIGH PRIORITY",
    color: "green",
  },
  {
    subject: "Current Affairs",
    title: "India & the Indo-Pacific",
    meta: "Daily brief · 18 min",
    tag: "SYLLABUS MAPPED",
    color: "gold",
  },
  {
    subject: "Revision",
    title: "Modern History: 1857 Revolt",
    meta: "18 recall cards · 15 min",
    tag: "DUE TODAY",
    color: "blue",
  },
];

export default function Dashboard() {
  const [active, setActive] = useState("Overview"),
    [completed, setCompleted] = useState<string[]>([]),
    [answer, setAnswer] = useState(""),
    [aiReply, setAiReply] = useState("");
  const progress = 68 + completed.length * 8;
  const toggle = (title: string) =>
    setCompleted((c) =>
      c.includes(title) ? c.filter((x) => x !== title) : [...c, title],
    );
  const ask = () => {
    if (answer.trim())
      setAiReply(
        `Your best next move: revise the core concept behind “${answer.trim()}”, attempt 5 PYQs, and record why each option is right or wrong. I’ve reserved a 25-minute block in tomorrow’s plan.`,
      );
  };
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand app-brand logo-brand" href="/">
          <span className="logo-crop1">
            <img
              src="/yuktiprep.png"
              alt="YuktiPrep - AI-Driven Success Platform"
            />
          </span>
        </a>
        <div className="exam-switch">
          <small>PREPARING FOR</small>
          <strong>UPSC Civil Services</strong>
          <span>2027 Attempt · General Studies</span>
        </div>
        <nav aria-label="Learning navigation">
          {navItems.map(([icon, label]) => (
            <button
              key={label}
              className={active === label ? "active" : ""}
              onClick={() =>
                label === "Current affairs"
                  ? (location.href = "/current-affairs")
                  : setActive(label)
              }
            >
              <i>{icon}</i>
              {label}
              {label === "Revision" && <b>8</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-lower">
          <button>
            <i>♙</i>Mentor connect
          </button>
          <button>
            <i>▦</i>Downloads
          </button>
          <button>
            <i>⚙</i>Settings
          </button>
        </div>
        <div className="upgrade-card">
          <small>YUKTI PRO</small>
          <strong>Unlock your full preparation system</strong>
          <a href="#plans">View plans →</a>
        </div>
        <div className="user-chip">
          <span>VV</span>
          <div>
            <strong>Vijay Varadi</strong>
            <small>Free learner</small>
          </div>
          <button aria-label="User menu">⋮</button>
        </div>
      </aside>
      <section className="app-main">
        <header className="app-header">
          <div>
            <small>THURSDAY, 6 AUGUST</small>
            <h1>Welcome back, Vijay.</h1>
            <p>Your focus is clear. Let&apos;s make today count.</p>
          </div>
          <div className="header-actions">
            <button aria-label="Notifications">
              ♢<b>3</b>
            </button>
            <div className="streak-box">
              <span>🔥</span>
              <div>
                <strong>12 days</strong>
                <small>Current streak</small>
              </div>
            </div>
          </div>
        </header>
        {active === "Ask Yukti AI" ? (
          <section className="ai-workspace">
            <div className="ai-orb">Y</div>
            <span className="section-kicker">YUKTI AI MENTOR</span>
            <h2>What would you like to understand?</h2>
            <p>
              Ask a concept, request a study strategy, or paste a question you
              got wrong.
            </p>
            <div className="ai-input">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Example: Why do I keep confusing Fundamental Rights and DPSPs?"
                aria-label="Question for Yukti AI"
              />
              <button onClick={ask}>Ask Yukti →</button>
            </div>
            {aiReply && (
              <div className="ai-reply">
                <strong>Yukti&apos;s guidance</strong>
                <p>{aiReply}</p>
                <button onClick={() => setActive("My study plan")}>
                  Add to my plan
                </button>
              </div>
            )}
            <div className="prompt-row">
              <button
                onClick={() => setAnswer("Create a 30-day revision strategy")}
              >
                30-day revision strategy
              </button>
              <button
                onClick={() => setAnswer("Analyse my latest mock performance")}
              >
                Analyse my mock
              </button>
              <button
                onClick={() =>
                  setAnswer("Explain the basic structure doctrine")
                }
              >
                Explain a concept
              </button>
            </div>
          </section>
        ) : active === "Mock tests" ? (
          <MockCentre />
        ) : (
          <>
            <section className="momentum">
              <div className="momentum-copy">
                <span className="section-kicker">TODAY&apos;S MOMENTUM</span>
                <h2>
                  You&apos;re <em>3 focused sessions</em>
                  <br />
                  away from a strong day.
                </h2>
                <div className="progress-line">
                  <i style={{ width: `${Math.min(progress, 100)}%` }}></i>
                </div>
                <div className="momentum-label">
                  <span>{Math.min(progress, 100)}% of today&apos;s plan</span>
                  <span>{completed.length} of 3 priority tasks complete</span>
                </div>
              </div>
              <div className="readiness">
                <span
                  style={
                    { "--score": `${progress * 3.6}deg` } as React.CSSProperties
                  }
                >
                  <strong>{Math.min(progress, 100)}</strong>
                  <small>READY</small>
                </span>
                <div>
                  <strong>Exam readiness</strong>
                  <small>↑ 4% this week</small>
                </div>
              </div>
            </section>
            <section className="app-grid">
              <div className="today-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">YOUR AI-BUILT PLAN</span>
                    <h2>Today&apos;s path</h2>
                  </div>
                  <button>View full plan →</button>
                </div>
                <div className="task-list">
                  {tasks.map((task, idx) => {
                    const done = completed.includes(task.title);
                    return (
                      <article key={task.title} className={done ? "done" : ""}>
                        <button
                          className="check"
                          onClick={() => toggle(task.title)}
                          aria-label={`${done ? "Mark incomplete" : "Complete"} ${task.title}`}
                        >
                          {done ? "✓" : idx + 1}
                        </button>
                        <div className={`task-type ${task.color}`}>
                          {task.subject.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="task-copy">
                          <div>
                            <span>{task.subject}</span>
                            <b>{task.tag}</b>
                          </div>
                          <h3>{task.title}</h3>
                          <p>{task.meta}</p>
                        </div>
                        <button
                          className="task-go"
                          onClick={() => toggle(task.title)}
                        >
                          {done ? "Undo" : "Start →"}
                        </button>
                      </article>
                    );
                  })}
                </div>
                <div className="plan-note">
                  <span>✦</span>
                  <p>
                    <strong>Why this plan?</strong> Yukti prioritised Polity
                    after your last mock and moved History revision forward
                    based on your recall curve.
                  </p>
                  <button>View reasoning</button>
                </div>
              </div>
              <aside className="right-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">THIS WEEK</span>
                    <h2>Your progress</h2>
                  </div>
                </div>
                <div className="week-chart">
                  {[55, 80, 62, 92, 75, 42, 24].map((h, i) => (
                    <div key={i}>
                      <i
                        style={{ height: `${h}%` }}
                        className={i === 3 ? "best" : ""}
                      ></i>
                      <span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="stats-row">
                  <div>
                    <strong>14.2h</strong>
                    <span>Focused time</span>
                  </div>
                  <div>
                    <strong>284</strong>
                    <span>Questions</span>
                  </div>
                  <div>
                    <strong>72%</strong>
                    <span>Accuracy</span>
                  </div>
                </div>
                <div className="insight">
                  <span>↗</span>
                  <div>
                    <strong>Your strongest gain</strong>
                    <p>
                      Polity accuracy improved by <b>11%</b> after two focused
                      revisions.
                    </p>
                  </div>
                </div>
              </aside>
            </section>
            <section className="quick-row">
              <button onClick={() => setActive("Mock tests")}>
                <span>◉</span>
                <div>
                  <small>QUICK ACTION</small>
                  <strong>Take a 10-question quiz</strong>
                </div>
                <b>→</b>
              </button>
              <button onClick={() => setActive("Revision")}>
                <span>◷</span>
                <div>
                  <small>8 CARDS DUE</small>
                  <strong>Start smart revision</strong>
                </div>
                <b>→</b>
              </button>
              <button onClick={() => setActive("Ask Yukti AI")}>
                <span>✦</span>
                <div>
                  <small>YUKTI AI</small>
                  <strong>Ask your study mentor</strong>
                </div>
                <b>→</b>
              </button>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function MockCentre() {
  const [selected, setSelected] = useState<number | null>(null),
    [submitted, setSubmitted] = useState(false);
  const options = [
    "The Constitution is federal in form and unitary in spirit",
    "Judicial review is part of the basic structure",
    "Fundamental Rights can never be amended",
    "Parliament has unlimited constituent power",
  ];
  return (
    <section className="mock-centre">
      <span className="section-kicker">ADAPTIVE DIAGNOSTIC</span>
      <div className="mock-head">
        <div>
          <h2>Indian Polity · Question 1 of 10</h2>
          <p>Recommended after your Fundamental Rights lesson</p>
        </div>
        <span>09:42</span>
      </div>
      <div className="question-card">
        <b>Q1</b>
        <h3>
          Which one of the following statements regarding the Constitution of
          India is correct?
        </h3>
        <div className="options">
          {options.map((x, i) => (
            <button
              key={x}
              onClick={() => {
                setSelected(i);
                setSubmitted(false);
              }}
              className={`${selected === i ? "selected" : ""} ${submitted && i === 1 ? "correct" : ""} ${submitted && selected === i && i !== 1 ? "wrong" : ""}`}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {x}
            </button>
          ))}
        </div>
        <div className="question-actions">
          <button>Save for revision</button>
          <button
            className="button"
            disabled={selected === null}
            onClick={() => setSubmitted(true)}
          >
            Check answer →
          </button>
        </div>
        {submitted && (
          <div className="explanation">
            <strong>
              {selected === 1 ? "✓ Correct reasoning" : "Review this concept"}
            </strong>
            <p>
              Judicial review is recognised as part of the Constitution&apos;s
              basic structure. Parliament&apos;s amending power is broad, but
              not unlimited.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

import { useState, useEffect, useRef } from "react";
import "./LoveQuiz.css";

const questions = [
  { question: "แสตมป์ชอบกาแฟหรือชา?", options: ["กาแฟ", "ชา"] },
  { question: "แสตมป์ชอบเที่ยวทะเลหรือภูเขา?", options: ["ทะเล", "ภูเขา"] },
  { question: "แสตมป์ชอบชนบทหรือในเมือง?", options: ["ชนบท", "ในเมือง"] },
  { question: "แสตมป์ชอบบ้านแนวไหน?", options: ["มินิมอล", "คลาสสิก"] },
  { question: "แสตมป์ชอบสัตว์เลี้ยงไหม?", options: ["เลี้ยงหลิว", "ไม่ชอบ"] },
  { question: "แสตมป์ชอบดูหนังแนวไหน?", options: ["โรแมนติก", "แอ็คชั่น"] },
  { question: "เป็นแฟนกันไหมครับ? ❤️", options: ["ไม่เอา", "โอเค"] },
];

export default function LoveQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef(null);

  const BIN_ID = "6890e5d1f7e7a370d1f3afb8";
  const MASTER_KEY = "$2a$10$eje//b7qW4wTWpz57aPbTue5O5t/nUeBOEoD.unmPB73vzDBfGKAa";
  const ACCESS_KEY = "$2a$10$4yA8NuXIvVj2eueSFR0SLe0aCE2dEI5KUB8t766jezkK0.ciiFX.6";

  useEffect(() => {
    if (submitted && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [submitted]);

  const handleAnswer = async (choice) => {
    if (loading) return;
    setLoading(true);

    const newAnswer = {
      question: questions[step].question,
      answer: choice,
      time: new Date().toISOString(),
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
      setLoading(false);
    } else {
      try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
          headers: {
            "X-Master-Key": MASTER_KEY,
            "X-Access-Key": ACCESS_KEY,
          },
        });
        const data = await res.json();
        const oldData = data.record || [];

        const newData = [
          ...oldData,
          { answers: updatedAnswers, submittedAt: new Date().toISOString() },
        ];

        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": MASTER_KEY,
            "X-Access-Key": ACCESS_KEY,
          },
          body: JSON.stringify(newData),
        });

        setSubmitted(true);
      } catch (err) {
        console.error("เกิดปัญหาการส่ง:", err);
        alert("ส่งคำตอบไม่สำเร็จ 😢");
      } finally {
        setLoading(false);
      }
    }
  };

  if (submitted)
    return (
      <div className="quiz-container thank-you">
        <h2>ขอบคุณที่ตอบคำถาม! 💖</h2>
        <button
          onClick={() => {
            setStep(0);
            setAnswers([]);
            setSubmitted(false);
          }}
        >
          ตอบอีกครั้ง
        </button>
        <audio ref={audioRef} src="/love-song.mp3" />
      </div>
    );

  const isLastQuestion = step === questions.length - 1;

  return (
    <div className="quiz-container">
      <div className="progress-text">
        ข้อที่ {step + 1} / {questions.length}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div key={step} className="question-card">
        <h2 className="question">{questions[step].question}</h2>
        <div className="options">
          {questions[step].options.map((opt, idx) => {
            const isRunaway = isLastQuestion && idx === 0;
            return (
              <button
                key={idx}
                disabled={loading}
                className={`option-btn ${isRunaway ? "runaway-click-btn" : ""}`}
                onClick={(e) => {
                  if (isRunaway) {
                    const btn = e.currentTarget;
                    const randX = Math.random() * 200 - 100;
                    const randY = Math.random() * 100 - 50;
                    btn.style.transform = `translate(${randX}px, ${randY}px)`;
                    return; // ไม่ส่งคำตอบ
                  }
                  handleAnswer(opt);
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

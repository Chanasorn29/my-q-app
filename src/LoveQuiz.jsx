import { useState, useEffect, useRef } from "react";
import "./LoveQuiz.css";

const questions = [
  { question: "แสตมป์ชอบกาแฟหรือชาคับ~?", options: ["กาแฟ", "ชา"] },
  { question: "แสตมป์ชอบทะเลหรือภูเขาคับ~?", options: ["ทะเล", "ภูเขา"] },
  { question: "แสตมป์ชอบบ้านในชนบทหรือในเมืองคับ~?", options: ["ชนบท", "ในเมือง"] },
  { question: "แสตมป์ชอบบ้านแนวไหนคับ~?", options: ["มินิมอล", "คลาสสิก"] },
  { question: "อยากเลี้ยงแมวหรือหมาคับ~?", options: ["แมว", "หมา"] },
  { question: "แสตมป์ชอบดูหนังแนวไหนคับ~?", options: ["โรแมนติก", "สยองขวัญ"] },
  { question: "เป็นแฟนกันไหมคับ~? 😻", options: ["ไม่เอา~", "เป็น~ 💗"] },
];

function Heart({ style }) {
  return <div className="heart" style={style}>❤️</div>;
}

export default function LoveQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hearts, setHearts] = useState([]);
  const audioRef = useRef(null);
  const voiceRef = useRef(null);

  const BIN_ID = "6890e5d1f7e7a370d1f3afb8";
  const MASTER_KEY = "...";
  const ACCESS_KEY = "...";

  useEffect(() => {
    if (audioRef.current) {
      const playAudio = () => {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
        document.removeEventListener("click", playAudio);
      };
      document.addEventListener("click", playAudio);
    }
  }, []);

  useEffect(() => {
    if (step === questions.length - 1 && voiceRef.current) {
      voiceRef.current.volume = 1;
      voiceRef.current.play().catch(() => {});
    }
  }, [step]);

  useEffect(() => {
    if (submitted) {
      createHearts(25);
    }
  }, [submitted]);

  const createHearts = (num) => {
    const newHearts = Array.from({ length: num }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      left: Math.random() * 90 + 5 + "%",
      animationDuration: 2000 + Math.random() * 2000,
      animationDelay: Math.random() * 500,
      size: 12 + Math.random() * 12,
    }));
    setHearts(newHearts);
  };

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

        const newData = [...oldData, { answers: updatedAnswers, submittedAt: new Date().toISOString() }];

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

  const isLastQuestion = step === questions.length - 1;

  return (
    <>
      <audio ref={audioRef} src="/your-song.mp3" loop />
      <audio ref={voiceRef} src="/question-last.mp3" />

      {submitted ? (
        <div className="page-background">
          <div className="quiz-container thank-you">
            <img src="https://media.tenor.com/mg8_mL3RN6oAAAAi/giang-zzang.gif" alt="cute gif" className="corner-gif" />
            <h2>รักนะค้าบบเบบี๋~! 💖</h2>
            <button
              onClick={() => {
                setStep(0);
                setAnswers([]);
                setSubmitted(false);
                setHearts([]);
              }}
              className="option-btn"
            >
              ตอบอีกครั้ง
            </button>
            {hearts.map((heart) => (
              <Heart
                key={heart.id}
                style={{
                  left: heart.left,
                  fontSize: heart.size + "px",
                  animationDuration: heart.animationDuration + "ms",
                  animationDelay: heart.animationDelay + "ms",
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="page-background">
          <div className="quiz-container">
            <img
              src="https://media.tenor.com/kegMMjNnKkkAAAAi/bunny-cute.gif"
              alt="cute gif"
              className="corner-gif"
            />
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
                          return;
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
        </div>
      )}
    </>
  );
}



"use client";

import { useState } from "react";
import { Sparkles, ListTodo } from "lucide-react";

import { analyzeDiary } from "./actions";

export default function Home() {
  const [diary, setDiary] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);

  const sentiments = [
    { emoji: "😊", label: "행복", color: "bg-yellow-400" },
    { emoji: "😢", label: "슬픔", color: "bg-blue-400" },
    { emoji: "😠", label: "분노", color: "bg-red-400" },
    { emoji: "😲", label: "놀람", color: "bg-purple-400" },
    { emoji: "😴", label: "피곤", color: "bg-gray-400" },
  ];

  const handleAnalyze = async () => {
    if (!diary.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setTitle(null);
    setSelectedSentiment(null);

    try {
      const { sentiment, analysis, title: generatedTitle } = await analyzeDiary(diary);
      
      setResult(analysis);
      setTitle(generatedTitle);
      
      // 감정 라벨에 맞는 인덱스 찾기
      const sentimentIndex = sentiments.findIndex(s => s.label === sentiment);
      if (sentimentIndex !== -1) {
        setSelectedSentiment(sentimentIndex);
      }
    } catch {
      alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDiary("");
    setResult(null);
    setTitle(null);
    setSelectedSentiment(null);
  };

  const handleSave = () => {
    alert("일기가 저장되었습니다! (실제 저장 기능은 추후 구현 예정입니다)");
  };

  // 날짜 정보 (이미지 참고: 4월 9일, 목요일, 오후 12:02)
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일`;
  const dayStr = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(now);
  const timeStr = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9] font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 p-6 md:p-12 pb-24">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#2d3a5a] dark:text-white">
              {dateStr}
            </h1>
            <div className="text-zinc-500 font-medium flex items-center gap-2">
              <span>{dayStr}</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span>{timeStr}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-semibold shadow-sm hover:bg-zinc-50 transition-all">
              <ListTodo size={16} className="text-indigo-600" />
              일기 목록
            </button>
            <h2 className="text-xl font-bold text-[#2d3a5a] dark:text-white mt-2">
              오늘의 일기 회고
            </h2>
          </div>
        </header>

        {/* Input Card */}
        <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none overflow-hidden border border-white dark:border-zinc-800">
          <div className="p-8 sm:p-10 relative">
            <textarea
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
              placeholder="오늘 하루는 어떠셨나요? 당신의 마음을 들려주세요."
              className="w-full h-64 p-2 text-lg bg-transparent border-none focus:ring-0 placeholder-zinc-300 dark:placeholder-zinc-600 resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !diary.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${isAnalyzing || !diary.trim()
                    ? "bg-zinc-300 cursor-not-allowed shadow-none"
                    : "bg-[#7c5dff] hover:bg-[#6b4eff] shadow-indigo-200"
                  }`}
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Sparkles size={18} />
                )}
                {isAnalyzing ? "분석 중..." : "AI 분석하기"}
              </button>
            </div>
          </div>
        </section>

        {/* Emojis Section with Title */}
        <section className="space-y-4">
          {title && (
            <div className="flex justify-center animate-fade-in">
              <span className="px-5 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full text-sm font-bold text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                #{title}
              </span>
            </div>
          )}
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 dark:border-zinc-800 shadow-lg shadow-indigo-50/50">
            <div className="flex justify-between items-center max-w-xl mx-auto">
            {sentiments.map((s, index) => (
              <div
                key={index}
                className={`relative group flex flex-col items-center justify-center transition-all duration-500`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner transition-all duration-500 ${selectedSentiment === index
                      ? `${s.color} scale-125 shadow-lg shadow-${s.color.split('-')[1]}-200`
                      : "bg-zinc-100 dark:bg-zinc-800 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                    }`}
                >
                  {s.emoji}
                </div>
                {selectedSentiment === index && (
                  <span className="absolute -bottom-6 text-xs font-bold text-zinc-500 animate-bounce">
                    {s.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Result Area */}
        {result && (
          <section className="animate-fade-in space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-[2rem] p-8 border border-indigo-100 dark:border-indigo-900">
              <h3 className="text-indigo-900 dark:text-indigo-300 font-bold mb-3 flex items-center gap-2">
                <Sparkles size={16} />
                AI 일기 감성 분석 결과
              </h3>
              <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed text-lg italic">
                &quot;{result}&quot;
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-4 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
              >
                다시 작성하기
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
              >
                분석 결과 저장
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}



"use client";

import { useState, useEffect } from "react";
import { Sparkles, ListTodo } from "lucide-react";
import Image from "next/image";

import { analyzeDiary, saveDiary, getDiaries } from "./actions";
import { X, Calendar, ChevronRight } from "lucide-react";

export default function Home() {
  const [diary, setDiary] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 일기 목록 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diariesList, setDiariesList] = useState<any[]>([]);
  const [isLoadingDiaries, setIsLoadingDiaries] = useState(false);
  const [displayDate, setDisplayDate] = useState<Date>(new Date());

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
    setDisplayDate(new Date());
  };
  
  const handleOpenList = async () => {
    setIsModalOpen(true);
    setIsLoadingDiaries(true);
    try {
      const result = await getDiaries();
      if (result.status === "success") {
        setDiariesList(result.data);
      }
    } catch {
      alert("목록을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingDiaries(false);
    }
  };

  const handleSelectDiary = (item: any) => {
    setDiary(item.diary);
    setResult(null);
    setTitle(null);
    setSelectedSentiment(null);
    
    // 문자열 날짜를 Date 객체로 변환 시도
    try {
      const parsedDate = new Date(item.datetime.replace(/\. /g, '-').replace(/\./g, ''));
      if (!isNaN(parsedDate.getTime())) {
        setDisplayDate(parsedDate);
      }
    } catch {
      // 변환 실패 시 현재 시간 유지
    }
    
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!diary.trim()) return;

    setIsSaving(true);
    try {
      const result = await saveDiary(diary);
      if (result.status === "success") {
        alert("일기가 구글 시트에 성공적으로 저장되었습니다!");
        handleReset(); // 초기 화면으로 돌아가기
      } else {
        throw new Error(result.message);
      }
    } catch {
      alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 날짜 정보
  const dateStr = `${displayDate.getMonth() + 1}월 ${displayDate.getDate()}일`;
  const dayStr = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(displayDate);
  const timeStr = displayDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#fff9f0] font-sans text-[#4a3728] dark:bg-zinc-950 dark:text-zinc-100 p-6 md:p-12 pb-24 relative overflow-hidden">


      <div className="max-w-3xl mx-auto w-full space-y-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-[#ff8b3d] dark:text-white flex items-center gap-3">
              {dateStr}
              <span className="text-2xl">✨</span>
            </h1>
            <div className="text-[#a68b7c] font-bold flex items-center gap-2">
              <span>{dayStr}</span>
              <span className="w-1.5 h-1.5 bg-[#d9c5b2] rounded-full" />
              <span>{timeStr}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={handleOpenList}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-[#ffead1] dark:border-zinc-800 text-sm font-bold shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all text-[#ff8b3d]"
            >
              <ListTodo size={16} />
              일기 기록함
            </button>
          </div>
        </header>

        {/* Input Card */}
        <section className="relative mt-8 group">

          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl shadow-orange-100/50 dark:shadow-none overflow-hidden border-4 border-[#ffead1] dark:border-zinc-800 relative z-10">
            <div className="p-8 sm:p-10 relative">
              <textarea
                value={diary}
                onChange={(e) => setDiary(e.target.value)}
                placeholder="오늘 하루의 소중한 기억을 담아보세요..."
                className="w-full h-64 p-2 text-xl bg-transparent border-none focus:ring-0 placeholder-[#d9c5b2] dark:placeholder-zinc-600 resize-none font-medium leading-relaxed text-[#4a3728]"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !diary.trim()}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 text-lg ${isAnalyzing || !diary.trim()
                      ? "bg-zinc-200 cursor-not-allowed shadow-none"
                      : "bg-[#ff8b3d] hover:bg-[#ff7a21] shadow-orange-200 hover:rotate-1"
                    }`}
                >
                  {isAnalyzing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                  ) : (
                    <Sparkles size={22} />
                  )}
                  {isAnalyzing ? "해석 중..." : "다이어리 분석하기"}
                </button>
              </div>
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
                      ? `${s.color} scale-125 shadow-lg ring-4 ring-white`
                      : "bg-white dark:bg-zinc-800 opacity-60 group-hover:opacity-100 group-hover:scale-110"
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
          <section className="animate-fade-in space-y-6">
            <div className="bg-[#fff4e6] dark:bg-indigo-950/30 rounded-[2.5rem] p-10 border-3 border-[#ffd8a8] dark:border-indigo-900 shadow-xl">
              <h3 className="text-[#e67e22] dark:text-indigo-300 font-black text-xl mb-4 flex items-center gap-3">
                <Sparkles size={24} />
                AI 마음 해석 결과
              </h3>
              <p className="text-[#845237] dark:text-indigo-200 leading-relaxed text-xl font-bold italic">
                &quot;{result}&quot;
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-5 bg-white dark:bg-zinc-900 text-[#a68b7c] font-black rounded-[1.5rem] border-4 border-[#ffead1] dark:border-zinc-800 hover:bg-[#fffcf9] transition-all shadow-md active:scale-95"
              >
                처음부터 다시 쓰기
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 py-5 text-white font-black rounded-[1.5rem] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 text-xl ${isSaving
                    ? "bg-zinc-200 cursor-not-allowed"
                    : "bg-[#ff8b3d] hover:bg-[#ff7a21] shadow-orange-100 dark:shadow-none"
                  }`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                ) : null}
                {isSaving ? "보관함에 저장 중..." : "오늘의 일기 저장"}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Diary List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-4 border-[#ffead1]">
            <header className="p-6 border-b border-[#ffead1] flex justify-between items-center bg-[#fffcf9]">
              <h2 className="text-xl font-black text-[#ff8b3d] flex items-center gap-2">
                <Calendar size={20} />
                나의 일기 기록들
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-orange-50 rounded-full transition-colors text-[#a68b7c]"
              >
                <X size={24} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isLoadingDiaries ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff8b3d] border-t-transparent" />
                  <p className="font-bold text-[#a68b7c]">기억을 불러오는 중...</p>
                </div>
              ) : diariesList.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#a68b7c] font-bold">아직 기록된 일기가 없어요! 🐿️</p>
                </div>
              ) : (
                diariesList.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectDiary(item)}
                    className="w-full text-left p-5 bg-[#fffcf9] hover:bg-orange-50 rounded-2xl border-2 border-transparent hover:border-[#ffd8a8] transition-all group flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black text-[#ff8b3d]">
                        {(() => {
                          const parts = item.datetime.split('. ');
                          if (parts.length >= 3) {
                            return `${parts[0]}/${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
                          }
                          return item.datetime; // 파싱 실패 시 원본 표시
                        })()}
                      </p>
                      <p className="text-[#4a3728] font-bold line-clamp-1 opacity-80">{item.diary}</p>
                    </div>
                    <ChevronRight size={20} className="text-[#d9c5b2] group-hover:text-[#ff8b3d] transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

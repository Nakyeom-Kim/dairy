"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATION_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function analyzeDiary(content: string) {
  if (!content) throw new Error("내용을 입력해주세요.");

  console.log("분석 요청됨. API 키 존재 여부:", !!(process.env.GOOGLE_GENERATION_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY));

  try {
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: z.object({
        sentiment: z.enum(["행복", "슬픔", "분노", "놀람", "피곤"]),
        title: z.string().describe("오늘의 일기를 요약하는 짧고 감성적인 제목 (5자 이내)"),
        analysis: z.string().describe("일기에 대한 따뜻한 공감과 분석 결과 (한두 문장)"),
      }),
      prompt: `다음 일기를 분석해 가장 잘 어울리는 감정 하나를 선택하고, 일기 전체를 요약하는 아주 짧고 감성적인 제목을 지어주세요. 그리고 내용에 대한 따뜻한 공감 메시지를 작성하세요:\n\n${content}`,
    });

    console.log("분석 성공:", object);
    return object;
  } catch (error) {
    console.error("AI 분석 상세 에러:", error);
    throw new Error(`분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
  }
}

export async function saveDiary(content: string) {
  const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  
  if (!scriptUrl) {
    throw new Error("Apps Script URL이 설정되지 않았습니다.");
  }

  const now = new Date();
  const datetime = now.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", // Apps Script doPost는 text/plain으로 보내야 하는 경우가 많음
      },
      body: JSON.stringify({
        datetime,
        diary: content,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("저장 중 에러:", error);
    throw new Error("Google 시트 저장에 실패했습니다.");
  }
}

export async function getDiaries() {
  const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  
  if (!scriptUrl) {
    throw new Error("Apps Script URL이 설정되지 않았습니다.");
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "GET",
      cache: "no-store", // 매번 최신 데이터를 가져옴
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("가져오기 중 에러:", error);
    throw new Error("일기 목록을 가져오는데 실패했습니다.");
  }
}

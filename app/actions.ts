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

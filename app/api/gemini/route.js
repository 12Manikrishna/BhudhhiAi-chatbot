import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { question } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

    const response = await axios.post(
apiUrl,
      {
        contents: [{ parts: [{ text: question }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        }
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
  }
}
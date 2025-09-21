import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
    }

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: `
You are a medical assistant. Respond clearly and simply to patients.
Do NOT give a diagnosis. 

Output JSON only in this format (no extra text):
{
  "explanation": "Explain the symptoms in 2-3 simple sentences.",
  "possibleCauses": ["Short list of possible causes"],
  "homeRemedies": ["Simple self-care suggestions"],
  "whenToSeeDoctor": ["Clear guidance on when to consult a doctor"],
  "urgentWarnings": ["Immediate medical attention warning signs"]
}
            `,
          },
          {
            role: "user",
            content: `Patient reports: ${symptoms}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let text = data?.choices?.[0]?.message?.content || "";

    // 🧹 Clean unwanted markdown (```json ... ```)
    text = text.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      console.warn("⚠️ Failed to parse JSON, falling back to defaults:", text);
      analysis = {
        explanation: `Based on your symptoms: "${symptoms}", here’s some guidance.`,
        possibleCauses: ["Common viral infection", "Allergies", "Mild bacterial infection"],
        homeRemedies: [
          "Rest and stay hydrated",
          "Use mild pain relievers if needed",
          "Apply warm/cold compress",
          "Maintain good hygiene",
        ],
        whenToSeeDoctor: [
          "If symptoms last more than 7 days",
          "If symptoms get worse",
          "If new symptoms appear",
        ],
        urgentWarnings: [
          "Difficulty breathing",
          "Severe chest pain",
          "High fever (>39°C / 103°F)",
          "Severe headache with neck stiffness",
        ],
      };
    }

    // ✅ Human readable summary
    const readable = `
Understanding Your Symptoms:
- ${analysis.explanation}

Possible Causes:
${analysis.possibleCauses.map((c: string) => `- ${c}`).join("\n")}

Self-Care Suggestions:
${analysis.homeRemedies.map((c: string) => `- ${c}`).join("\n")}

When to See a Doctor:
${analysis.whenToSeeDoctor.map((c: string) => `- ${c}`).join("\n")}

🚨 Urgent Warning Signs:
${analysis.urgentWarnings.map((c: string) => `- ${c}`).join("\n")}
    `.trim();

    return NextResponse.json({ ...analysis, humanReadable });
  } catch (error: any) {
    console.error("Error in analyze-symptoms:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms. Please try again or consult a healthcare professional." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || typeof symptoms !== 'string') {
      return NextResponse.json(
        { error: 'Symptoms are required and must be a string' },
        { status: 400 }
      );
    }

    // Check if Grok API key is available
    const apiKey = process.env.GROK_API_KEY;
    
    if (!apiKey) {
      // Return mock response when no API key is provided
      const mockResponse = {
        explanation: `Based on your symptoms: "${symptoms}", here's what you should know. Please note this is educational information only and not a medical diagnosis.`,
        possibleCauses: [
          "Common viral infection - Often causes similar symptoms and usually resolves on its own",
          "Seasonal allergies - Environmental factors can trigger these symptoms",
          "Minor bacterial infection - May require medical attention if symptoms persist"
        ],
        homeRemedies: [
          "Get plenty of rest and stay hydrated",
          "Use over-the-counter pain relievers as directed",
          "Apply warm or cold compresses as appropriate",
          "Maintain good hygiene practices"
        ],
        whenToSeeDoctor: [
          "Symptoms persist for more than 7-10 days",
          "Symptoms worsen significantly",
          "You develop additional concerning symptoms",
          "You have underlying health conditions"
        ],
        urgentWarnings: [
          "Difficulty breathing or shortness of breath",
          "Severe chest pain",
          "High fever (over 103°F/39.4°C)",
          "Signs of dehydration",
          "Severe headache with neck stiffness"
        ]
      };

      return NextResponse.json(mockResponse);
    }

    // Make request to Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI healthcare assistant. You do not provide diagnoses. You explain symptoms, suggest possible causes, home care, and warning signs in simple language at an 8th grade reading level.

IMPORTANT: Always include medical disclaimers. Never provide definitive diagnoses.

Respond with a JSON object containing exactly these fields:
- explanation: A clear, patient-friendly explanation of the symptoms (2-3 sentences)
- possibleCauses: Array of 2-3 common possible causes with disclaimers
- homeRemedies: Array of 3-4 safe home care suggestions
- whenToSeeDoctor: Array of 3-4 situations when medical care is needed
- urgentWarnings: Array of 3-5 warning signs requiring immediate medical attention

Keep language simple, supportive, and educational.`
          },
          {
            role: 'user',
            content: `Patient reports: "${symptoms}". Please provide educational information about these symptoms.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Grok API');
    }

    // Parse the JSON response from Grok
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      parsedResponse = {
        explanation: content.substring(0, 200) + '...',
        possibleCauses: ['Response parsing error - please try again'],
        homeRemedies: ['Rest and hydration', 'Monitor symptoms'],
        whenToSeeDoctor: ['If symptoms persist or worsen'],
        urgentWarnings: ['Severe symptoms requiring immediate care']
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    
    // Return a safe fallback response
    return NextResponse.json({
      explanation: "I'm having trouble analyzing your symptoms right now. Please consult with a healthcare professional for proper evaluation.",
      possibleCauses: [
        "Unable to analyze at this time - please seek medical advice"
      ],
      homeRemedies: [
        "Rest and stay hydrated",
        "Monitor your symptoms carefully",
        "Follow general wellness practices"
      ],
      whenToSeeDoctor: [
        "For proper evaluation of your symptoms",
        "If symptoms persist or worsen",
        "For peace of mind and professional assessment"
      ],
      urgentWarnings: [
        "Severe or worsening symptoms",
        "Difficulty breathing",
        "High fever",
        "Severe pain",
        "Any symptoms causing significant concern"
      ]
    }, { status: 200 });
  }
}
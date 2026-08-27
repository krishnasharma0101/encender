import { NextRequest, NextResponse } from 'next/server';

interface GeminiRequest {
  primary_image_url: string;
  prompt: string;
  gemini_api_key: string;
  product_id?: string;
}

interface GeminiResponse {
  product_id?: string;
  generated_name: string;
  generated_description: string;
  image_url: string;
  success: boolean;
  error?: string;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Gemini image processor API is running',
    endpoint: '/api/gemini/process-image'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: GeminiRequest = await req.json();
    
    const { primary_image_url, prompt, gemini_api_key, product_id } = body;

    // Validate required fields
    if (!primary_image_url || !prompt || !gemini_api_key) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: primary_image_url, prompt, and gemini_api_key are required' 
        } as GeminiResponse,
        { status: 400 }
      );
    }

    // 1. Fetch the image from the URL
    const imageResponse = await fetch(primary_image_url);
    
    if (!imageResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` 
        } as GeminiResponse,
        { status: imageResponse.status }
      );
    }

    // 2. Convert image to base64
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // 3. Get content type from response headers
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // 4. Call Gemini API
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${gemini_api_key}`;
    
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: contentType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json'
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      return NextResponse.json(
        { 
          success: false, 
          error: `Gemini API error: ${JSON.stringify(errorData)}` 
        } as GeminiResponse,
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();
    
    // 5. Extract and parse the generated content
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!generatedText) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No content generated from Gemini API' 
        } as GeminiResponse,
        { status: 500 }
      );
    }

    // Try to parse as JSON, fall back to text parsing if not valid JSON
    let parsedResponse: { name?: string; title?: string; description?: string; summary?: string };
    
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch {
      // If not JSON, extract name and description manually
      const lines = generatedText.split('\n').filter(Boolean);
      const firstLine = lines[0] || '';
      const remainingLines = lines.slice(1);
      
      parsedResponse = {
        name: firstLine.replace(/^Product Name[:\-]?\s*/i, '').replace(/^Title[:\-]?\s*/i, '').trim() || 'Generated Product',
        description: remainingLines.join(' ').trim() || 'No description generated'
      };
    }

    // 6. Return the formatted response
    const response: GeminiResponse = {
      product_id: product_id,
      generated_name: parsedResponse.name || parsedResponse.title || 'Generated Product',
      generated_description: parsedResponse.description || parsedResponse.summary || 'No description generated',
      image_url: primary_image_url,
      success: true
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as GeminiResponse,
      { status: 500 }
    );
  }
}

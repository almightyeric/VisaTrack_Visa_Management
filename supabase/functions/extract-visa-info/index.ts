import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface VisaData {
  country: string;
  visa_type: string;
  visa_number?: string;
  issue_date?: string;
  expiry_date?: string;
  entry_type?: string;
  person_name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          extracted: false,
          message: 'OCR service not configured. Please enter visa details manually.',
          data: null,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const prompt = `Analyze this visa document image and extract the following information in JSON format:

{
  "country": "The country that issued the visa",
  "visa_type": "One of: tourist, business, student, work, transit, or other",
  "visa_number": "The visa number/reference number if visible",
  "issue_date": "Issue date in YYYY-MM-DD format",
  "expiry_date": "Expiry date in YYYY-MM-DD format",
  "entry_type": "One of: single, multiple, or transit",
  "person_name": "The name of the visa holder if visible"
}

Rules:
- Only extract information that is clearly visible
- Use null for fields that cannot be determined
- For visa_type, choose the most appropriate category
- For entry_type, look for keywords like "SINGLE ENTRY", "MULTIPLE ENTRY", etc.
- Dates must be in YYYY-MM-DD format
- Be as accurate as possible

Return ONLY valid JSON, no additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze image');
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    let visaData: VisaData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        visaData = JSON.parse(jsonMatch[0]);
      } else {
        visaData = JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse visa data');
    }

    const cleanedData = {
      country: visaData.country || null,
      visa_type: visaData.visa_type || 'tourist',
      visa_number: visaData.visa_number || null,
      issue_date: visaData.issue_date || null,
      expiry_date: visaData.expiry_date || null,
      entry_type: visaData.entry_type || 'single',
      person_name: visaData.person_name || null,
    };

    return new Response(
      JSON.stringify({
        extracted: true,
        message: 'Visa information extracted successfully',
        data: cleanedData,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        extracted: false,
        message: error.message || 'Failed to extract visa information',
        data: null,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

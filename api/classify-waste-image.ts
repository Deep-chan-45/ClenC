import { Type } from '@google/genai';
import {
  getGeminiClient,
  parseRequestBody,
  sendJson,
  setCorsHeaders,
  parseJsonSafely,
  getHeuristicImageClassification,
  isAuthError,
} from './_shared';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const { imageBase64, mimeType = 'image/jpeg', fileName = 'photo.jpg' } = body || {};

    if (!imageBase64) {
      return sendJson(res, 400, { error: 'Missing imageBase64 in request body' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
    const ai = getGeminiClient();

    if (!ai) {
      console.warn('GEMINI_API_KEY is not set on Vercel, using statutory heuristic classifier fallback.');
      return sendJson(res, 200, getHeuristicImageClassification(fileName));
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    };

    const textPrompt = {
      text: `You are an expert civic environmental inspector and waste segregation specialist operating under India's Solid Waste Management (SWM) Rules 2026 and Kanpur Nagar Nigam (KNN) municipal standards.
Analyze the attached photo carefully and identify the specific waste item, material, or object shown.
Determine its exact categorization under the 4 statutory waste streams in India:
1. "Wet" (Harā Dabbā / Green Bin): Biodegradable organic kitchen waste, fruit/vegetable peels, leftover cooked food, tea leaves, eggshells, garden leaves, flowers.
2. "Dry" (Neelā Dabbā / Blue Bin): Recyclable clean paper, cardboard, plastic bottles/films, aluminium cans, metal tins, glass containers, tetra paks, clean fabric/rags.
3. "Sanitary" (Lāl/Peelā Pouch / Yellow/Red marked pouch): Used diapers, sanitary pads, band-aids, soiled medical cotton, disposable masks. Must be wrapped in newspaper with red/yellow mark for bio-incineration.
4. "Special Care" (Amber/Black Container / Domestic Hazardous & E-Waste): Spent lithium/alkaline batteries, CFL/tube lights, expired medicines, paint/solvent cans, electronics, wire cables, insecticide spray bottles, broken thermometers.

Return a JSON object conforming to the schema with:
- item: Precise name of the detected object
- stream: One of "Wet", "Dry", "Sanitary", "Special Care"
- bin: Recommended bin name and container color
- confidence: Estimated confidence percentage (e.g. "97.5%")
- note: Practical Kanpur civic handling instructions (e.g., whether to rinse, keep separate, or seal)
- material: Main material detected
- recyclable: Boolean flag indicating if MRF or composting can recover it`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [imagePart, textPrompt],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item: {
              type: Type.STRING,
              description: 'Exact name of the identified item or object in the photo',
            },
            stream: {
              type: Type.STRING,
              enum: ['Wet', 'Dry', 'Sanitary', 'Special Care'],
              description: 'Statutory SWM 2026 stream',
            },
            bin: {
              type: Type.STRING,
              description: 'Official municipal bin and container description',
            },
            confidence: {
              type: Type.STRING,
              description: 'Detection confidence percentage',
            },
            note: {
              type: Type.STRING,
              description: 'Municipal disposal guidelines and handling rules',
            },
            material: {
              type: Type.STRING,
              description: 'Detected material composition',
            },
            recyclable: {
              type: Type.BOOLEAN,
              description: 'Whether the item can be recycled or composted',
            },
          },
          required: ['item', 'stream', 'bin', 'confidence', 'note'],
        },
      },
    });

    const outputText = response.text?.trim() || '';
    let parsedResult;
    try {
      parsedResult = parseJsonSafely(outputText);
    } catch {
      console.warn('Could not parse Gemini JSON response, extracting fallback:', outputText);
      parsedResult = getHeuristicImageClassification(fileName);
    }

    return sendJson(res, 200, parsedResult);
  } catch (error: any) {
    if (!isAuthError(error)) {
      console.warn('Gemini image classification notice on Vercel:', error?.message || error);
    }
    const body = await parseRequestBody(req).catch(() => ({}));
    const fallback = getHeuristicImageClassification(body?.fileName || 'image');
    return sendJson(res, 200, fallback);
  }
}

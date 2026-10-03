import { Type } from '@google/genai';
import {
  getGeminiClient,
  parseRequestBody,
  sendJson,
  setCorsHeaders,
  parseJsonSafely,
  getComprehensiveWasteClassification,
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
    const query = body?.query;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return sendJson(res, 400, { error: 'Please provide a waste item search query.' });
    }

    const trimmedQuery = query.trim();
    const ai = getGeminiClient();

    if (!ai) {
      console.warn('GEMINI_API_KEY is not set on Vercel, using statutory SWM knowledge engine for:', trimmedQuery);
      return sendJson(res, 200, getComprehensiveWasteClassification(trimmedQuery));
    }

    const promptText = `You are the Official SWM 2026 Waste Segregation & Municipal Bin Classification Authority for Kanpur Nagar Nigam (KNN), Uttar Pradesh.
A citizen is searching: "${trimmedQuery}".
Analyze this item precisely according to India's Solid Waste Management (SWM) Rules 2026, CPCB guidelines, and Kanpur Municipal Corporation bylaws.

STREAMS & BINS:
1. "Wet":
   - Bin Color: "Green Dustbin (Wet / Biodegradable Waste)"
   - Color Hex: "#15693F"
   - Category: Biodegradable organic kitchen waste, fruit/vegetable peels, leftover food, tea leaves, eggshells, meat bones, flowers, garden leaves, coconut shell, sugarcane bagasse.
   - Destination: "Kanpur Biomethanation & Bio-CNG Plant at Panki / Aerobic Municipal Compost Facility"

2. "Dry":
   - Bin Color: "Blue Dustbin (Dry / Recyclable Waste)"
   - Color Hex: "#1D5B96"
   - Category: Clean recyclable materials: all plastics, PET bottles, milk packets, shampoo bottles, thermocol / EPS, clean paper, cardboard boxes, newspapers, tetra paks, metal cans, tin foil, glass jars/bottles, clean fabrics, wood, rubber.
   - Destination: "Automated Material Recovery Facility (MRF) at Panki for sorting, baling, and EPR recycling"

3. "Sanitary":
   - Bin Color: "Red Dustbin / Pouch (Sanitary / Biomedical Waste)"
   - Color Hex: "#B8332A"
   - Category: Sanitary napkins, baby/adult diapers, panty liners, soiled cotton, used bandages, ear buds, used disposable face masks, disposable gloves.
   - Destination: "Common Bio-Medical Waste Treatment Facility (CBWTF) for 1100°C High-Temperature Incineration"

4. "Special Care":
   - Bin Color: "Amber / Black Box (Special Care / Hazardous Waste)"
   - Color Hex: "#C27115"
   - Category: Domestic hazardous waste: spent batteries (AA/AAA/lithium), CFL bulbs, tubelights, LED lamps, expired medicines, pesticide/insecticide cans, paint cans, thermometers, chargers, earphones, electronic waste, broken glass.
   - Destination: "CPCB Authorized Hazardous & E-Waste Recovery Depot for scientific detoxification"

5. "C&D":
   - Bin Color: "Brown Dustbin / Loader (Construction & Demolition Debris)"
   - Color Hex: "#7C5A38"
   - Category: Broken bricks, cement blocks, tiles, plaster, sanitaryware, demolition concrete, gravel, stone rubble.
   - Destination: "Kanpur Nagar Nigam C&D Debris Processing Plant at Rooma for aggregate recycling"

INSTRUCTIONS REQUIRED:
- item: Formal name in English with common synonyms
- hindiName: Hindi name in Devanagari script
- stream: One of "Wet", "Dry", "Sanitary", "Special Care", "C&D"
- binColor: Clean English-only dustbin type and color description (e.g. "Green Dustbin (Wet / Biodegradable Waste)")
- dustbinColorHex: Exact color hex code (#15693F, #1D5B96, #B8332A, #C27115, #7C5A38)
- howToDump: Clear step-by-step instructions on HOW to prepare and dump it (e.g. rinse, wrap in paper with red cross, crush, do not mix with wet waste, keep terminals taped)
- whereToDump: Explicit instructions on WHERE to dump it in Kanpur (e.g., morning KNN door-to-door segregated collection cart, neighborhood dry waste drop-off, designated hazardous drop kiosk)
- destination: Official municipal processing destination facility
- material: Material composition (e.g., LDPE Film, Organic Biomass, Expanded Polystyrene EPS, Lithium-Ion, Ceramic Porcelain)
- recyclable: Boolean flag (true if recyclable or compostable; false if destined for incineration or hazardous neutralization)
- confidence: e.g. "98%"
- warning: Explicit precaution warning on what NOT to do (e.g., never burn, never flush down toilet, never mix with wet compostables)

Return strict JSON conforming to this schema.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              hindiName: { type: Type.STRING },
              stream: { type: Type.STRING, enum: ['Wet', 'Dry', 'Sanitary', 'Special Care', 'C&D'] },
              binColor: { type: Type.STRING },
              dustbinColorHex: { type: Type.STRING },
              howToDump: { type: Type.STRING },
              whereToDump: { type: Type.STRING },
              destination: { type: Type.STRING },
              material: { type: Type.STRING },
              recyclable: { type: Type.BOOLEAN },
              confidence: { type: Type.STRING },
              warning: { type: Type.STRING },
            },
            required: ['item', 'stream', 'binColor', 'dustbinColorHex', 'howToDump', 'whereToDump', 'destination', 'recyclable'],
          },
        },
      });
    } catch (primaryErr: any) {
      if (isAuthError(primaryErr)) {
        return sendJson(res, 200, getComprehensiveWasteClassification(trimmedQuery));
      }
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: { responseMimeType: 'application/json' },
        });
      } catch (backupErr: any) {
        return sendJson(res, 200, getComprehensiveWasteClassification(trimmedQuery));
      }
    }

    const outputText = response?.text?.trim() || '';
    let parsedResult;
    try {
      parsedResult = parseJsonSafely(outputText);
      parsedResult.isAiGenerated = true;
    } catch {
      parsedResult = getComprehensiveWasteClassification(trimmedQuery);
    }

    return sendJson(res, 200, parsedResult);
  } catch (error: any) {
    if (!isAuthError(error)) {
      console.warn('Waste classification notice:', error?.message || error);
    }
    const body = await parseRequestBody(req).catch(() => ({}));
    return sendJson(res, 200, getComprehensiveWasteClassification(body?.query || 'waste item'));
  }
}

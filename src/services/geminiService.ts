import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  analysis: string;
  suggested_format: string;
  seo_filename: string;
  tags: string[];
  finora_note: string;
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  // Dinamik olarak her çağrıda yeni bir instance oluşturuyoruz (API Key güncelliği için)
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("API Anahtarı bulunamadı. Lütfen sistem ayarlarını kontrol edin.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-flash-latest"; // Daha stabil multimodal desteği için
  
  const systemInstruction = `Sen "Finora's Tool Bag" asistanısın. Görevin, kullanıcıların yüklediği görselleri analiz etmek, format dönüşümü öncesi/sonrası optimizasyon önerileri sunmak ve görselin içeriğine göre akıllı meta veriler (alt-text, başlık, etiket) üretmektir.

Capabilities:
- Görseldeki nesneleri ve metinleri tanımla.
- Görselin hangi platform (Instagram, Web, LinkedIn vb.) için en uygun formatta olduğunu öner.
- Dönüştürülen dosya için SEO uyumlu bir dosya ismi oluştur.
- Eğer kullanıcı "arka planı tarif et" derse, görseldeki kompozisyonu teknik terimlerle açıkla.

Tone: Profesyonel, yardımcı, teknoloji meraklısı ve hafif esprili (Finora karakterine uygun).

Output Format: Yanıtlarını her zaman şu JSON formatında ver:
{
  "analysis": "Görsel özeti",
  "suggested_format": "JPG/PNG/WebP",
  "seo_filename": "ornek-dosya-adi.jpg",
  "tags": ["etiket1", "etiket2"],
  "finora_note": "Kullanıcıya özel küçük bir ipucu"
}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Lütfen bu görseli analiz et ve istenen JSON formatında yanıt ver." },
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggested_format: { type: Type.STRING },
            seo_filename: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            finora_note: { type: Type.STRING }
          },
          required: ["analysis", "suggested_format", "seo_filename", "tags", "finora_note"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Modelden boş yanıt döndü.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis error details:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Geçersiz API anahtarı. Lütfen ayarları kontrol edin.");
    }
    throw new Error(error.message || "Görsel analiz edilemedi.");
  }
}

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Verse, PrayerCategory } from "../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const getVerseOfTheDay = async (theme?: string): Promise<Verse> => {
  const prompt = theme
    ? `Gere um versículo bíblico do dia baseado no tema "${theme}". Responda em Português do Brasil.`
    : "Gere um versículo bíblico poderoso e reconfortante para o dia de hoje. Responda em Português do Brasil.";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            text: { type: SchemaType.STRING },
            reference: { type: SchemaType.STRING },
          },
          required: ["text", "reference"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    return {
      text: data.text || "Alegrem-se na esperança, sejam pacientes na tribulação, perseverem na oração.",
      reference: data.reference || "Romanos 12:12",
      imageUrl: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=800"
    };
  } catch (error) {
    console.error("Erro ao gerar versículo:", error);
    return {
      text: "O Senhor é o meu pastor; nada me faltará.",
      reference: "Salmos 23:1",
      imageUrl: "https://images.unsplash.com/photo-1438109491414-7198515b166b?auto=format&fit=crop&q=80&w=800"
    };
  }
};

export const suggestPrayer = async (category: PrayerCategory): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`Forneça um pequeno texto de oração moderna para a categoria: ${category}. Responda em Português do Brasil. Máximo de 30 palavras.`);
    return result.response.text().trim();
  } catch (error) {
    return "Senhor, guia meus pensamentos e meu coração hoje.";
  }
};

export const getChatModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

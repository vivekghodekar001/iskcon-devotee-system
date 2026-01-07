
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GitaQuote } from "../types";

const FALLBACK_QUOTES: GitaQuote[] = [
  {
    verse: "karmany evadhikaras te ma phalesu kadacana\nma karma-phala-hetur bhur ma te sango 'stv akarmani",
    translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
    purport: "Krishna explains the art of working without attachment. Do your best in your service, but leave the outcome to Him. This frees you from anxiety and pride.",
    chapter: 2,
    text: 47
  },
  {
    verse: "man-mana bhava mad-bhakto mad-yaji mam namaskuru\nmam evaisyasi satyam te pratijane priyo 'si me",
    translation: "Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.",
    purport: "This is the essence of the Gita. Constant remembrance of Krishna through service and chanting is the surest way to reach Him.",
    chapter: 18,
    text: 65
  },
  {
    verse: "patram puspam phalam toyam yo me bhaktya prayacchati\ntad aham bhakty-upahrtam asnami prayatatmanah",
    translation: "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it.",
    purport: "Krishna accepts the love (bhakti) behind the offering, not the material value. Even the simplest offering made with a pure heart pleases Him.",
    chapter: 9,
    text: 26
  },
  {
    verse: "sarva-dharman parityajya mam ekam saranam vraja\naham tvam sarva-papebhyo moksayisyami ma sucah",
    translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    purport: "The ultimate conclusion of the Gita: Surrender to Krishna. He takes full responsibility for his devotee.",
    chapter: 18,
    text: 66
  }
];

export const getDailyGitaQuote = async (): Promise<GitaQuote | null> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Use fallback if no key is provided
    if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
      console.warn("No valid Gemini API key found. Using offline fallback.");
      return getRandomFallbackQuote();
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent("Generate a powerful and inspiring quote from the Bhagavad Gita for ISKCON devotees today. Return JSON with fields: verse, translation, purport, chapter (number), text (number).");
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Empty response");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching Gita quote (using fallback):", error);
    return getRandomFallbackQuote();
  }
};

export const getGitaAnswer = async (question: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
      return "I apologize, but I am currently in offline mode. Please add your (free) Gemini API key to settings to unlock my ability to answer specific questions from the Bhagavad Gita.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are an expert spiritual guide grounded strictly in the teachings of the Bhagavad Gita As It Is. Answer the user's question using ONLY the Bhagavad Gita. Cite specific chapters and verses (e.g., BG 2.47) for every main point you make. Keep answers concise, spiritual, uplifing, and relevant to modern life. If the question is unrelated to spirituality or the Gita, politely guide the user back to spiritual topics."
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating chat answer:", error);
    return "I am having trouble connecting to the divine knowledge right now. Please try again later.";
  }
};

export const generateQuiz = async (topic: string): Promise<any[]> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
      throw new Error("No API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Generate a 5-question multiple choice quiz about "${topic}" based on Bhagavad Gita teachings. 
    Return a JSON array of objects with fields: 
    - id (string)
    - question (string)
    - options (string array of 4 choices)
    - correctAnswer (number index 0-3)
    - explanation (short string)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Quiz Generation Failed", error);
    return [];
  }
};

const getRandomFallbackQuote = (): GitaQuote => {
  const index = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[index];
};

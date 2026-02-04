import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Platform, Category, ConsumptionObject } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

/**
 * Converts a File object to a Base64 string suitable for Gemini API.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes screenshots to extract transaction data.
 */
export const analyzeScreenshots = async (files: File[]): Promise<Transaction[]> => {
  if (!files || files.length === 0) return [];

  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = `
    你是一位专业的家庭理财会计。请分析这些支付截图（微信账单、支付宝账单、银行流水、电商订单等）。
    
    任务：
    1. 识别每一笔独立的交易。如果是列表截图，请提取列表中的每一项。
    2. 推断具体的消费内容。
    3. 识别交易平台。
    4. 归类交易类型。
    5. 金额必须为数字。
    6. 日期格式统一为 YYYY-MM-DD。
    7. **消费对象**：默认为“自己”。如果商品明显是童装、玩具，则推断为“女儿”；如果是老年用品，推断为“父母”。
    8. **备注**：如果截图中有特殊备注或详细规格（如颜色、尺码、套餐名），请提取到备注字段。

    请严格按照以下 JSON 格式返回数据数组：
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              amount: { type: Type.NUMBER, description: "Transaction amount" },
              merchant: { type: Type.STRING, description: "Name of the merchant or payee" },
              description: { type: Type.STRING, description: "Brief description of what was bought" },
              platform: { 
                type: Type.STRING, 
                enum: Object.values(Platform),
                description: "Payment platform"
              },
              category: { 
                type: Type.STRING, 
                enum: Object.values(Category),
                description: "Expense category"
              },
              consumptionObject: {
                type: Type.STRING,
                enum: Object.values(ConsumptionObject),
                description: "Who is this expense for?"
              },
              note: {
                type: Type.STRING,
                description: "Extra details or remarks"
              }
            },
            required: ["date", "amount", "merchant", "description", "platform", "category", "consumptionObject"],
          },
        },
      },
    });

    if (response.text) {
        const rawData = JSON.parse(response.text);
        // Add unique IDs and handle potential parsing nuances
        return rawData.map((item: any) => ({
            ...item,
            id: crypto.randomUUID(),
            // Fallback for consumptionObject if AI misses it despite schema
            consumptionObject: item.consumptionObject || ConsumptionObject.Self,
            note: item.note || ''
        }));
    }
    return [];

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw new Error("无法识别图片，请重试或检查图片清晰度。");
  }
};

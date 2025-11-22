import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

export interface ProductTool {
  name: string;
  description: string;
  parameters: any;
}

const getFAQData = () => {
  return [
    {
      category: "Products",
      questions: [
        { q: "Is your peanut butter organic?", a: "Yes! All our peanut butter varieties are made with certified organic peanuts sourced from sustainable farms." },
        { q: "How long does peanut butter last?", a: "Unopened jars can be stored for up to 5 months. Once opened, consume within 3 months for best quality." },
        { q: "Why does oil separate in natural peanut butter?", a: "Natural separation is normal! Since we don't use stabilizers, the natural peanut oil rises to the top. Simply stir before use." },
      ],
    },
    {
      category: "Shipping & Delivery",
      questions: [
        { q: "What are your shipping rates?", a: "We offer shipping for 40 rupees in INR." },
        { q: "How can I track my order?", a: "Track your order by logging into your account and viewing your order history." },
        { q: "Do you ship internationally?", a: "Currently, we only ship within India. International shipping coming soon!" },
        { q: "What if my order arrives damaged?", a: "Contact us within 48 hours with photos and we'll resolve it." },
      ],
    },
    {
      category: "Payment & Returns",
      questions: [
        { q: "What payment methods do you accept?", a: "We accept UPI, NetBanking, and all major debit/credit cards through our secure Cashfree payment gateway." },
        { q: "Is my payment information secure?", a: "Absolutely! We use industry-standard encryption through Cashfree." },
        { q: "What is your return policy?", a: "We offer a 5-day satisfaction guarantee for full refund or exchange." },
        { q: "How long does it take to receive a refund?", a: "Refunds are processed within 2-3 business days, plus 5-7 days for bank processing." },
      ],
    },
    {
      category: "Account & Orders",
      questions: [
        { q: "Do I need an account to place an order?", a: "Yes, sign in with Google to track orders and manage your wishlist." },
        { q: "How can I change my order after it's placed?", a: "Contact us immediately. We'll try to accommodate changes before shipping." },
        { q: "Can I cancel my order?", a: "Yes, within 24 hours of placing it. Contact us ASAP." },
        { q: "How do I update my account information?", a: "Log into Account Settings to update personal info and addresses." },
      ],
    },
  ];
};

export async function chatWithAssistant(
  messages: ChatMessage[],
  imageData?: { mimeType: string; data: string }
): Promise<{ response: string; products?: any[] }> {
  try {
    const products = await storage.getProducts();
    const faqs = getFAQData();

    const productContext = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.category,
      description: p.description,
      shortDescription: p.shortDescription,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      features: p.features,
      benefits: p.benefits,
      nutritionInfo: {
        protein: p.protein,
        calories: p.calories,
        fat: p.fat,
        carbs: p.carbs,
        ingredients: p.ingredients,
        weight: p.weight,
      }
    }));

    const systemPrompt = `You are the Ornut Assistant, a helpful AI shopping assistant for Ornut - an artisanal peanut butter brand from India. Your personality should be warm, friendly, enthusiastic, and knowledgeable about healthy eating and premium peanut products.

ABOUT ORNUT:
- Brand: Ornut - Premium Artisanal Peanut Butter from India
- Mission: Provide the highest quality, natural peanut butter with no artificial additives
- Key Values: 100% natural ingredients, no preservatives, sustainably sourced
- Squirrel Logo: Represents our fun, friendly, and health-conscious brand identity
- Product Categories: Smooth peanut butter, crunchy peanut butter, chocolate peanut butter

IMPORTANT GUIDELINES:
- Never mention that you are powered by Google, Gemini, or any other AI model
- Always refer to yourself as "Ornut Assistant" or just helping from "Ornut"
- Be conversational, helpful, knowledgeable about peanut butter, nutrition, and recipes
- Highlight Ornut's unique selling points: 100% natural, no preservatives, award-winning quality
- When users ask about products, provide detailed information from the AVAILABLE PRODUCTS below
- Match user needs with appropriate product variants (smooth for spreads, crunchy for texture, chocolate for treats)
- Use the FAQ data to answer common questions
- Suggest recipes and uses: smoothies, protein shakes, baking, toast, energy balls
- If a user uploads an image of food or recipe, suggest how Ornut peanut butter could complement it
- When recommending products, ALWAYS use the EXACT product ID from the catalog
- Be enthusiastic about health benefits but don't make medical claims
- Educate users about the benefits: high protein, healthy fats, vitamins, minerals
- If asked about topics outside peanut butter/nutrition/Ornut, politely redirect
- For support requests, provide: support@peanutproducts.in

AVAILABLE PRODUCTS (Fresh Data):
${JSON.stringify(productContext, null, 2)}

FREQUENTLY ASKED QUESTIONS:
${JSON.stringify(faqs, null, 2)}

PRODUCT RECOMMENDATION STRATEGY:
- For fitness enthusiasts: Recommend high-protein variants
- For daily breakfast: Smooth varieties for easy spreading
- For snacking: Crunchy for texture enjoyment
- For desserts: Chocolate variants
- Always mention specific product names and IDs for easy cart addition

TONE & PERSONALITY:
- Warm and approachable (like a helpful friend)
- Enthusiastic about nutrition and healthy living
- Professional yet conversational
- Patient with questions
- Always helpful and supportive

When responding with product recommendations:
1. Acknowledge user's need
2. Describe the perfect product(s) for them
3. Include product name and key benefits
4. Mention the product ID so UI can show "Add to Cart" button
5. Suggest how to use or complement with other foods`;

    const userMessage = messages[messages.length - 1];
    const conversationHistory = messages.slice(0, -1);

    let contents: any[] = [];
    
    if (imageData) {
      contents = [
        ...conversationHistory,
        {
          role: "user",
          parts: [
            { inlineData: imageData },
            ...(userMessage.parts || [])
          ]
        }
      ];
    } else {
      contents = messages;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        topP: 0.95,
      },
      contents: contents,
    });

    const responseText = response.text || "I'm sorry, I couldn't process that. Please try again.";

    // Extract product IDs mentioned in the response
    const mentionedProducts: any[] = [];
    products.forEach(product => {
      if (responseText.includes(product.id) || 
          responseText.toLowerCase().includes(product.name.toLowerCase())) {
        mentionedProducts.push(product);
      }
    });

    return {
      response: responseText,
      products: mentionedProducts.length > 0 ? mentionedProducts : undefined,
    };
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw new Error("Failed to process your request. Please try again.");
  }
}

export async function* chatWithAssistantStream(
  messages: ChatMessage[],
  imageData?: { mimeType: string; data: string }
) {
  try {
    const products = await storage.getProducts();
    const faqs = getFAQData();

    const productContext = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.category,
      description: p.description,
      shortDescription: p.shortDescription,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      features: p.features,
      benefits: p.benefits,
      nutritionInfo: {
        protein: p.protein,
        calories: p.calories,
        fat: p.fat,
        carbs: p.carbs,
        ingredients: p.ingredients,
        weight: p.weight,
      }
    }));

    const systemPrompt = `You are the Ornut Assistant, a helpful AI shopping assistant for Ornut - an artisanal peanut butter brand from India. Your personality should be warm, friendly, enthusiastic, and knowledgeable about healthy eating and premium peanut products.

ABOUT ORNUT:
- Brand: Ornut - Premium Artisanal Peanut Butter from India
- Mission: Provide the highest quality, natural peanut butter with no artificial additives
- Key Values: 100% natural ingredients, no preservatives, sustainably sourced
- Squirrel Logo: Represents our fun, friendly, and health-conscious brand identity
- Product Categories: Smooth peanut butter, crunchy peanut butter, chocolate peanut butter

IMPORTANT GUIDELINES:
- Never mention that you are powered by Google, Gemini, or any other AI model
- Always refer to yourself as "Ornut Assistant" or just helping from "Ornut"
- Be conversational, helpful, knowledgeable about peanut butter, nutrition, and recipes
- Highlight Ornut's unique selling points: 100% natural, no preservatives, award-winning quality
- When users ask about products, provide detailed information from the AVAILABLE PRODUCTS below
- Match user needs with appropriate product variants (smooth for spreads, crunchy for texture, chocolate for treats)
- Use the FAQ data to answer common questions
- Suggest recipes and uses: smoothies, protein shakes, baking, toast, energy balls
- If a user uploads an image of food or recipe, suggest how Ornut peanut butter could complement it
- When recommending products, ALWAYS use the EXACT product ID from the catalog
- Be enthusiastic about health benefits but don't make medical claims
- Educate users about the benefits: high protein, healthy fats, vitamins, minerals
- If asked about topics outside peanut butter/nutrition/Ornut, politely redirect
- For support requests, provide: support@peanutproducts.in

AVAILABLE PRODUCTS (Fresh Data):
${JSON.stringify(productContext, null, 2)}

FREQUENTLY ASKED QUESTIONS:
${JSON.stringify(faqs, null, 2)}

PRODUCT RECOMMENDATION STRATEGY:
- For fitness enthusiasts: Recommend high-protein variants
- For daily breakfast: Smooth varieties for easy spreading
- For snacking: Crunchy for texture enjoyment
- For desserts: Chocolate variants
- Always mention specific product names and IDs for easy cart addition

TONE & PERSONALITY:
- Warm and approachable (like a helpful friend)
- Enthusiastic about nutrition and healthy living
- Professional yet conversational
- Patient with questions
- Always helpful and supportive

When responding with product recommendations:
1. Acknowledge user's need
2. Describe the perfect product(s) for them
3. Include product name and key benefits
4. Mention the product ID so UI can show "Add to Cart" button
5. Suggest how to use or complement with other foods`;

    const userMessage = messages[messages.length - 1];
    const conversationHistory = messages.slice(0, -1);

    let contents: any[] = [];
    
    if (imageData) {
      contents = [
        ...conversationHistory,
        {
          role: "user",
          parts: [
            { inlineData: imageData },
            ...(userMessage.parts || [])
          ]
        }
      ];
    } else {
      contents = messages;
    }

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        topP: 0.95,
      },
      contents: contents,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const text = chunk.text || "";
      fullResponse += text;
      yield text;
    }

    // Extract product IDs mentioned in the response
    const mentionedProducts: any[] = [];
    products.forEach(product => {
      if (fullResponse.includes(product.id) || 
          fullResponse.toLowerCase().includes(product.name.toLowerCase())) {
        mentionedProducts.push(product);
      }
    });

    if (mentionedProducts.length > 0) {
      yield JSON.stringify({ type: "products", data: mentionedProducts });
    }
  } catch (error) {
    console.error("Gemini chat stream error:", error);
    throw error;
  }
}

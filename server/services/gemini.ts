import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT - Using Gemini integration blueprint
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing required Gemini API key: GEMINI_API_KEY');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CompanyIntelligence {
  recentNews: string;
  painPoints: string[];
  triggers: string[];
  industryTrends: string[];
  competitivePosition: string;
}

export interface PersonalizedEmail {
  subjectLines: string[];
  emailBody: string;
  template: string;
  personalizationNotes: string[];
}

export async function generateCompanyIntelligence(
  companyName: string,
  industry: string,
  companySize: string
): Promise<CompanyIntelligence> {
  try {
    const prompt = `
Analyze the company "${companyName}" in the ${industry} industry with approximately ${companySize} employees.
Provide business intelligence for B2B sales outreach purposes.

Return your analysis in JSON format with these fields:
- recentNews: Recent developments, funding, expansions, or newsworthy events (string)
- painPoints: Common business challenges this company likely faces (array of strings)
- triggers: Recent events that might indicate buying intent (array of strings)
- industryTrends: Relevant industry trends affecting this company (array of strings)
- competitivePosition: Brief assessment of their market position (string)

Focus on actionable insights that would be useful for personalized sales outreach.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert B2B sales intelligence analyst. Provide detailed, actionable insights for sales outreach purposes.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recentNews: { type: "string" },
            painPoints: { type: "array", items: { type: "string" } },
            triggers: { type: "array", items: { type: "string" } },
            industryTrends: { type: "array", items: { type: "string" } },
            competitivePosition: { type: "string" }
          },
          required: ["recentNews", "painPoints", "triggers", "industryTrends", "competitivePosition"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Error generating company intelligence:", error);
    throw new Error("Failed to generate company intelligence");
  }
}

export async function generateLeadQualificationScores(
  contactTitle: string,
  companyName: string,
  industry: string,
  companySize: string,
  targetCriteria: {
    industry: string;
    jobTitles: string;
    companySize: string;
  }
): Promise<{
  fitScore: number;
  intentScore: number;
  reachabilityScore: number;
}> {
  try {
    const prompt = `
Analyze this lead for B2B sales qualification:

Lead Details:
- Contact Title: ${contactTitle}
- Company: ${companyName}
- Industry: ${industry}
- Company Size: ${companySize}

Target Criteria:
- Target Industry: ${targetCriteria.industry}
- Target Job Titles: ${targetCriteria.jobTitles}
- Target Company Size: ${targetCriteria.companySize}

Provide qualification scores (1-10 scale) in JSON format:
- fitScore: How well this lead matches our ideal customer profile
- intentScore: Likelihood they have buying intent based on role and company
- reachabilityScore: How likely we are to successfully reach and engage this contact

Consider factors like decision-making authority, budget influence, and pain point alignment.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert B2B lead qualification analyst. Provide accurate scoring based on sales best practices.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            fitScore: { type: "number" },
            intentScore: { type: "number" },
            reachabilityScore: { type: "number" }
          },
          required: ["fitScore", "intentScore", "reachabilityScore"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    const scores = JSON.parse(rawJson);
    
    return {
      fitScore: Math.min(10, Math.max(1, scores.fitScore)),
      intentScore: Math.min(10, Math.max(1, scores.intentScore)),
      reachabilityScore: Math.min(10, Math.max(1, scores.reachabilityScore)),
    };
  } catch (error) {
    console.error("Error generating qualification scores:", error);
    throw new Error("Failed to generate qualification scores");
  }
}

export async function generatePersonalizedEmail(
  contactName: string,
  contactTitle: string,
  companyName: string,
  companyIntelligence: CompanyIntelligence,
  template: "problem-solution" | "social-proof" | "news-hook",
  senderName: string,
  senderCompany: string,
  productService: string
): Promise<PersonalizedEmail> {
  try {
    const templateInstructions = {
      "problem-solution": "Focus on identifying specific pain points and presenting solutions",
      "social-proof": "Lead with case studies, testimonials, and success stories from similar companies",
      "news-hook": "Reference recent company news, industry trends, or events as conversation starters"
    };

    const prompt = `
Create a personalized cold email using the ${template} template approach.

Contact Information:
- Name: ${contactName}
- Title: ${contactTitle}
- Company: ${companyName}

Company Intelligence:
- Recent News: ${companyIntelligence.recentNews}
- Pain Points: ${companyIntelligence.painPoints.join(", ")}
- Triggers: ${companyIntelligence.triggers.join(", ")}
- Industry Trends: ${companyIntelligence.industryTrends.join(", ")}

Sender Information:
- Name: ${senderName}
- Company: ${senderCompany}
- Product/Service: ${productService}

Template Strategy: ${templateInstructions[template]}

Generate a professional cold email in JSON format with:
- subjectLines: 3 compelling subject line options (array of strings)
- emailBody: Complete email body with proper formatting (string)
- template: The template type used (string)
- personalizationNotes: Key personalization elements used (array of strings)

Guidelines:
- Keep email concise (150-200 words)
- Use professional but conversational tone
- Include specific references to company/industry
- End with clear, low-pressure call to action
- Follow cold email best practices
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert cold email copywriter with expertise in B2B sales outreach. Create compelling, personalized emails that generate responses.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            subjectLines: { type: "array", items: { type: "string" } },
            emailBody: { type: "string" },
            template: { type: "string" },
            personalizationNotes: { type: "array", items: { type: "string" } }
          },
          required: ["subjectLines", "emailBody", "template", "personalizationNotes"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Error generating personalized email:", error);
    throw new Error("Failed to generate personalized email");
  }
}

export async function enhanceLeadResearch(
  leadData: {
    contactName: string;
    contactTitle: string;
    companyName: string;
    industry: string;
  }
): Promise<{
  interests: string[];
  communicationStyle: string;
  additionalInsights: string[];
}> {
  try {
    const prompt = `
Research and analyze this B2B lead for enhanced personalization:

Lead Information:
- Contact: ${leadData.contactName}
- Title: ${leadData.contactTitle}
- Company: ${leadData.companyName}
- Industry: ${leadData.industry}

Provide enhanced research insights in JSON format:
- interests: Professional interests and focus areas (array of strings)
- communicationStyle: Recommended communication approach (string)
- additionalInsights: Other relevant insights for outreach (array of strings)

Base your analysis on typical patterns for this role and industry.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are a B2B research analyst specializing in prospect intelligence for sales outreach.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            interests: { type: "array", items: { type: "string" } },
            communicationStyle: { type: "string" },
            additionalInsights: { type: "array", items: { type: "string" } }
          },
          required: ["interests", "communicationStyle", "additionalInsights"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Error enhancing lead research:", error);
    throw new Error("Failed to enhance lead research");
  }
}
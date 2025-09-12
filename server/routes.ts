import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadGenerationJobSchema, insertEmailCampaignSchema } from "@shared/schema";
import { startLeadGeneration } from "./services/leadGeneration";
import { generatePersonalizedEmail, generateCompanyIntelligence } from "./services/openai";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lead generation routes
  app.post("/api/lead-generation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertLeadGenerationJobSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user has sufficient credits (estimate 5-15 leads * 1 credit each)
      const estimatedCost = 15; // Maximum estimated cost
      if (user.credits < estimatedCost) {
        return res.status(400).json({ 
          message: "Insufficient credits",
          required: estimatedCost,
          available: user.credits 
        });
      }

      const job = await startLeadGeneration({
        industry: validatedData.industry!,
        companySize: validatedData.companySize!,
        location: validatedData.location!,
        jobTitles: validatedData.jobTitles!,
        userId,
      });

      res.json(job);
    } catch (error) {
      console.error("Error starting lead generation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start lead generation" });
    }
  });

  app.get("/api/lead-generation/:jobId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const job = await storage.getLeadGenerationJob(req.params.jobId);
      
      if (!job || job.userId !== userId) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Error fetching lead generation job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Leads routes
  app.get("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const leads = await storage.getLeads(userId, limit);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:leadId", isAuthenticated, async (req: any, res) => {
    try {
      const lead = await storage.getLeadById(req.params.leadId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Ensure user owns this lead
      if (lead.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Email generation routes
  app.post("/api/emails/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { leadId, template, senderName, senderCompany, productService } = req.body;

      // Check credits
      const EMAIL_GENERATION_COST = 1;
      if (user.credits < EMAIL_GENERATION_COST) {
        return res.status(400).json({ 
          message: "Insufficient credits",
          required: EMAIL_GENERATION_COST,
          available: user.credits 
        });
      }

      // Get lead data
      const lead = await storage.getLeadById(leadId);
      if (!lead || lead.userId !== userId) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Generate company intelligence if not already available
      let companyIntelligence;
      if (lead.companyRecentNews && lead.painPoints && lead.triggers) {
        companyIntelligence = {
          recentNews: lead.companyRecentNews,
          painPoints: lead.painPoints,
          triggers: lead.triggers,
          industryTrends: [],
          competitivePosition: "",
        };
      } else {
        companyIntelligence = await generateCompanyIntelligence(
          lead.companyName,
          lead.companyIndustry || "Technology",
          lead.companySize || "Unknown"
        );
      }

      // Generate personalized email
      const personalizedEmail = await generatePersonalizedEmail(
        lead.contactName,
        lead.contactTitle || "Decision Maker",
        lead.companyName,
        companyIntelligence,
        template || "problem-solution",
        senderName || "Sales Team",
        senderCompany || "Your Company",
        productService || "our solution"
      );

      // Create email campaign record
      const campaign = await storage.createEmailCampaign({
        userId,
        leadId,
        subjectLine: personalizedEmail.subjectLines[0],
        emailBody: personalizedEmail.emailBody,
        template: personalizedEmail.template,
        status: "draft",
      });

      // Deduct credits
      await storage.updateUserCredits(userId, user.credits - EMAIL_GENERATION_COST);

      // Create credit transaction
      await storage.createCreditTransaction({
        userId,
        type: "email_creation",
        amount: -EMAIL_GENERATION_COST,
        description: `Email generation for ${lead.contactName} at ${lead.companyName}`,
        campaignId: campaign.id,
      });

      res.json({
        campaign,
        personalizedEmail,
      });
    } catch (error) {
      console.error("Error generating email:", error);
      res.status(500).json({ message: "Failed to generate email" });
    }
  });

  // Email campaigns routes
  app.get("/api/campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaigns = await storage.getEmailCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/analytics/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getCreditTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // PayPal setup route
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  // PayPal order creation route
  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  // PayPal order capture route
  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Credit purchase routes
  app.post("/api/credits/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { credits } = req.body;
      
      if (!credits || credits <= 0) {
        return res.status(400).json({ message: "Invalid credit amount" });
      }

      // Store the pending purchase in metadata for PayPal
      res.json({ 
        success: true, 
        credits,
        amount: (credits * 0.10).toFixed(2), // $0.10 per credit
        userId 
      });
    } catch (error) {
      console.error("Error preparing credit purchase:", error);
      res.status(500).json({ message: "Failed to prepare credit purchase" });
    }
  });

  // PayPal payment confirmation route
  app.post("/api/credits/confirm-payment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { credits, orderId } = req.body;

      if (!credits || !orderId) {
        return res.status(400).json({ message: "Missing payment data" });
      }

      const user = await storage.getUser(userId);
      if (user) {
        // Add credits to user account
        const newCredits = user.credits + parseInt(credits);
        await storage.updateUserCredits(userId, newCredits);

        // Record transaction
        await storage.createCreditTransaction({
          userId,
          type: "purchase",
          amount: parseInt(credits),
          description: `Credit purchase via PayPal: ${credits} credits (Order: ${orderId})`,
        });

        res.json({ 
          success: true, 
          newBalance: newCredits,
          transaction: `Added ${credits} credits`
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("PayPal payment confirmation error:", error);
      res.status(500).json({ message: "Payment confirmation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

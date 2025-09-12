import {
  users,
  leads,
  emailCampaigns,
  creditTransactions,
  leadGenerationJobs,
  type User,
  type UpsertUser,
  type Lead,
  type InsertLead,
  type EmailCampaign,
  type InsertEmailCampaign,
  type CreditTransaction,
  type InsertCreditTransaction,
  type LeadGenerationJob,
  type InsertLeadGenerationJob,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser & { id: string }): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(userId: string, limit?: number): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  updateLeadStatus(id: string, status: string): Promise<Lead>;
  
  // Email campaign operations
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  getEmailCampaigns(userId: string): Promise<EmailCampaign[]>;
  updateCampaignStatus(id: string, status: string, timestamp?: Date): Promise<EmailCampaign>;
  
  // Credit transaction operations
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getCreditTransactions(userId: string): Promise<CreditTransaction[]>;
  
  // Lead generation job operations
  createLeadGenerationJob(job: InsertLeadGenerationJob): Promise<LeadGenerationJob>;
  getLeadGenerationJob(id: string): Promise<LeadGenerationJob | undefined>;
  updateLeadGenerationJob(id: string, updates: Partial<LeadGenerationJob>): Promise<LeadGenerationJob>;
  getActiveLeadGenerationJobs(userId: string): Promise<LeadGenerationJob[]>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    totalLeads: number;
    responseRate: number;
    activeCampaigns: number;
    creditsUsed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser & { id: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        credits: 25, // Signup bonus for new users
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
          // Explicitly don't update credits to preserve existing balance
        },
      })
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Lead operations
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values([lead]).returning();
    return newLead;
  }

  async getLeads(userId: string, limit = 50): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt))
      .limit(limit);
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  // Email campaign operations
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [newCampaign] = await db.insert(emailCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async getEmailCampaigns(userId: string): Promise<EmailCampaign[]> {
    return await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.userId, userId))
      .orderBy(desc(emailCampaigns.createdAt));
  }

  async updateCampaignStatus(id: string, status: string, timestamp?: Date): Promise<EmailCampaign> {
    const updates: any = { status, updatedAt: new Date() };
    
    if (status === "sent" && timestamp) {
      updates.sentAt = timestamp;
    } else if (status === "opened" && timestamp) {
      updates.openedAt = timestamp;
    } else if (status === "replied" && timestamp) {
      updates.repliedAt = timestamp;
    }

    const [campaign] = await db
      .update(emailCampaigns)
      .set(updates)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return campaign;
  }

  // Credit transaction operations
  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db.insert(creditTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  // Lead generation job operations
  async createLeadGenerationJob(job: InsertLeadGenerationJob): Promise<LeadGenerationJob> {
    const [newJob] = await db.insert(leadGenerationJobs).values(job).returning();
    return newJob;
  }

  async getLeadGenerationJob(id: string): Promise<LeadGenerationJob | undefined> {
    const [job] = await db.select().from(leadGenerationJobs).where(eq(leadGenerationJobs.id, id));
    return job;
  }

  async updateLeadGenerationJob(id: string, updates: Partial<LeadGenerationJob>): Promise<LeadGenerationJob> {
    const [job] = await db
      .update(leadGenerationJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leadGenerationJobs.id, id))
      .returning();
    return job;
  }

  async getActiveLeadGenerationJobs(userId: string): Promise<LeadGenerationJob[]> {
    return await db
      .select()
      .from(leadGenerationJobs)
      .where(
        and(
          eq(leadGenerationJobs.userId, userId),
          sql`${leadGenerationJobs.status} IN ('pending', 'processing')`
        )
      )
      .orderBy(desc(leadGenerationJobs.createdAt));
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalLeads: number;
    responseRate: number;
    activeCampaigns: number;
    creditsUsed: number;
  }> {
    const [totalLeadsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.userId, userId));

    const [totalCampaignsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailCampaigns)
      .where(eq(emailCampaigns.userId, userId));

    const [repliedCampaignsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailCampaigns)
      .where(
        and(
          eq(emailCampaigns.userId, userId),
          eq(emailCampaigns.status, "replied")
        )
      );

    const [activeCampaignsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailCampaigns)
      .where(
        and(
          eq(emailCampaigns.userId, userId),
          sql`${emailCampaigns.status} IN ('sent', 'delivered', 'opened')`
        )
      );

    const [creditsUsedResult] = await db
      .select({ total: sql<number>`coalesce(sum(abs(${creditTransactions.amount})), 0)` })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          sql`${creditTransactions.amount} < 0`
        )
      );

    const totalLeads = totalLeadsResult.count;
    const totalCampaigns = totalCampaignsResult.count;
    const repliedCampaigns = repliedCampaignsResult.count;
    const activeCampaigns = activeCampaignsResult.count;
    const creditsUsed = creditsUsedResult.total;

    const responseRate = totalCampaigns > 0 ? (repliedCampaigns / totalCampaigns) * 100 : 0;

    return {
      totalLeads,
      responseRate: Math.round(responseRate * 10) / 10, // Round to 1 decimal place
      activeCampaigns,
      creditsUsed,
    };
  }
}

export const storage = new DatabaseStorage();

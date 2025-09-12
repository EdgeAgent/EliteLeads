import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  credits: integer("credits").default(0),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Contact information
  contactName: text("contact_name").notNull(),
  contactTitle: text("contact_title"),
  contactEmail: varchar("contact_email"),
  contactLinkedin: varchar("contact_linkedin"),
  contactTenure: text("contact_tenure"),
  
  // Company information
  companyName: text("company_name").notNull(),
  companyIndustry: text("company_industry"),
  companySize: text("company_size"),
  companyLocation: text("company_location"),
  companyWebsite: varchar("company_website"),
  companyRecentNews: text("company_recent_news"),
  
  // Intelligence data
  painPoints: jsonb("pain_points").$type<string[]>(),
  triggers: jsonb("triggers").$type<string[]>(),
  interests: jsonb("interests").$type<string[]>(),
  communicationStyle: text("communication_style"),
  
  // Qualification scores
  fitScore: decimal("fit_score", { precision: 3, scale: 1 }),
  intentScore: decimal("intent_score", { precision: 3, scale: 1 }),
  reachabilityScore: decimal("reachability_score", { precision: 3, scale: 1 }),
  totalScore: decimal("total_score", { precision: 3, scale: 1 }),
  
  // Status and metadata
  status: text("status").default("new"), // new, contacted, responded, converted
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email campaigns table
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  
  // Email content
  subjectLine: text("subject_line").notNull(),
  emailBody: text("email_body").notNull(),
  template: text("template"), // problem-solution, social-proof, news-hook
  
  // Campaign metadata
  status: text("status").default("draft"), // draft, sent, delivered, opened, replied
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit transactions table
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  type: text("type").notNull(), // purchase, lead_generation, email_creation, refund
  amount: integer("amount").notNull(), // positive for credits added, negative for credits used
  description: text("description"),
  
  // Reference to related entities
  leadId: varchar("lead_id").references(() => leads.id),
  campaignId: varchar("campaign_id").references(() => emailCampaigns.id),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead generation jobs table (for tracking async operations)
export const leadGenerationJobs = pgTable("lead_generation_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Search parameters
  industry: text("industry"),
  companySize: text("company_size"),
  location: text("location"),
  jobTitles: text("job_titles"),
  
  // Job status
  status: text("status").default("pending"), // pending, processing, completed, failed
  progress: integer("progress").default(0), // 0-100
  totalLeads: integer("total_leads").default(0),
  creditsUsed: integer("credits_used").default(0),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertLeadGenerationJobSchema = createInsertSchema(leadGenerationJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertLeadGenerationJob = z.infer<typeof insertLeadGenerationJobSchema>;
export type LeadGenerationJob = typeof leadGenerationJobs.$inferSelect;

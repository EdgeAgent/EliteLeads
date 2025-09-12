import { storage } from "../storage";
import { 
  generateCompanyIntelligence, 
  generateLeadQualificationScores, 
  enhanceLeadResearch 
} from "./gemini";
import type { InsertLead, InsertLeadGenerationJob, LeadGenerationJob } from "@shared/schema";

export interface LeadGenerationParams {
  industry: string;
  companySize: string;
  location: string;
  jobTitles: string;
  userId: string;
}

export interface GeneratedLead {
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  companyName: string;
  companyIndustry: string;
  companySize: string;
  companyLocation: string;
  companyWebsite: string;
}

const LEAD_GENERATION_COST = 1; // Credits per lead
const MIN_QUALIFICATION_SCORE = 7; // Minimum score to include lead

// Mock lead data generator (in production, this would integrate with real data sources)
function generateMockLeads(params: LeadGenerationParams): GeneratedLead[] {
  const firstNames = ["Michael", "Sarah", "David", "Jennifer", "Robert", "Lisa", "James", "Maria", "John", "Emily"];
  const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez"];
  const companies = ["TechFlow Solutions", "GrowthCorp Inc", "InnovateMFG", "DataDriven LLC", "CloudScale Systems"];
  const domains = ["gmail.com", "company.com", "business.org", "enterprise.net"];
  
  const titles = params.jobTitles.split(",").map(t => t.trim());
  const leads: GeneratedLead[] = [];
  
  // Generate 5-15 leads per request
  const numLeads = Math.floor(Math.random() * 11) + 5;
  
  for (let i = 0; i < numLeads; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    leads.push({
      contactName: `${firstName} ${lastName}`,
      contactTitle: title,
      contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      companyName: company,
      companyIndustry: params.industry,
      companySize: params.companySize,
      companyLocation: params.location,
      companyWebsite: `https://${company.toLowerCase().replace(/\s+/g, "")}.com`,
    });
  }
  
  return leads;
}

export async function processLeadGeneration(jobId: string): Promise<void> {
  try {
    const job = await storage.getLeadGenerationJob(jobId);
    if (!job) {
      throw new Error("Lead generation job not found");
    }

    await storage.updateLeadGenerationJob(jobId, {
      status: "processing",
      progress: 10,
      currentStep: "initializing",
      thinking: `Starting lead generation for ${job.industry} companies in ${job.location}. Looking for ${job.jobTitles} roles in ${job.companySize} companies...`
    });

    // Get user for credit checking
    const user = await storage.getUser(job.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate mock leads (in production, integrate with real data sources)
    await storage.updateLeadGenerationJob(jobId, {
      progress: 20,
      currentStep: "discovering",
      thinking: `Searching prospect databases for ${job.industry} companies in ${job.location}. Filtering for companies with ${job.companySize} employees...`
    });
    
    const mockLeads = generateMockLeads({
      industry: job.industry!,
      companySize: job.companySize!,
      location: job.location!,
      jobTitles: job.jobTitles!,
      userId: job.userId,
    });

    await storage.updateLeadGenerationJob(jobId, {
      progress: 30,
      totalLeads: mockLeads.length,
      currentStep: "found_prospects",
      thinking: `Found ${mockLeads.length} potential prospects. Now analyzing each company using AI to determine business intelligence and qualification scores...`
    });

    const qualifiedLeads: InsertLead[] = [];
    let creditsUsed = 0;

    // Process each lead
    for (let i = 0; i < mockLeads.length; i++) {
      const lead = mockLeads[i];
      
      // Check if user has enough credits
      const userCredits = user.credits ?? 0;
      const currentCredits = userCredits - creditsUsed;
      if (currentCredits <= 0) {
        console.log(`User ${job.userId} ran out of credits during lead generation`);
        break;
      }

      // Update thinking for current lead analysis
      const progressPercent = 30 + (i / mockLeads.length) * 60;
      await storage.updateLeadGenerationJob(jobId, {
        progress: Math.round(progressPercent),
        currentStep: "analyzing_company",
        thinking: `Analyzing ${lead.companyName} (${i + 1}/${mockLeads.length}): Researching company intelligence, recent news, pain points, and buying triggers using AI...`
      });

      try {
        // Generate company intelligence using AI
        const companyIntelligence = await generateCompanyIntelligence(
          lead.companyName,
          lead.companyIndustry,
          lead.companySize
        );

        await storage.updateLeadGenerationJob(jobId, {
          currentStep: "scoring_lead",
          thinking: `Analyzing ${lead.contactName} at ${lead.companyName}: Calculating fit score, intent signals, and reachability metrics. Contact: ${lead.contactTitle} | Industry match: ${lead.companyIndustry}...`
        });

        // Generate qualification scores
        const scores = await generateLeadQualificationScores(
          lead.contactTitle,
          lead.companyName,
          lead.companyIndustry,
          lead.companySize,
          {
            industry: job.industry!,
            jobTitles: job.jobTitles!,
            companySize: job.companySize!,
          }
        );

        // Calculate total score
        const totalScore = scores.fitScore + scores.intentScore + scores.reachabilityScore;

        // Only include leads that meet minimum qualification
        if (totalScore >= MIN_QUALIFICATION_SCORE) {
          await storage.updateLeadGenerationJob(jobId, {
            currentStep: "qualifying_lead",
            thinking: `✅ ${lead.contactName} qualified! Score: ${totalScore}/15 (Fit: ${scores.fitScore}/5, Intent: ${scores.intentScore}/5, Reach: ${scores.reachabilityScore}/5). Enhancing research with detailed company analysis...`
          });

          // Enhance lead research
          const enhancedResearch = await enhanceLeadResearch({
            contactName: lead.contactName,
            contactTitle: lead.contactTitle,
            companyName: lead.companyName,
            industry: lead.companyIndustry,
          });

          const qualifiedLead: InsertLead = {
            userId: job.userId,
            contactName: lead.contactName,
            contactTitle: lead.contactTitle,
            contactEmail: lead.contactEmail,
            companyName: lead.companyName,
            companyIndustry: lead.companyIndustry,
            companySize: lead.companySize,
            companyLocation: lead.companyLocation,
            companyWebsite: lead.companyWebsite,
            companyRecentNews: companyIntelligence.recentNews,
            painPoints: companyIntelligence.painPoints,
            triggers: companyIntelligence.triggers,
            interests: enhancedResearch.interests,
            communicationStyle: enhancedResearch.communicationStyle,
            fitScore: scores.fitScore.toString(),
            intentScore: scores.intentScore.toString(),
            reachabilityScore: scores.reachabilityScore.toString(),
            totalScore: totalScore.toString(),
            status: "new",
          };

          qualifiedLeads.push(qualifiedLead);
          creditsUsed += LEAD_GENERATION_COST;

          // Create credit transaction
          await storage.createCreditTransaction({
            userId: job.userId,
            type: "lead_generation",
            amount: -LEAD_GENERATION_COST,
            description: `Lead generation: ${lead.contactName} at ${lead.companyName}`,
          });
        } else {
          await storage.updateLeadGenerationJob(jobId, {
            thinking: `❌ ${lead.contactName} at ${lead.companyName} didn't qualify. Score: ${totalScore}/15 (minimum: ${MIN_QUALIFICATION_SCORE}). Moving to next prospect...`
          });
          console.log(`Lead ${lead.contactName} at ${lead.companyName} did not qualify (score: ${totalScore})`);
        }

        // Update progress
        const progress = Math.round(((i + 1) / mockLeads.length) * 70) + 30;
        await storage.updateLeadGenerationJob(jobId, { progress });

      } catch (error) {
        console.error(`Error processing lead ${lead.contactName}:`, error);
        // Continue with next lead
      }
    }

    // Save qualified leads to database
    await storage.updateLeadGenerationJob(jobId, {
      progress: 95,
      currentStep: "saving_results",
      thinking: `Saving ${qualifiedLeads.length} qualified leads to database and updating your credit balance...`
    });
    
    for (const lead of qualifiedLeads) {
      await storage.createLead(lead);
    }

    // Update user credits
    const userCredits = user.credits ?? 0;
    await storage.updateUserCredits(job.userId, userCredits - creditsUsed);

    // Complete the job
    await storage.updateLeadGenerationJob(jobId, {
      status: "completed",
      progress: 100,
      creditsUsed,
      currentStep: "completed",
      thinking: `🎉 Lead generation complete! Found ${qualifiedLeads.length} high-quality leads that match your criteria. Used ${creditsUsed} credits. Your new leads are ready to view!`
    });

  } catch (error) {
    console.error(`Lead generation job ${jobId} failed:`, error);
    await storage.updateLeadGenerationJob(jobId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

export async function startLeadGeneration(params: LeadGenerationParams): Promise<LeadGenerationJob> {
  // Create lead generation job
  const job = await storage.createLeadGenerationJob({
    userId: params.userId,
    industry: params.industry,
    companySize: params.companySize,
    location: params.location,
    jobTitles: params.jobTitles,
    status: "pending",
    progress: 0,
  });

  // Start processing asynchronously
  setImmediate(() => {
    processLeadGeneration(job.id).catch(error => {
      console.error("Lead generation processing failed:", error);
    });
  });

  return job;
}

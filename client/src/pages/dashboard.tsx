import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import StatsGrid from "@/components/stats-grid";
import LeadGenerationForm from "@/components/lead-generation-form";
import RecentActivity from "@/components/recent-activity";
import LeadsTable from "@/components/leads-table";
import PerformanceChart from "@/components/performance-chart";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    enabled: isAuthenticated,
  });
  
  const { data: recentLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border lg:hidden">
          <div className="flex-1 flex justify-between px-4 items-center">
            <h1 className="text-lg font-semibold text-foreground">eliteleads.pro</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-primary">
                {stats?.creditsUsed || 0} credits
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                    Dashboard
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Welcome back! Here's your lead generation overview.
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                  <Button variant="outline" data-testid="button-export">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button data-testid="button-generate-leads">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Leads
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <StatsGrid stats={stats} isLoading={statsLoading} />

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <LeadGenerationForm />
                <RecentActivity />
              </div>

              {/* Recent Leads Table */}
              <LeadsTable 
                leads={recentLeads?.slice(0, 5) || []} 
                isLoading={leadsLoading} 
              />

              {/* Analytics Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <PerformanceChart />
                
                {/* Top Performing Industries */}
                <div className="bg-card shadow-sm rounded-lg border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Top Industries</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Best performing target segments</p>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {[
                        { name: "SaaS & Software", rate: "5.2%", color: "success-gradient" },
                        { name: "Professional Services", rate: "4.7%", color: "credit-gradient" },
                        { name: "Manufacturing", rate: "3.9%", color: "warning-gradient" },
                        { name: "Healthcare", rate: "3.4%", color: "bg-slate-400" },
                        { name: "Financial Services", rate: "2.8%", color: "bg-gray-400" },
                      ].map((industry, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${industry.color}`}></div>
                            <span className="text-sm font-medium text-foreground">{industry.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">{industry.rate}</div>
                            <div className="text-xs text-muted-foreground">response rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

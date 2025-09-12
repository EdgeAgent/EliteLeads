import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, RefreshCw, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface LeadGenerationJob {
  id: string;
  industry: string;
  companySize: string;
  location: string;
  jobTitles: string;
  status: string;
  progress: number;
  totalLeads: number;
  creditsUsed: number;
  errorMessage?: string;
  createdAt: string;
}

export default function LeadGeneration() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    industry: "",
    companySize: "",
    location: "",
    jobTitles: "",
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

  const { data: activeJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/lead-generation", "active"],
    queryFn: async () => {
      const response = await fetch("/api/lead-generation/active", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 5000, // Poll every 5 seconds for active jobs
  });

  const leadGenerationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/lead-generation", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Lead Generation Started",
        description: `Processing your request. Job ID: ${data.id}`,
      });
      setFormData({
        industry: "",
        companySize: "",
        location: "",
        jobTitles: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lead-generation"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to start lead generation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.industry || !formData.companySize || !formData.jobTitles) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    leadGenerationMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border lg:hidden">
          <div className="flex-1 flex justify-between px-4 items-center">
            <h1 className="text-lg font-semibold text-foreground">Lead Generation</h1>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                    Lead Generation
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate high-quality B2B leads with AI-powered research and qualification.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Lead Generation Form */}
                <div className="xl:col-span-2">
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="flex items-center">
                        <Search className="mr-2 h-5 w-5" />
                        Generate New Leads
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Define your target criteria to find qualified prospects
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-lead-generation">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="industry">Target Industry *</Label>
                            <Select 
                              value={formData.industry} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                            >
                              <SelectTrigger data-testid="select-industry">
                                <SelectValue placeholder="Select target industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SaaS & Software">SaaS & Software</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Professional Services">Professional Services</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Financial Services">Financial Services</SelectItem>
                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                <SelectItem value="Real Estate">Real Estate</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Consulting">Consulting</SelectItem>
                                <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="company-size">Company Size *</Label>
                            <Select 
                              value={formData.companySize} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}
                            >
                              <SelectTrigger data-testid="select-company-size">
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10 employees">1-10 employees (Startup)</SelectItem>
                                <SelectItem value="11-50 employees">11-50 employees (Small)</SelectItem>
                                <SelectItem value="51-200 employees">51-200 employees (Medium)</SelectItem>
                                <SelectItem value="201-1000 employees">201-1000 employees (Large)</SelectItem>
                                <SelectItem value="1000+ employees">1000+ employees (Enterprise)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="location">Geographic Location</Label>
                          <Input 
                            type="text" 
                            id="location"
                            placeholder="e.g., San Francisco Bay Area, New York, United States, Europe" 
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            data-testid="input-location"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Leave blank to search globally
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="job-titles">Target Job Titles *</Label>
                          <Input 
                            type="text" 
                            id="job-titles"
                            placeholder="CEO, CTO, VP Marketing, Head of Sales, Founder" 
                            value={formData.jobTitles}
                            onChange={(e) => setFormData(prev => ({ ...prev, jobTitles: e.target.value }))}
                            data-testid="input-job-titles"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Separate multiple titles with commas
                          </p>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Estimated cost: <span className="font-medium text-foreground">5-15 credits</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Final cost depends on leads found and qualified
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            disabled={leadGenerationMutation.isPending}
                            className="px-8"
                            data-testid="button-start-generation"
                          >
                            {leadGenerationMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Start Generation
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Jobs Panel */}
                <div>
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <RefreshCw className="mr-2 h-5 w-5" />
                          Active Jobs
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/lead-generation"] })}
                          data-testid="button-refresh-jobs"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Monitor your lead generation progress
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      {jobsLoading ? (
                        <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-muted rounded mb-2"></div>
                              <div className="h-2 bg-muted rounded mb-2"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : !activeJobs || activeJobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="mx-auto h-8 w-8 mb-3 opacity-50" />
                          <p className="font-medium">No active jobs</p>
                          <p className="text-sm">Start a lead generation to see progress here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeJobs.map((job: LeadGenerationJob) => (
                            <div key={job.id} className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(job.status)}
                                  <span className="text-sm font-medium text-foreground">
                                    {job.industry}
                                  </span>
                                </div>
                                {getStatusBadge(job.status)}
                              </div>
                              
                              <div className="text-xs text-muted-foreground mb-2">
                                {job.jobTitles} • {job.companySize}
                                {job.location && ` • ${job.location}`}
                              </div>

                              {job.status === "processing" && (
                                <div className="mb-2">
                                  <Progress value={job.progress} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{job.progress}% complete</span>
                                    <span>{job.totalLeads} leads found</span>
                                  </div>
                                </div>
                              )}

                              {job.status === "completed" && (
                                <div className="text-xs text-muted-foreground">
                                  Generated {job.totalLeads} leads • {job.creditsUsed} credits used
                                </div>
                              )}

                              {job.status === "failed" && job.errorMessage && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                                  {job.errorMessage}
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground mt-2">
                                Started {new Date(job.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

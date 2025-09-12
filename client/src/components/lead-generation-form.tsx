import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function LeadGenerationForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    industry: "",
    companySize: "",
    location: "",
    jobTitles: "",
  });

  const leadGenerationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/lead-generation", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Lead Generation Started",
        description: `Job created successfully. Processing ${data.totalLeads || 'your'} leads...`,
      });
      // Reset form
      setFormData({
        industry: "",
        companySize: "",
        location: "",
        jobTitles: "",
      });
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

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle>Quick Lead Generation</CardTitle>
        <p className="text-sm text-muted-foreground">Generate qualified leads with AI-powered research</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-lead-generation">
          <div>
            <Label htmlFor="industry">Target Industry *</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
            >
              <SelectTrigger data-testid="select-industry">
                <SelectValue placeholder="Select industry" />
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
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-size">Company Size *</Label>
              <Select 
                value={formData.companySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}
              >
                <SelectTrigger data-testid="select-company-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50 employees">1-50 employees</SelectItem>
                  <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                  <SelectItem value="201-1000 employees">201-1000 employees</SelectItem>
                  <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                type="text" 
                id="location"
                placeholder="e.g., San Francisco" 
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                data-testid="input-location"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="job-titles">Target Job Titles *</Label>
            <Input 
              type="text" 
              id="job-titles"
              placeholder="CEO, CTO, VP Marketing" 
              value={formData.jobTitles}
              onChange={(e) => setFormData(prev => ({ ...prev, jobTitles: e.target.value }))}
              data-testid="input-job-titles"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Cost: <span className="font-medium text-foreground">~5-15 credits</span>
            </div>
            <Button 
              type="submit" 
              disabled={leadGenerationMutation.isPending}
              data-testid="button-generate-leads-form"
            >
              {leadGenerationMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Generate Leads
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

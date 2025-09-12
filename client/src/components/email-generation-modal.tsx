import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Lead {
  id: string;
  contactName: string;
  contactTitle: string;
  companyName: string;
  companyIndustry: string;
}

interface EmailGenerationModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const templates = [
  {
    id: "problem-solution",
    name: "Problem/Solution",
    description: "Focus on pain points and solutions",
  },
  {
    id: "social-proof",
    name: "Social Proof",
    description: "Lead with case studies and testimonials",
  },
  {
    id: "news-hook",
    name: "News Hook",
    description: "Reference recent company news or events",
  },
];

export default function EmailGenerationModal({ lead, isOpen, onClose }: EmailGenerationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState("problem-solution");
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);

  const emailGenerationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/emails/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedEmail(data.personalizedEmail);
      toast({
        title: "Email Generated",
        description: "Your personalized email has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: error.message || "Failed to generate email",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!lead) return;

    emailGenerationMutation.mutate({
      leadId: lead.id,
      template: selectedTemplate,
      senderName: "Sales Team",
      senderCompany: "Your Company",
      productService: "our solution",
    });
  };

  const handleClose = () => {
    setGeneratedEmail(null);
    setSelectedTemplate("problem-solution");
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-email-generation">
        <DialogHeader>
          <DialogTitle>Generate Personalized Email</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Creating email for {lead.contactName} at {lead.companyName}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Choose Template</h4>
            <div className="space-y-3">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                  data-testid={`template-${template.id}`}
                >
                  <CardContent className="p-3">
                    <div className="font-medium text-foreground">{template.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Email Preview</h4>
            <Card className="h-96">
              <CardContent className="p-4 h-full overflow-y-auto bg-muted/50">
                {emailGenerationMutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Generating personalized email...</p>
                    </div>
                  </div>
                ) : generatedEmail ? (
                  <div className="text-sm space-y-3">
                    <div>
                      <strong>Subject:</strong> {generatedEmail.subjectLines[0]}
                    </div>
                    <div className="border-t border-border pt-3 whitespace-pre-wrap">
                      {generatedEmail.emailBody}
                    </div>
                    {generatedEmail.subjectLines.length > 1 && (
                      <div className="border-t border-border pt-3">
                        <strong>Alternative Subject Lines:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {generatedEmail.subjectLines.slice(1).map((subject: string, index: number) => (
                            <li key={index} className="text-muted-foreground">{subject}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <p className="text-muted-foreground">Select a template and click "Generate Email" to create your personalized message.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Cost: <span className="font-medium text-foreground">1 credit</span>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={emailGenerationMutation.isPending}
              data-testid="button-generate-email"
            >
              {emailGenerationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Email"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

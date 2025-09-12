import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Eye, ArrowRight } from "lucide-react";
import { useState } from "react";
import EmailGenerationModal from "./email-generation-modal";

interface Lead {
  id: string;
  contactName: string;
  contactTitle: string;
  companyName: string;
  companyIndustry: string;
  companySize: string;
  fitScore: string;
  intentScore: string;
  reachabilityScore: string;
  status: string;
}

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
}

export default function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleGenerateEmail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEmailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Ready to Contact</Badge>;
      case "contacted":
        return <Badge variant="outline">Contacted</Badge>;
      case "responded":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Responded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreBadge = (score: string, type: "fit" | "intent") => {
    const numScore = parseFloat(score);
    const variant = numScore >= 8 ? "default" : numScore >= 6 ? "secondary" : "outline";
    const color = numScore >= 8 ? "bg-green-100 text-green-800" : numScore >= 6 ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800";
    
    return (
      <Badge className={color}>
        {type === "fit" ? "Fit" : "Intent"}: {numScore.toFixed(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-border mb-8">
        <CardHeader className="border-b border-border">
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border border-border mb-8">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <p className="text-sm text-muted-foreground">Latest prospects with qualification scores</p>
            </div>
            <Button variant="link" className="text-primary hover:text-primary/80" data-testid="button-view-all-leads">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads yet</h3>
              <p>Generate your first leads to see them here</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {lead.contactName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground" data-testid={`text-contact-name-${lead.id}`}>
                              {lead.contactName}
                            </div>
                            <div className="text-sm text-muted-foreground">{lead.contactTitle}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{lead.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.companyIndustry} • {lead.companySize}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getScoreBadge(lead.fitScore, "fit")}
                          {getScoreBadge(lead.intentScore, "intent")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleGenerateEmail(lead)}
                            data-testid={`button-generate-email-${lead.id}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-testid={`button-view-profile-${lead.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EmailGenerationModal
        lead={selectedLead}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedLead(null);
        }}
      />
    </>
  );
}

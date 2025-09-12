import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Eye, MoreHorizontal, Search, Filter, Calendar } from "lucide-react";

interface EmailCampaign {
  id: string;
  subjectLine: string;
  emailBody: string;
  template: string;
  status: string;
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function Campaigns() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");

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

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "opened":
        return <Badge className="bg-yellow-100 text-yellow-800">Opened</Badge>;
      case "replied":
        return <Badge className="bg-green-100 text-green-800">Replied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTemplateLabel = (template: string) => {
    switch (template) {
      case "problem-solution":
        return "Problem/Solution";
      case "social-proof":
        return "Social Proof";
      case "news-hook":
        return "News Hook";
      default:
        return template;
    }
  };

  const filteredCampaigns = campaigns?.filter((campaign: EmailCampaign) => {
    const matchesSearch = campaign.subjectLine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesTemplate = templateFilter === "all" || campaign.template === templateFilter;
    return matchesSearch && matchesStatus && matchesTemplate;
  }) || [];

  const campaignStats = {
    total: campaigns?.length || 0,
    draft: campaigns?.filter((c: EmailCampaign) => c.status === "draft").length || 0,
    sent: campaigns?.filter((c: EmailCampaign) => c.status === "sent").length || 0,
    opened: campaigns?.filter((c: EmailCampaign) => c.openedAt).length || 0,
    replied: campaigns?.filter((c: EmailCampaign) => c.repliedAt).length || 0,
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
            <h1 className="text-lg font-semibold text-foreground">Email Campaigns</h1>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                  Email Campaigns
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage and monitor your personalized email campaigns.
                </p>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{campaignStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{campaignStats.sent}</div>
                    <div className="text-sm text-muted-foreground">Sent</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{campaignStats.opened}</div>
                    <div className="text-sm text-muted-foreground">Opened</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{campaignStats.replied}</div>
                    <div className="text-sm text-muted-foreground">Replied</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {campaignStats.sent > 0 ? Math.round((campaignStats.replied / campaignStats.sent) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Reply Rate</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search campaigns..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-campaigns"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40" data-testid="select-status-filter">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="opened">Opened</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={templateFilter} onValueChange={setTemplateFilter}>
                        <SelectTrigger className="w-40" data-testid="select-template-filter">
                          <SelectValue placeholder="Template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Templates</SelectItem>
                          <SelectItem value="problem-solution">Problem/Solution</SelectItem>
                          <SelectItem value="social-proof">Social Proof</SelectItem>
                          <SelectItem value="news-hook">News Hook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaigns Table */}
              <Card>
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Campaigns ({filteredCampaigns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {campaignsLoading ? (
                    <div className="p-6">
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-4">
                              <div className="h-4 bg-muted rounded w-1/3"></div>
                              <div className="h-4 bg-muted rounded w-1/4"></div>
                              <div className="h-4 bg-muted rounded w-1/6"></div>
                              <div className="h-4 bg-muted rounded w-1/6"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No campaigns found</h3>
                      <p className="text-muted-foreground mb-4">
                        {campaigns?.length === 0 
                          ? "Create your first email campaign from the prospects page"
                          : "Try adjusting your filters to find campaigns"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject Line</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Sent</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCampaigns.map((campaign: EmailCampaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell>
                                <div className="max-w-md">
                                  <div className="font-medium text-foreground truncate" data-testid={`text-subject-${campaign.id}`}>
                                    {campaign.subjectLine}
                                  </div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {campaign.emailBody.substring(0, 100)}...
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getTemplateLabel(campaign.template)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(campaign.status)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    data-testid={`button-view-campaign-${campaign.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {campaign.status === "draft" && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      data-testid={`button-send-campaign-${campaign.id}`}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    data-testid={`button-more-campaign-${campaign.id}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

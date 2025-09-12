import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import LeadsTable from "@/components/leads-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Download, RefreshCw } from "lucide-react";

export default function Prospects() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companySizeFilter, setCompanySizeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");

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

  const { data: leads, isLoading: leadsLoading, refetch } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  const filteredLeads = leads?.filter((lead: any) => {
    const matchesSearch = 
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.contactTitle && lead.contactTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = industryFilter === "all" || lead.companyIndustry === industryFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesCompanySize = companySizeFilter === "all" || lead.companySize === companySizeFilter;
    
    return matchesSearch && matchesIndustry && matchesStatus && matchesCompanySize;
  }) || [];

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return parseFloat(b.totalScore || "0") - parseFloat(a.totalScore || "0");
      case "company":
        return a.companyName.localeCompare(b.companyName);
      case "name":
        return a.contactName.localeCompare(b.contactName);
      case "created":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const prospectStats = {
    total: leads?.length || 0,
    new: leads?.filter((l: any) => l.status === "new").length || 0,
    contacted: leads?.filter((l: any) => l.status === "contacted").length || 0,
    responded: leads?.filter((l: any) => l.status === "responded").length || 0,
    highScore: leads?.filter((l: any) => parseFloat(l.totalScore || "0") >= 24).length || 0,
  };

  const uniqueIndustries = [...new Set(leads?.map((l: any) => l.companyIndustry).filter(Boolean))];
  const uniqueCompanySizes = [...new Set(leads?.map((l: any) => l.companySize).filter(Boolean))];

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your prospects data will be exported to CSV.",
    });
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
            <h1 className="text-lg font-semibold text-foreground">Prospects</h1>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                    Prospects
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage your qualified leads and track outreach progress.
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => refetch()}
                    data-testid="button-refresh"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExport}
                    data-testid="button-export"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Prospect Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground" data-testid="stat-total-prospects">
                      {prospectStats.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{prospectStats.new}</div>
                    <div className="text-sm text-muted-foreground">New</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{prospectStats.contacted}</div>
                    <div className="text-sm text-muted-foreground">Contacted</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{prospectStats.responded}</div>
                    <div className="text-sm text-muted-foreground">Responded</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{prospectStats.highScore}</div>
                    <div className="text-sm text-muted-foreground">High Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="mr-2 h-5 w-5" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search prospects..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-prospects"
                        />
                      </div>
                    </div>

                    {/* Industry Filter */}
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger data-testid="select-industry-filter">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        {uniqueIndustries.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Company Size Filter */}
                    <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
                      <SelectTrigger data-testid="select-company-size-filter">
                        <SelectValue placeholder="Company Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        {uniqueCompanySizes.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Sort By */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger data-testid="select-sort-by">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created">Date Created</SelectItem>
                        <SelectItem value="score">Score (High to Low)</SelectItem>
                        <SelectItem value="company">Company Name</SelectItem>
                        <SelectItem value="name">Contact Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Active Filters */}
                  {(searchTerm || industryFilter !== "all" || statusFilter !== "all" || companySizeFilter !== "all") && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {searchTerm && (
                        <Badge variant="secondary">
                          Search: {searchTerm}
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {industryFilter !== "all" && (
                        <Badge variant="secondary">
                          Industry: {industryFilter}
                          <button 
                            onClick={() => setIndustryFilter("all")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {statusFilter !== "all" && (
                        <Badge variant="secondary">
                          Status: {statusFilter}
                          <button 
                            onClick={() => setStatusFilter("all")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {companySizeFilter !== "all" && (
                        <Badge variant="secondary">
                          Size: {companySizeFilter}
                          <button 
                            onClick={() => setCompanySizeFilter("all")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Showing {sortedLeads.length} of {leads?.length || 0} prospects
                </div>
                <div className="text-sm text-muted-foreground">
                  Sorted by: {sortBy === "created" ? "Date Created" : sortBy === "score" ? "Score" : sortBy === "company" ? "Company Name" : "Contact Name"}
                </div>
              </div>

              {/* Prospects Table */}
              <LeadsTable leads={sortedLeads} isLoading={leadsLoading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

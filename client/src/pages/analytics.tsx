import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import StatsGrid from "@/components/stats-grid";
import PerformanceChart from "@/components/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, Users, Mail, Target, Calendar } from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    enabled: isAuthenticated,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/analytics/transactions"],
    enabled: isAuthenticated,
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
  });

  // Calculate industry performance
  const industryPerformance = leads?.reduce((acc: any, lead: any) => {
    if (!lead.companyIndustry) return acc;
    
    if (!acc[lead.companyIndustry]) {
      acc[lead.companyIndustry] = {
        industry: lead.companyIndustry,
        totalLeads: 0,
        avgFitScore: 0,
        avgIntentScore: 0,
        totalScore: 0,
        responseRate: 0,
      };
    }
    
    acc[lead.companyIndustry].totalLeads++;
    acc[lead.companyIndustry].totalScore += parseFloat(lead.fitScore || "0");
    acc[lead.companyIndustry].totalScore += parseFloat(lead.intentScore || "0");
    
    return acc;
  }, {});

  // Calculate performance metrics for each industry
  const industryStats = Object.values(industryPerformance || {}).map((industry: any) => ({
    ...industry,
    avgFitScore: (industry.totalScore / (industry.totalLeads * 2)).toFixed(1),
    responseRate: Math.random() * 5 + 2, // Mock response rate for now
  })).sort((a: any, b: any) => b.responseRate - a.responseRate).slice(0, 5);

  // Recent activity from transactions
  const recentActivity = transactions?.slice(0, 10).map((transaction: any) => ({
    id: transaction.id,
    type: transaction.type,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.createdAt,
  })) || [];

  // Time-based performance data (mock for now)
  const performanceData = [
    { period: "Week 1", leads: 45, emails: 38, responses: 3 },
    { period: "Week 2", leads: 52, emails: 47, responses: 4 },
    { period: "Week 3", leads: 38, emails: 33, responses: 2 },
    { period: "Week 4", leads: 41, emails: 39, responses: 5 },
  ];

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
            <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                    Analytics
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track your lead generation performance and optimize your campaigns.
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40" data-testid="select-time-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Overview Stats */}
              <StatsGrid stats={stats} isLoading={statsLoading} />

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Performance Chart */}
                <PerformanceChart />
                
                {/* Industry Performance */}
                <Card className="shadow-sm border border-border">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Top Performing Industries
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Industries with highest response rates</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    {industryStats.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Target className="mx-auto h-8 w-8 mb-3 opacity-50" />
                        <p>No industry data available</p>
                        <p className="text-sm">Generate leads to see industry performance</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {industryStats.map((industry: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? "success-gradient" :
                                index === 1 ? "credit-gradient" :
                                index === 2 ? "warning-gradient" :
                                "bg-slate-400"
                              }`}></div>
                              <div>
                                <span className="text-sm font-medium text-foreground">{industry.industry}</span>
                                <div className="text-xs text-muted-foreground">
                                  {industry.totalLeads} leads • Avg fit: {industry.avgFitScore}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">
                                {industry.responseRate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">response rate</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Weekly Performance */}
                <Card className="shadow-sm border border-border xl:col-span-2">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Weekly Performance
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Lead generation and email activity</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Leads Generated</TableHead>
                          <TableHead>Emails Sent</TableHead>
                          <TableHead>Responses</TableHead>
                          <TableHead>Response Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceData.map((period, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{period.period}</TableCell>
                            <TableCell>{period.leads}</TableCell>
                            <TableCell>{period.emails}</TableCell>
                            <TableCell>{period.responses}</TableCell>
                            <TableCell>
                              <Badge className={
                                (period.responses / period.emails) * 100 >= 10 ? "bg-green-100 text-green-800" :
                                (period.responses / period.emails) * 100 >= 5 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }>
                                {((period.responses / period.emails) * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-sm border border-border">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Latest credit usage</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    {transactionsLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <TrendingUp className="mx-auto h-8 w-8 mb-3 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.slice(0, 8).map((activity, index) => (
                          <div key={activity.id} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground truncate">
                                {activity.type === "lead_generation" ? "Lead Generated" :
                                 activity.type === "email_creation" ? "Email Created" :
                                 activity.type === "purchase" ? "Credits Purchased" : 
                                 "Credit Activity"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${
                              activity.amount > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {activity.amount > 0 ? "+" : ""}{activity.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Key Insights */}
              <Card className="shadow-sm border border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Key Insights
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Performance insights and recommendations</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {stats?.responseRate || 0}%
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        Current Response Rate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(stats?.responseRate || 0) > 3 ? "Above industry average" : "Room for improvement"}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {Math.round((stats?.totalLeads || 0) / 30)}
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        Leads per Day (Avg)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Based on last 30 days
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {stats?.creditsUsed || 0}
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        Total Credits Used
                      </div>
                      <div className="text-xs text-muted-foreground">
                        All-time usage
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

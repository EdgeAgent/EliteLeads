import { Card, CardContent } from "@/components/ui/card";
import { Users, Reply, Mail, Coins, TrendingUp, Play } from "lucide-react";

interface StatsGridProps {
  stats: any;
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Leads Generated",
      value: stats?.totalLeads || 0,
      icon: Users,
      gradient: "success-gradient",
      change: "+12%",
      changeLabel: "from last month",
      positive: true,
    },
    {
      title: "Response Rate",
      value: `${stats?.responseRate || 0}%`,
      icon: Reply,
      gradient: "credit-gradient",
      change: "+0.8%",
      changeLabel: "above industry avg",
      positive: true,
    },
    {
      title: "Active Campaigns",
      value: stats?.activeCampaigns || 0,
      icon: Mail,
      gradient: "warning-gradient",
      change: "3 running",
      changeLabel: "campaigns active",
      positive: null,
    },
    {
      title: "Credits Used",
      value: stats?.creditsUsed || 0,
      icon: Coins,
      gradient: "bg-slate-500",
      change: `${(stats?.creditsUsed || 0)} remaining`,
      changeLabel: "",
      positive: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="overflow-hidden shadow-sm border border-border">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${stat.gradient} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    {stat.title}
                  </dt>
                  <dd className="text-2xl font-bold text-foreground" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span 
                  className={`flex items-center ${
                    stat.positive === true ? 'text-green-600' : 
                    stat.positive === false ? 'text-red-600' : 
                    'text-blue-600'
                  }`}
                >
                  {stat.positive === true && <TrendingUp className="mr-1 h-3 w-3" />}
                  {stat.positive === false && <TrendingUp className="mr-1 h-3 w-3 rotate-180" />}
                  {stat.positive === null && <Play className="mr-1 h-3 w-3" />}
                  {stat.change}
                </span>
                {stat.changeLabel && (
                  <span className="ml-2 text-muted-foreground">{stat.changeLabel}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Mail, TrendingUp } from "lucide-react";

export default function RecentActivity() {
  const { data: transactions } = useQuery({
    queryKey: ["/api/analytics/transactions"],
  });

  const activities = transactions?.slice(0, 3).map((transaction: any) => {
    if (transaction.type === "lead_generation") {
      return {
        type: "lead",
        icon: UserPlus,
        title: "New lead generated",
        description: transaction.description,
        time: new Date(transaction.createdAt).toLocaleString(),
        gradient: "success-gradient",
      };
    } else if (transaction.type === "email_creation") {
      return {
        type: "email",
        icon: Mail,
        title: "Email campaign created",
        description: transaction.description,
        time: new Date(transaction.createdAt).toLocaleString(),
        gradient: "credit-gradient",
      };
    } else {
      return {
        type: "other",
        icon: TrendingUp,
        title: "Credit transaction",
        description: transaction.description,
        time: new Date(transaction.createdAt).toLocaleString(),
        gradient: "warning-gradient",
      };
    }
  }) || [];

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest lead generation and email campaigns</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flow-root">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Generate your first leads to see activity here</p>
            </div>
          ) : (
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activityIdx}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full ${activity.gradient} flex items-center justify-center`}>
                          <activity.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-foreground">{activity.title}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <time>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

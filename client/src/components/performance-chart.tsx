import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function PerformanceChart() {
  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle>Campaign Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Response rates over time</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">Performance Chart</p>
            <p className="text-sm">Response Rate Trending +0.8%</p>
            <p className="text-xs mt-2 opacity-75">Chart integration coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

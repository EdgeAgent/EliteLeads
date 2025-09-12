import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Mail, BarChart3, CreditCard, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 credit-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">LEAD | LEADER</h1>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Lead Generation
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Generate High-Quality B2B Leads with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your sales pipeline with intelligent lead generation, AI-powered research, 
            and personalized cold email automation. Built for modern B2B sales teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for B2B Lead Generation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform handles the entire lead generation process, 
              from prospect discovery to personalized outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Intelligent Lead Discovery</CardTitle>
                <CardDescription>
                  Find high-quality prospects across multiple data sources with advanced search parameters and AI-powered qualification.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-primary mb-2" />
                <CardTitle>AI-Powered Research</CardTitle>
                <CardDescription>
                  Deep company intelligence and prospect insights powered by GPT-5 for maximum personalization and relevance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Personalized Cold Emails</CardTitle>
                <CardDescription>
                  Generate compelling, personalized emails that get responses with multiple template options and AI optimization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Lead Qualification</CardTitle>
                <CardDescription>
                  Automatic scoring based on fit, intent, and reachability to prioritize your highest-value prospects.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Credit-Based Pricing</CardTitle>
                <CardDescription>
                  Pay only for what you use with transparent credit-based pricing. No hidden fees or monthly commitments.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track campaign performance, response rates, and ROI with detailed analytics and reporting.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Pay only for what you use. No monthly fees, no contracts.
          </p>

          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Credit-Based Pricing</CardTitle>
              <div className="text-4xl font-bold text-primary">$0.10</div>
              <CardDescription>per credit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lead Generation</span>
                  <span className="font-medium">1 credit</span>
                </div>
                <div className="flex justify-between">
                  <span>Email Creation</span>
                  <span className="font-medium">1 credit</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Research</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics</span>
                  <span className="font-medium">Free</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-start-free"
              >
                Start with 25 Free Credits
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Lead Generation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of sales teams already using LEAD | LEADER to generate more qualified leads and close more deals.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started-cta"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 credit-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">LEAD | LEADER</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 LEAD | LEADER. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

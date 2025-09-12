import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Plus, Download, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import CreditPayPalButton from "@/components/CreditPayPalButton";

export default function Billing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [creditAmount, setCreditAmount] = useState("100");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [pendingCredits, setPendingCredits] = useState(0);

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

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/analytics/transactions"],
    enabled: isAuthenticated,
  });

  const creditConfirmationMutation = useMutation({
    mutationFn: async ({ credits, orderId }: { credits: number; orderId: string }) => {
      const response = await apiRequest("POST", "/api/credits/confirm-payment", { credits, orderId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/transactions"] });
      toast({
        title: "Payment Successful",
        description: `${pendingCredits} credits have been added to your account.`,
      });
      setIsProcessingPayment(false);
      setShowPayPal(false);
      setPendingCredits(0);
    },
    onError: (error) => {
      setIsProcessingPayment(false);
      setShowPayPal(false);
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
        title: "Payment Failed",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const handlePurchaseCredits = () => {
    const credits = parseInt(creditAmount);
    if (credits <= 0 || credits > 10000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid credit amount (1-10,000)",
        variant: "destructive",
      });
      return;
    }

    setPendingCredits(credits);
    setShowPayPal(true);
    setIsProcessingPayment(true);
  };

  const handlePayPalSuccess = (orderId: string, credits: number) => {
    // Call the credit confirmation endpoint
    creditConfirmationMutation.mutate({ credits, orderId });
  };

  const handlePayPalError = (error: any) => {
    console.error("PayPal Error:", error);
    setIsProcessingPayment(false);
    setShowPayPal(false);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handlePayPalCancel = () => {
    setIsProcessingPayment(false);
    setShowPayPal(false);
    toast({
      title: "Payment Canceled",
      description: "Payment was canceled. You can try again when ready.",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "lead_generation":
        return <DollarSign className="h-4 w-4 text-red-600" />;
      case "email_creation":
        return <DollarSign className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-green-100 text-green-800">Purchase</Badge>;
      case "lead_generation":
        return <Badge className="bg-blue-100 text-blue-800">Lead Gen</Badge>;
      case "email_creation":
        return <Badge className="bg-purple-100 text-purple-800">Email</Badge>;
      case "refund":
        return <Badge className="bg-yellow-100 text-yellow-800">Refund</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const creditPackages = [
    { credits: 100, price: 10, popular: false, savings: "" },
    { credits: 500, price: 45, popular: true, savings: "Save $5" },
    { credits: 1000, price: 80, popular: false, savings: "Save $20" },
    { credits: 2500, price: 175, popular: false, savings: "Save $75" },
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
            <h1 className="text-lg font-semibold text-foreground">Billing</h1>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                  Billing & Credits
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your credits and view transaction history.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Credit Balance and Purchase */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Current Balance */}
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Current Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-4xl font-bold text-foreground mb-2" data-testid="text-current-credits">
                            {user?.credits || 0}
                          </div>
                          <div className="text-muted-foreground">Available Credits</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium text-foreground">
                            ${((user?.credits || 0) * 0.1).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Current Value</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-foreground">$0.10</div>
                          <div className="text-xs text-muted-foreground">per credit</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-foreground">1</div>
                          <div className="text-xs text-muted-foreground">credit per lead</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-foreground">1</div>
                          <div className="text-xs text-muted-foreground">credit per email</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credit Packages */}
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle>Credit Packages</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Choose a package that fits your needs
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {creditPackages.map((pkg, index) => (
                          <Card 
                            key={index}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              pkg.popular ? "border-primary bg-primary/5" : "border-border"
                            }`}
                            onClick={() => setCreditAmount(pkg.credits.toString())}
                            data-testid={`package-${pkg.credits}`}
                          >
                            <CardContent className="p-4 text-center">
                              {pkg.popular && (
                                <Badge className="mb-2 credit-gradient text-white">Popular</Badge>
                              )}
                              <div className="text-2xl font-bold text-foreground mb-1">
                                {pkg.credits}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">credits</div>
                              <div className="text-xl font-semibold text-foreground mb-1">
                                ${pkg.price}
                              </div>
                              {pkg.savings && (
                                <div className="text-xs text-green-600 font-medium">
                                  {pkg.savings}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Purchase */}
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle>Purchase Credits</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Buy the exact amount you need
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="credit-amount">Number of Credits</Label>
                            <Input
                              id="credit-amount"
                              type="number"
                              min="1"
                              max="10000"
                              value={creditAmount}
                              onChange={(e) => setCreditAmount(e.target.value)}
                              placeholder="Enter amount"
                              data-testid="input-credit-amount"
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <Label>Total Cost</Label>
                            <div className="text-2xl font-bold text-foreground">
                              ${(parseInt(creditAmount || "0") * 0.1).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            You'll get <strong>{creditAmount || 0} credits</strong> for lead generation and email creation
                          </div>
                          {!showPayPal ? (
                            <Button
                              onClick={handlePurchaseCredits}
                              disabled={isProcessingPayment || !creditAmount || parseInt(creditAmount) <= 0}
                              className="px-8"
                              data-testid="button-purchase-credits"
                            >
                              {isProcessingPayment ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Purchase Credits
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="flex flex-col items-end space-y-2">
                              <div className="text-sm text-muted-foreground">
                                Complete payment with PayPal
                              </div>
                              <CreditPayPalButton
                                amount={(parseInt(creditAmount || "0") * 0.1).toFixed(2)}
                                currency="USD"
                                intent="capture"
                                credits={pendingCredits}
                                onSuccess={handlePayPalSuccess}
                                onError={handlePayPalError}
                                onCancel={handlePayPalCancel}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowPayPal(false);
                                  setIsProcessingPayment(false);
                                }}
                                className="text-xs"
                                data-testid="button-cancel-payment"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction History */}
                <div>
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Clock className="mr-2 h-5 w-5" />
                          Recent Transactions
                        </CardTitle>
                        <Button variant="ghost" size="sm" data-testid="button-download-history">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your credit usage history
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      {transactionsLoading ? (
                        <div className="space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-muted rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-muted rounded mb-1"></div>
                                  <div className="h-3 bg-muted rounded w-2/3"></div>
                                </div>
                                <div className="w-12 h-4 bg-muted rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : !transactions || transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="mx-auto h-8 w-8 mb-3 opacity-50" />
                          <p className="font-medium">No transactions yet</p>
                          <p className="text-sm">Your credit usage will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {transactions.slice(0, 10).map((transaction: any) => (
                            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                              <div className="flex items-center space-x-3">
                                <div className="p-1">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground truncate">
                                    {transaction.description || transaction.type}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getTransactionBadge(transaction.type)}
                                <div className={`text-sm font-medium ${
                                  transaction.amount > 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                  {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

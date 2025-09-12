import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Search, 
  Mail, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Zap,
  ChevronUp
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { name: "Lead Generation", href: "/leads", icon: Search, current: false },
  { name: "Email Campaigns", href: "/campaigns", icon: Mail, current: false },
  { name: "Prospects", href: "/prospects", icon: Users, current: false },
  { name: "Analytics", href: "/analytics", icon: BarChart3, current: false },
];

const secondaryNavigation = [
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex w-64 flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-card border-r border-border">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4 sidebar-scroll">
            {/* Logo and Brand */}
            <div className="flex flex-shrink-0 items-center px-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 credit-gradient rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">LEAD | LEADER</h1>
              </div>
            </div>
            
            {/* Credit Display */}
            <div className="mx-4 mb-6 p-4 credit-gradient rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium opacity-90">Available Credits</span>
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3" />
                </div>
              </div>
              <div className="text-2xl font-bold" data-testid="text-credits">
                {userData?.credits ?? 0}
              </div>
              <div className="text-xs opacity-75 mt-1">
                Refill anytime
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isCurrent = location === item.href;
                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isCurrent
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 mt-4 border-t border-border">
                {secondaryNavigation.map((item) => {
                  const isCurrent = location === item.href;
                  return (
                    <Link 
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isCurrent
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                      )}
                      data-testid={`link-${item.name.toLowerCase()}`}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex flex-shrink-0 border-t border-border p-4">
            <div className="flex items-center group w-full">
              <div>
                <img 
                  className="inline-block h-10 w-10 rounded-full object-cover" 
                  src={userData?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                  alt="Profile"
                  data-testid="img-profile"
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                  {userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                  {userData?.email || ''}
                </p>
              </div>
              <button 
                onClick={() => window.location.href = "/api/logout"}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-logout"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

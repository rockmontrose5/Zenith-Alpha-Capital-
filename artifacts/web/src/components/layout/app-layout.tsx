import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  ArrowRightLeft, 
  Users, 
  UserCircle, 
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: dbUser } = useGetMe();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invest", href: "/invest", icon: TrendingUp },
    { name: "Portfolio", href: "/portfolio", icon: Briefcase },
    { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
    { name: "Referrals", href: "/referrals", icon: Users },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  if (dbUser?.role === 'admin') {
    navigation.push({ name: "Admin Panel", href: "/admin", icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              Z
            </div>
            <span className="font-semibold text-xl tracking-tight">Zenith Alpha</span>
          </div>
          <button 
            className="ml-auto md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center px-4 md:px-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30">
          <button
            className="mr-4 md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block">
              {dbUser?.firstName} {dbUser?.lastName}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {dbUser?.firstName?.[0] || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

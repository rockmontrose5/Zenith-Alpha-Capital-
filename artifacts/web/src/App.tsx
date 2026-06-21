import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Invest from "@/pages/invest";
import Portfolio from "@/pages/portfolio";
import Transactions from "@/pages/transactions";
import Profile from "@/pages/profile";
import Referrals from "@/pages/referrals";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTransactions from "@/pages/admin/transactions";
import AdminPlans from "@/pages/admin/plans";
import AdminBlog from "@/pages/admin/blog";

import { AppLayout } from "@/components/layout/app-layout";
import { useGetMe } from "@workspace/api-client-react";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "hsl(43, 80%, 46%)",
    colorBackground: "hsl(225, 45%, 10%)",
    colorInputBackground: "hsl(225, 30%, 15%)",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function JitProvisioner() {
  const { isSignedIn } = useUser();
  const { data } = useGetMe({
    query: {
      enabled: !!isSignedIn,
      retry: false
    }
  });
  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <Component />
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <AdminGuard>
            <Component />
          </AdminGuard>
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();
  
  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (user?.role !== 'admin') return <Redirect to="/dashboard" />;
  
  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <JitProvisioner />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          
          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/invest"><ProtectedRoute component={Invest} /></Route>
          <Route path="/portfolio"><ProtectedRoute component={Portfolio} /></Route>
          <Route path="/transactions"><ProtectedRoute component={Transactions} /></Route>
          <Route path="/referrals"><ProtectedRoute component={Referrals} /></Route>
          <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
          
          <Route path="/admin"><AdminRoute component={AdminDashboard} /></Route>
          <Route path="/admin/users"><AdminRoute component={AdminUsers} /></Route>
          <Route path="/admin/transactions"><AdminRoute component={AdminTransactions} /></Route>
          <Route path="/admin/plans"><AdminRoute component={AdminPlans} /></Route>
          <Route path="/admin/blog"><AdminRoute component={AdminBlog} /></Route>
          
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;

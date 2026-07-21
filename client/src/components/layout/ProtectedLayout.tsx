import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "./CommandPalette";

export function ProtectedLayout() {
  const { user, role, loading, organization, orgLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || orgLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (role === "alert_source") {
      navigate("/alert-source");
      return;
    }
    if (!organization && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [user, role, loading, orgLoading, organization, location.pathname, navigate]);

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a session but role hasn't been resolved yet, don't render a blank screen.
  if (user && role === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Signed-in user without an organization: render the onboarding outlet full-screen (no sidebar).
  if (!organization) {
    if (location.pathname === "/onboarding") {
      return <Outlet />;
    }
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}

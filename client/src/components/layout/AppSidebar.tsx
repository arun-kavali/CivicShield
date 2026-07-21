import {
  LayoutDashboard,
  AlertTriangle,
  FileWarning,
  BarChart3,
  Plug,
  Building2,
  FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

// Main navigation items for SOC Analysts (no Admin Panel - removed per requirements)
const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Incidents", url: "/incidents", icon: FileWarning },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Connectors", url: "/connectors", icon: Plug },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { organization, role } = useAuth();
  const canManageOrg = role === "org_admin" || role === "admin";
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        {organization && (
          <div className="px-4 pb-3 mb-2 border-b border-sidebar-border">
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
              Organization
            </div>
            <div className="text-sm font-medium text-sidebar-foreground truncate" title={organization.name}>
              {organization.name}
            </div>
            {organization.sector && (
              <div className="text-xs text-sidebar-foreground/60 truncate">{organization.sector}</div>
            )}
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {canManageOrg && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/settings/organization"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Organization</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, AlertTriangle, FileWarning, BarChart3, Plug, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/alerts"))}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Alerts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/incidents"))}>
            <FileWarning className="mr-2 h-4 w-4" />
            <span>Incidents</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/connectors"))}>
            <Plug className="mr-2 h-4 w-4" />
            <span>Connectors</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings & User">
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => signOut())}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

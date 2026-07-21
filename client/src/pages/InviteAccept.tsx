import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }
    if (user) {
      navigate(`/onboarding?token=${encodeURIComponent(token)}`, { replace: true });
    } else {
      sessionStorage.setItem("civicshield.pendingInvite", token);
      navigate("/auth", { replace: true });
    }
  }, [user, loading, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Preparing your invitation…</span>
      </div>
    </div>
  );
}
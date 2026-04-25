import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/admin", { replace: true });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p className="text-sm text-slate-300">Finalizing sign-in…</p>
    </div>
  );
}

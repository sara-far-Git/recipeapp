"use client";

import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadUser = useAuth((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}

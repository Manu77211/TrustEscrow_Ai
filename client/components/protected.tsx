"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (token === null) {
      const handle = setTimeout(() => {
        const current = useAuthStore.getState().token;
        if (!current) {
          router.push("/login");
        }
      }, 200);
      return () => clearTimeout(handle);
    }
  }, [router, token]);

  return <>{children}</>;
}

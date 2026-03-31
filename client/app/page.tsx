"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";

export default function Home() {
  const { user, hydrate, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">TrustEscrow AI</h1>
        <p className="mt-2 text-black/70">
          AI-powered trust and escrow system for fair freelance project validation.
        </p>

        {!user ? (
          <div className="mt-8 flex gap-3">
            <Link className="rounded-md bg-black px-4 py-2 text-white" href="/login">
              Login
            </Link>
            <Link className="rounded-md border border-black/20 px-4 py-2" href="/register">
              Register
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            <p className="text-sm text-black/70">Logged in as</p>
            <p className="text-lg font-medium">{user.name} ({user.role})</p>
            <div className="text-sm text-black/70">
              <p>Email: {user.email}</p>
              <p>Trust score: {user.trustScore}</p>
              <p>Rating: {user.rating}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-black/20 px-4 py-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import * as React from "react";
import { Paperclip, Sparkles } from "lucide-react";

const Hero1 = () => {
  return (
    <div className="min-h-screen bg-[#0c0414] text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-18rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute top-[12rem] left-[-8rem] h-[20rem] w-[20rem] rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>

      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/90 text-black grid place-items-center font-bold">T</div>
          <div className="font-bold text-md">TrustEscrow AI</div>
        </div>
        <button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm cursor-pointer font-semibold">
          Launch Escrow Flow
        </button>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pb-16 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center">
            <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-2 w-fit mx-4 border border-white/10">
              <span className="text-xs flex items-center gap-2">Hybrid trust scoring now in workflow</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Create fair client-freelancer outcomes with evidence-first approvals
          </h1>
          <p className="text-base text-slate-200">
            Every milestone is paired with validation criteria, submission evidence, and explainable release decisions.
          </p>

          <div className="relative max-w-2xl mx-auto w-full">
            <div className="bg-white/10 rounded-full p-3 flex items-center border border-white/10">
              <button className="p-2 rounded-full hover:bg-white/10 transition-all">
                <Paperclip className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-all">
                <Sparkles className="w-5 h-5 text-blue-300" />
              </button>
              <input
                type="text"
                placeholder="Paste requirements to auto-generate milestones"
                className="bg-transparent flex-1 outline-none text-gray-200 pl-4"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export { Hero1 };

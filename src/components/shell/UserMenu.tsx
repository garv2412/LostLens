"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, Shield, ChevronDown, Check } from "lucide-react";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-950">
          <Image
            src={CURRENT_DEMO_USER.avatarUrl!}
            alt={CURRENT_DEMO_USER.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="hidden sm:block text-left text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200 leading-none">
            {CURRENT_DEMO_USER.name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {CURRENT_DEMO_USER.department}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/90 dark:border-slate-800 z-50 p-2 animate-fade-in">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{CURRENT_DEMO_USER.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{CURRENT_DEMO_USER.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-semibold">
              <Shield className="h-3 w-3" />
              Demo Persona ({CURRENT_DEMO_USER.role})
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 px-3 py-2 leading-relaxed">
            LostLens is operating in client-side Demo Mode. Actions you perform persist locally in your browser.
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Demo Session Active</span>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

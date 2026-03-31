"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  BarChart2,
  ShieldCheck,
  Video,
  FolderKanban,
  AudioLines,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  short?: string;
  end?: string;
}

interface SearchResult {
  actions: Action[];
}

const allActions: Action[] = [
  {
    id: "1",
    label: "Create a milestone plan",
    icon: <FolderKanban className="h-4 w-4 text-blue-500" />,
    description: "Project setup",
    short: "Ctrl+K",
    end: "Workflow",
  },
  {
    id: "2",
    label: "Score latest submission",
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: "Validation",
    short: "Ctrl+P",
    end: "Report",
  },
  {
    id: "3",
    label: "Open project chat",
    icon: <Video className="h-4 w-4 text-purple-500" />,
    description: "Collaboration",
    end: "Room",
  },
  {
    id: "4",
    label: "Review dispute summary",
    icon: <AudioLines className="h-4 w-4 text-green-500" />,
    description: "Arbitration",
    end: "Case",
  },
  {
    id: "5",
    label: "Lock escrow for milestone",
    icon: <ShieldCheck className="h-4 w-4 text-blue-500" />,
    description: "Escrow",
    end: "Payment",
  },
];

function ActionSearchBar({ actions = allActions }: { actions?: Action[] }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = actions.filter((action) => action.label.toLowerCase().includes(normalizedQuery));
    setResult({ actions: filteredActions });
  }, [debouncedQuery, isFocused, actions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.3 },
        staggerChildren: 0.06,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.15 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  };

  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative flex flex-col justify-start items-center min-h-[300px]">
        <div className="w-full max-w-xl sticky top-0 z-10 pt-4 pb-1">
          <label className="text-xs font-medium text-slate-200 mb-1 block" htmlFor="search">
            Quick Actions
          </label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Search milestones, escrow, validation actions"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="pl-3 pr-9 py-1.5 h-10 text-sm rounded-lg border-slate-700 bg-slate-900/80 text-slate-100"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
              <AnimatePresence mode="popLayout">
                {query.length > 0 ? (
                  <motion.div key="send" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Send className="w-4 h-4 text-slate-400" />
                  </motion.div>
                ) : (
                  <motion.div key="search" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Search className="w-4 h-4 text-slate-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl">
          <AnimatePresence>
            {isFocused && result && !selectedAction && (
              <motion.div
                className="w-full border border-slate-700 rounded-md shadow-sm overflow-hidden bg-slate-900 mt-1"
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.ul>
                  {result.actions.map((action) => (
                    <motion.li
                      key={action.id}
                      className="px-3 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer rounded-md"
                      variants={item}
                      layout
                      onClick={() => setSelectedAction(action)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{action.icon}</span>
                        <span className="text-sm font-medium text-slate-100">{action.label}</span>
                        <span className="text-xs text-slate-400">{action.description}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{action.short}</span>
                        <span>{action.end}</span>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
                <div className="mt-2 px-3 py-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Press Ctrl+K to open command palette</span>
                    <span>ESC to cancel</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { ActionSearchBar };

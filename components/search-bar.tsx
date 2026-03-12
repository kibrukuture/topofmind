"use client"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MagnifyingGlass, X, Sparkle } from "@phosphor-icons/react"
import { useSearch } from "@/hooks/search/use-search"
import type { SearchResult } from "@/services/search/search.api"

const avatarColors = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#f97316"]

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<SearchResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: runSearch, isPending: loading } = useSearch()

  const openSearch = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const close = () => {
    setOpen(false)
    setQuery("")
    setResult(null)
  }

  const search = async () => {
    if (!query.trim() || loading) return
    setResult(null)
    try {
      const data = await runSearch(query)
      setResult(data)
    } catch {
      setResult(null)
    }
  }

  return (
    <>
      <button
        onClick={openSearch}
        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-50 transition-colors"
      >
        <MagnifyingGlass size={15} className="text-neutral-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
         className="fixed inset-0 z-50 flex flex-col bg-white items-center"
          >
            {/* input row */}
            <div className="flex-shrink-0 w-full max-w-lg flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
              <MagnifyingGlass size={15} className="text-neutral-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="search your memory..."
                className="flex-1 text-[14px] text-neutral-800 placeholder-neutral-300 bg-transparent focus:outline-none"
              />
              <button onClick={close} className="flex-shrink-0 p-1">
                <X size={16} className="text-neutral-300 hover:text-neutral-500 transition-colors" />
              </button>
            </div>

            {/* results area — same max width as feed */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
              <div className="max-w-lg mx-auto px-5 py-5 space-y-5">

                {/* idle hint */}
                {!loading && !result && (
                  <p className="text-[13px] text-neutral-300 text-center pt-10">
                    try "stripe cto" or "follow up friday"
                  </p>
                )}

                {/* loading */}
                {loading && (
                  <div className="flex items-center gap-2 pt-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[13px] text-neutral-400">searching your memory...</span>
                  </div>
                )}

                {/* results */}
                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* ai summary card */}
                    {result.summary && (
                      <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkle size={11} className="text-amber-400" weight="fill" />
                          <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold">summary</span>
                        </div>
                        <p className="text-[13px] text-neutral-600 leading-relaxed">{result.summary}</p>
                      </div>
                    )}

                    {/* people */}
                    {(result.people?.length ?? 0) > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">people</p>
                        {result.people!.map((p) => {
                          const color = avatarColors[p.name.charCodeAt(0) % avatarColors.length]
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-100 bg-white"
                              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: color }}
                              >
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-neutral-800">{p.name}</p>
                                {(p.role || p.company) && (
                                  <p className="text-[10px] text-neutral-400 mt-0.5">
                                    {[p.role, p.company].filter(Boolean).join(" · ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* commitments */}
                    {(result.commitments?.length ?? 0) > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">commitments</p>
                        {result.commitments!.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 bg-white"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                          >
                            <div className="w-4 h-4 rounded-[4px] border border-neutral-200 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[13px] text-neutral-700 leading-snug">{c.action}</p>
                              {c.dueDate && (
                                <span className="text-[10px] text-amber-500 font-medium mt-0.5 block">{c.dueDate}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* details */}
                    {(result.personalDetails?.length ?? 0) > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">remembered</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.personalDetails!.map((d) => (
                            <span
                              key={d.id}
                              className="text-[11px] bg-white border border-neutral-100 rounded-full px-3 py-1 text-neutral-500"
                              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                            >
                              {d.detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
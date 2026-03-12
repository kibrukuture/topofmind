"use client"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Buildings, Briefcase, CheckCircle, Sparkle } from "@phosphor-icons/react"
import Link from "next/link"
import type { AgentResponse } from "@/validators/agent.validator"

const avatarColors = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#f97316"]

export function Results({ agentResponse }: { agentResponse: AgentResponse | null }) {
  if (!agentResponse) return null

  const hasPeople = (agentResponse.people?.length ?? 0) > 0
  const hasCommitments = (agentResponse.commitments?.length ?? 0) > 0
  const hasDetails = (agentResponse.personalDetails?.length ?? 0) > 0

  if (!hasPeople && !hasCommitments && !hasDetails) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="space-y-4 mt-4"
      >
        {/* people */}
        {hasPeople && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              people
            </p>
            {(agentResponse.people ?? []).map((person, i) => {
              const color = avatarColors[person.name.charCodeAt(0) % avatarColors.length]
              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Link href={`/people/${person.id}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-all group"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: color }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-neutral-800 truncate">{person.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {person.role && (
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                              <Briefcase size={9} weight="regular" />
                              {person.role}
                            </span>
                          )}
                          {person.company && (
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                              <Buildings size={9} weight="regular" />
                              {person.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        size={13}
                        className="text-neutral-200 group-hover:text-neutral-400 transition-colors flex-shrink-0"
                      />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* commitments */}
        {hasCommitments && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              commitments
            </p>
            {(agentResponse.commitments ?? []).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.07, type: "spring", stiffness: 200, damping: 20 }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 bg-white"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
              >
                <div className="w-4 h-4 rounded-[4px] border border-neutral-200 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] text-neutral-700 leading-snug">{c.action}</p>
                  {c.dueDate && (
                    <span className="text-[10px] text-amber-500 font-medium mt-0.5 block">{c.dueDate}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* personal details */}
        {hasDetails && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              remembered
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(agentResponse.personalDetails ?? []).map((d, i) => (
                <motion.span
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-[11px] bg-white border border-neutral-100 rounded-full px-3 py-1 text-neutral-500"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                >
                  {d.detail}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
"use client"
import { use } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowLeft, Buildings, Briefcase, Sparkle, CheckCircle, Clock } from "@phosphor-icons/react"
import Link from "next/link"
import { usePerson } from "@/hooks/people/use-person"
import { useToggleCommitment } from "@/hooks/people/use-toggle-commitment"
import { useGenerateBriefing } from "@/hooks/briefing/use-generate-briefing"
import { QUERY_KEYS } from "@/lib/tanstack/query-keys"
import { useQueryClient } from "@tanstack/react-query"
import type { PersonData } from "@/services/people/people.api"

const avatarColors = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#f97316"]

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const { data, isPending, isError } = usePerson(id)
  const { mutateAsync: toggleCommitment, isPending: toggling } = useToggleCommitment()
  const { mutateAsync: generateBriefing, isPending: generatingBriefing, data: briefingData } = useGenerateBriefing()

  const handleToggleCommitment = (commitmentId: string, isCompleted: boolean) => {
    if (!data) return
    const prev: PersonData = {
      ...data,
      commitments: data.commitments.map((c) =>
        c.id === commitmentId ? { ...c, isCompleted } : c
      ),
    }
    queryClient.setQueryData(QUERY_KEYS.PEOPLE.DETAIL(id), prev)
    toggleCommitment({ personId: id, commitmentId, isCompleted }).catch(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PEOPLE.DETAIL(id) })
    })
  }

  const handleGenerateBriefing = () => {
    generateBriefing(id)
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-5 py-20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </div>
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-5 py-20 text-center">
          <p className="text-[13px] text-neutral-300">person not found</p>
          <Link href="/people" className="text-[12px] text-neutral-400 underline mt-2 block">
            go back
          </Link>
        </div>
      </main>
    )
  }

  const { person, commitments, personalDetails, notes } = data
  const color = avatarColors[person.name.charCodeAt(0) % avatarColors.length]
  const openCommitments = commitments.filter((c) => !c.isCompleted)
  const doneCommitments = commitments.filter((c) => c.isCompleted)
  const briefingText = briefingData?.briefing ?? person.summary

  return (
    <main className="min-h-screen bg-white">

      {/* top bar */}
      <div className="flex-shrink-0 w-full border-b border-neutral-50">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/people"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={14} className="text-neutral-500" />
          </Link>
          <button
            onClick={handleGenerateBriefing}
            disabled={generatingBriefing}
            className="flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-800 border border-neutral-100 hover:border-neutral-200 rounded-xl px-3 py-1.5 transition-all disabled:opacity-40"
          >
            <Sparkle size={11} className="text-amber-400" weight="fill" />
            {generatingBriefing ? "generating..." : "get briefing"}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">

        {/* person header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: color }}
          >
            {person.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold text-neutral-900 tracking-tight">{person.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {person.role && (
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Briefcase size={10} />
                  {person.role}
                </span>
              )}
              {person.company && (
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Buildings size={10} />
                  {person.company}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* briefing card */}
        <AnimatePresence>
          {briefingText && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkle size={11} className="text-amber-400" weight="fill" />
                <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold">
                  briefing
                </span>
              </div>
              <p className="text-[13px] text-neutral-600 leading-relaxed">
                {briefingText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* open commitments */}
        {openCommitments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              commitments
            </p>
            {openCommitments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 bg-white"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
              >
                <button
                  onClick={() => handleToggleCommitment(c.id, true)}
                  disabled={toggling}
                  className="w-4 h-4 rounded-[4px] border border-neutral-200 mt-0.5 flex-shrink-0 hover:border-neutral-400 transition-colors disabled:opacity-50"
                />
                <div className="min-w-0">
                  <p className="text-[13px] text-neutral-700 leading-snug">{c.action}</p>
                  {c.dueDate && (
                    <span className="text-[10px] text-amber-500 font-medium mt-0.5 block">
                      {c.dueDate}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* done commitments */}
        {doneCommitments.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              done
            </p>
            {doneCommitments.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-50 bg-neutral-50"
              >
                <CheckCircle
                  size={16}
                  className="text-neutral-300 mt-0.5 flex-shrink-0"
                  weight="fill"
                />
                <p className="text-[12px] text-neutral-400 line-through leading-snug">{c.action}</p>
              </div>
            ))}
          </div>
        )}

        {/* personal details */}
        {personalDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              remembered
            </p>
            <div className="flex flex-wrap gap-1.5">
              {personalDetails.map((d, i) => (
                <motion.span
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="text-[11px] bg-white border border-neutral-100 rounded-full px-3 py-1 text-neutral-500"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                >
                  {d.detail}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* notes timeline */}
        {notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold px-1">
              notes
            </p>
            <div className="space-y-2">
              {notes.map((pn, i) => (
                <motion.div
                  key={pn.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-2xl border border-neutral-100 bg-white"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                >
                  {pn.extractedContext && (
                    <p className="text-[13px] text-neutral-700 leading-relaxed mb-1.5">
                      {pn.extractedContext}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-3">
                    {pn.note.rawText}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock size={9} className="text-neutral-300" />
                    <span className="text-[10px] text-neutral-300">{timeAgo(pn.note.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* empty state */}
        {commitments.length === 0 && personalDetails.length === 0 && notes.length === 0 && (
          <p className="text-[13px] text-neutral-300 text-center py-8">
            no data yet — add a note mentioning {person.name.split(" ")[0]}
          </p>
        )}

        <div className="h-8" />
      </div>
    </main>
  )
}

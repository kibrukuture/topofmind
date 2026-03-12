"use client"
import { motion, AnimatePresence } from "motion/react"
import { User, CheckCircle, Sparkle, FileText } from "@phosphor-icons/react"
import type { ToolCallEntry } from "@/lib/agent-tool-call-log"

const icons: Record<string, React.ComponentType<Record<string, unknown>>> = {
  findPerson: User,
  createPerson: User,
  saveCommitment: CheckCircle,
  savePersonalDetail: Sparkle,
  saveExtractedContext: FileText,
}

const label = (item: ToolCallEntry) => {
  if (item.tool === "findPerson") return "found person"
  if (item.tool === "createPerson") return "created person"
  if (item.tool === "saveCommitment") return `commitment: ${item.action ?? ""}`
  if (item.tool === "savePersonalDetail") return `remembered: ${item.detail ?? ""}`
  if (item.tool === "saveExtractedContext") return `context: ${item.context ?? ""}`
  return item.tool
}

export function AgentLog({ items }: { items: ToolCallEntry[] }) {
  if (items.length === 0) return null

  return (
    <div className="w-full max-w-sm space-y-1.5">
      <AnimatePresence>
        {items.map((item, i) => {
          const Icon = icons[item.tool] ?? Sparkle
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.08 }}
              className="flex items-center gap-2 text-xs text-neutral-400"
            >
              <Icon size={12} className="text-amber-400 flex-shrink-0" weight="bold" />
              <span className="truncate">{label(item)}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
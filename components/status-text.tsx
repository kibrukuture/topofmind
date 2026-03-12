"use client"
import { AnimatePresence, motion } from "motion/react"
import { useRecordingStore } from "@/stores/recording-store"
import type { OrbState } from "@/validators/orb-state.validator"

const labels: Record<OrbState, string> = {
  idle: "tap to capture",
  recording: "listening...",
  transcribing: "transcribing...",
  processing: "extracting...",
  done: "captured",
}

export function StatusText() {
  const state = useRecordingStore((s) => s.state)
  return (
    <div className="h-6 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-neutral-400 tracking-wide absolute"
        >
          {labels[state]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Brain } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { Orb } from "@/components/orb"
import { StatusText } from "@/components/status-text"
import { Results } from "@/components/results"
import { NoteFeed } from "@/components/note-feed"
import { SearchBar } from "@/components/search-bar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { noteFormSchema, type NoteFormValues } from "@/validators/note-form.validator"
import { useProcessNote } from "@/hooks/agent/use-process-note"
import { useLatestNoteResult } from "@/hooks/agent/use-latest-note-result"
import { useRecordingStore } from "@/stores/recording-store"

export default function Home() {
  const [showTypeInput, setShowTypeInput] = useState<boolean>(false)
  const [refreshFeed, setRefreshFeed] = useState<number>(0)
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const state = useRecordingStore((s) => s.state)
  const setState = useRecordingStore((s) => s.setState)
  const startRecording = useRecordingStore((s) => s.startRecording)
  const stopRecording = useRecordingStore((s) => s.stopRecording)
  const stopAll = useRecordingStore((s) => s.stopAll)

  const processNoteMutation = useProcessNote()
  const latestNoteQuery = useLatestNoteResult()
  const latestNoteResult = processNoteMutation.data ?? latestNoteQuery.data ?? null

  // auto reset done → idle after 3s
  useEffect(() => {
    if (state === "done") {
      doneTimerRef.current = setTimeout(() => setState("idle"), 3000)
    }
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
    }
  }, [state, setState])

  // kill mic stream on unmount
  useEffect(() => {
    return () => {
      stopAll()
    }
  }, [stopAll])

  const typeForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: { text: "" },
  })

  const runProcessNote = async (input: { text?: string; audio?: Blob }): Promise<void> => {
    setState("processing")
    try {
      await processNoteMutation.mutateAsync(input)
      setState("done")
      setRefreshFeed((v) => v + 1)
    } catch {
      setState("idle")
    }
  }

  const handleOrbTap = async (): Promise<void> => {
    if (state === "transcribing" || state === "processing") return

    if (state === "idle" || state === "done") {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
      await startRecording(async (blob) => {
        await runProcessNote({ audio: blob })
      })
    } else if (state === "recording") {
      stopRecording()
    }
  }

  const handleTypeSubmit = typeForm.handleSubmit(async (values: NoteFormValues): Promise<void> => {
    const text = values.text.trim()
    if (!text) return
    setShowTypeInput(false)
    typeForm.reset({ text: "" })
    await runProcessNote({ text })
  })

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* top bar */}
      <div className="flex-shrink-0 w-full border-b border-neutral-50">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={15} className="text-neutral-800" weight="bold" />
            <span className="font-parafina text-[13px] font-semibold text-neutral-800 tracking-tight">
              top of mind
            </span>
          </div>
          <SearchBar />
        </div>
      </div>

      {/* scrollable feed */}
      <div className="flex-1 overflow-y-auto pb-60">
        <div className="max-w-lg mx-auto px-5 py-5 space-y-2">
          <NoteFeed key={refreshFeed} />
          <AnimatePresence>
            {latestNoteResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <Results agentResponse={latestNoteResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "linear-gradient(to top, rgba(255,255,255,1) 65%, rgba(255,255,255,0))",
        }}
      >
        <div className="max-w-lg mx-auto px-5 pt-6 pb-7 flex flex-col items-center gap-2">

          <div className="flex items-center gap-8">
            <div className="w-20" />
            <Orb onTap={handleOrbTap} />
            <button
              onClick={() => setShowTypeInput((v) => !v)}
              className="w-20 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors text-left whitespace-nowrap"
            >
              type instead
            </button>
          </div>

          <StatusText />

          <AnimatePresence>
            {showTypeInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                className="w-full overflow-hidden"
              >
                <Form {...typeForm}>
                  <form onSubmit={handleTypeSubmit} className="space-y-2 pt-2">
                    <FormField
                      control={typeForm.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <textarea
                              {...field}
                              autoFocus
                              rows={3}
                              placeholder="met sarah at stripe today, she is the cto..."
                              className="w-full text-[13px] text-neutral-700 placeholder-neutral-300 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-neutral-200 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      type="submit"
                      disabled={!typeForm.watch("text")?.trim()}
                      className="w-full text-[12px] font-semibold bg-neutral-900 hover:bg-neutral-700 disabled:opacity-25 text-white py-2 rounded-xl transition-colors"
                    >
                      process note
                    </button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </main>
  )
}
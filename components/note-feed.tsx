
"use client"
import { useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, Pause, Clock, Trash } from "@phosphor-icons/react"
import { getStoragePublicUrl } from "@/lib/storage-url"
import { useListNotes } from "@/hooks/notes/use-list-notes"
import { useDeleteNote } from "@/hooks/notes/use-delete-note"
import type { NoteWithPeople } from "@/services/notes/notes.api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const avatarColors = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#f97316"]

function AudioPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggle = (): void => {
    if (!audioRef.current) return
    playing ? audioRef.current.pause() : audioRef.current.play()
    setPlaying(!playing)
  }

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2.5 mt-3 px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-xl">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          setProgress((el.currentTime / el.duration) * 100)
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setProgress(0) }}
      />
      <button
        onClick={toggle}
        className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 hover:bg-neutral-700 transition-colors"
      >
        {playing
          ? <Pause size={10} className="text-white" weight="fill" />
          : <Play size={10} className="text-white" weight="fill" />
        }
      </button>
      <div className="flex items-center gap-[2px] flex-shrink-0">
        {[3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5, 7, 4, 6, 3].map((h, i) => (
          <div key={i} className="w-[2px] rounded-full bg-neutral-300" style={{ height: h }} />
        ))}
      </div>
      <div className="flex-1 relative h-[2px] bg-neutral-200 rounded-full overflow-hidden mx-1">
        <div
          className="absolute left-0 top-0 h-full bg-neutral-600 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-neutral-400 flex-shrink-0 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  )
}

interface NoteCardProps {
  note: NoteWithPeople
  index: number
  onDeleteRequest: (id: string) => void
}

function NoteCard({ note, index, onDeleteRequest }: NoteCardProps) {
  const [hovered, setHovered] = useState<boolean>(false)
  const isVoice = !!note.audioStorageKey
  const audioUrl = note.audioStorageKey ? getStoragePublicUrl(note.audioStorageKey) : ""

  const timeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative bg-white border border-neutral-100 rounded-2xl p-4 transition-shadow cursor-default"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
    >
      {/* delete — only on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteRequest(note.id)
            }}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg bg-neutral-50 hover:bg-red-50 border border-neutral-100 hover:border-red-100 transition-colors group z-10"
          >
            <Trash size={11} className="text-neutral-300 group-hover:text-red-400 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* top row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isVoice && (
            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2 py-0.5 font-medium leading-none">
              voice
            </span>
          )}
          {note.people.slice(0, 3).map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1 text-[10px] bg-neutral-50 text-neutral-500 border border-neutral-100 rounded-full px-2 py-0.5 leading-none"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block"
                style={{ background: avatarColors[p.name.charCodeAt(0) % avatarColors.length] }}
              />
              {p.name.split(" ")[0]}
            </span>
          ))}
          {note.people.length > 3 && (
            <span className="text-[10px] text-neutral-400">+{note.people.length - 3}</span>
          )}
        </div>
        {/* pr-6 keeps timestamp clear of delete button */}
        <span className="flex items-center gap-1 text-[10px] text-neutral-300 flex-shrink-0 pr-6">
          <Clock size={9} />
          {timeAgo(note.createdAt)}
        </span>
      </div>

      <p className="text-[13px] text-neutral-600 leading-relaxed line-clamp-4">
        {note.rawText}
      </p>

      {isVoice && audioUrl && <AudioPlayer src={audioUrl} />}
    </motion.div>
  )
}

export function NoteFeed() {
  const { data: notes = [], isLoading } = useListNotes()
  const deleteMutation = useDeleteNote()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!pendingDeleteId) return
    await deleteMutation.mutateAsync(pendingDeleteId)
    setPendingDeleteId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-neutral-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <p className="text-[13px] text-neutral-300 text-center py-16">
        no notes yet — tap the orb to start
      </p>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {notes.map((note, i) => (
          <NoteCard
            key={note.id}
            note={note}
            index={i}
            onDeleteRequest={(id) => setPendingDeleteId(id)}
          />
        ))}
      </div>

      <Dialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>delete this note?</DialogTitle>
            <DialogDescription>
              The note and everything we pulled from it (people, commitments, details) will be removed. You can always add new notes later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/20"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "deleting..." : "delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
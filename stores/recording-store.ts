import { create } from "zustand"
import type { OrbState } from "@/validators/orb-state.validator"

type RecordingStoppedCallback = (blob: Blob) => Promise<void>

interface RecordingState {
  state: OrbState
  stream: MediaStream | null
  _recorder: MediaRecorder | null
  _chunks: Blob[]

  setState: (state: OrbState) => void
  startRecording: (onRecordingStopped: RecordingStoppedCallback) => Promise<void>
  stopRecording: () => void
  stopAll: () => void
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  state: "idle",
  stream: null,
  _recorder: null,
  _chunks: [],

  setState: (state) => set({ state }),

  startRecording: async (onRecordingStopped) => {
    if (get().state === "recording") return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks: Blob[] = []
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (e: BlobEvent): void => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = async (): Promise<void> => {
        stream.getTracks().forEach((t) => t.stop())
        set({ stream: null, state: "transcribing" })
        const blob = new Blob(chunks, { type: "audio/webm" })
        await onRecordingStopped(blob)
      }

      recorder.start()
      set({ state: "recording", stream, _recorder: recorder, _chunks: chunks })
    } catch {
      set({ state: "idle" })
    }
  },

  stopRecording: () => {
    const recorder = get()._recorder
    if (recorder && get().state === "recording") recorder.stop()
  },

  stopAll: () => {
    const stream = get().stream
    if (stream) stream.getTracks().forEach((t) => t.stop())
    set({ stream: null, state: "idle", _recorder: null, _chunks: [] })
  },
}))

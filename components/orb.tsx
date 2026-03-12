 "use client"
import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

type OrbState = "idle" | "recording" | "transcribing" | "processing" | "done"

interface OrbProps {
  state: OrbState
  onTap: () => void
}

interface StateConfig {
  background: string
  boxShadow: string
}

const stateConfig: Record<OrbState, StateConfig> = {
  idle: {
    background: "radial-gradient(circle at 35% 35%, #e5e7eb, #9ca3af)",
    boxShadow: "0 0 20px 4px rgba(0,0,0,0.07), inset 0 2px 3px rgba(255,255,255,0.6)",
  },
  recording: {
    background: "radial-gradient(circle at 35% 35%, #fde68a, #f59e0b)",
    boxShadow: "0 0 28px 10px rgba(245,158,11,0.25), inset 0 2px 3px rgba(255,255,255,0.5)",
  },
  transcribing: {
    background: "radial-gradient(circle at 35% 35%, #bfdbfe, #3b82f6)",
    boxShadow: "0 0 24px 8px rgba(59,130,246,0.2), inset 0 2px 3px rgba(255,255,255,0.4)",
  },
  processing: {
    background: "radial-gradient(circle at 35% 35%, #c7d2fe, #6366f1)",
    boxShadow: "0 0 28px 10px rgba(99,102,241,0.2), inset 0 2px 3px rgba(255,255,255,0.4)",
  },
  done: {
    background: "radial-gradient(circle at 35% 35%, #d1fae5, #10b981)",
    boxShadow: "0 0 20px 6px rgba(16,185,129,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
  },
}

 
const sounds: Partial<Record<OrbState, string>> = {
  recording:    "/sounds/orb-record-start.wav",
  transcribing: "/sounds/orb-record-stop.wav",
  processing:   "/sounds/orb-processing.wav",
  done:         "/sounds/orb-done.wav",
}

function playSound(src: string, volume = 0.35): void {
  const audio = new Audio(src)
  audio.volume = volume
  audio.play().catch(() => undefined)
}

interface RecordingTimerProps {
  active: boolean
}

function RecordingTimer({ active }: RecordingTimerProps) {
  const [elapsed, setElapsed] = useState<number>(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (active) {
      startRef.current = performance.now()
      const tick = (): void => {
        setElapsed(performance.now() - (startRef.current ?? 0))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current!)
      setElapsed(0)
      startRef.current = null
    }
    return () => cancelAnimationFrame(rafRef.current!)
  }, [active])

  const totalSeconds = elapsed / 1000
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  const tenths = Math.floor((elapsed % 1000) / 100)
  const display = `${mins > 0 ? `${mins}:` : ""}${String(secs).padStart(mins > 0 ? 2 : 1, "0")}.${tenths}`

  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : 4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="text-[11px] text-amber-500 font-medium tabular-nums tracking-tight"
    >
      {display}
    </motion.span>
  )
}

export function Orb({ state, onTap }: OrbProps) {
  const volume = useMotionValue<number>(0)
  const springVolume = useSpring(volume, { stiffness: 200, damping: 20 })
  const orbScale = useTransform(springVolume, [0, 100], [1, 1.14])
  const animFrameRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | undefined>(undefined)
  const prevStateRef = useRef<OrbState>(state)

  // play sound on state transition
  useEffect(() => {
    if (prevStateRef.current === state) return
    prevStateRef.current = state
    const src = sounds[state]
    if (src) playSound(src)
  }, [state])

  // mic volume analyser
  useEffect(() => {
    if (state !== "recording") {
      cancelAnimationFrame(animFrameRef.current!)
      volume.set(0)
      return
    }

    const tick = (): void => {
      if (!analyserRef.current) return
      const data = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      volume.set(avg)
      animFrameRef.current = requestAnimationFrame(tick)
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        ctx.createMediaStreamSource(stream).connect(analyser)
        analyserRef.current = analyser
        tick()
      })
      .catch(() => undefined)

    return () => cancelAnimationFrame(animFrameRef.current!)
  }, [state, volume])

  const cfg = stateConfig[state]

  return (
    <div className="flex flex-col items-center gap-1.5">

      <div className="h-4 flex items-center justify-center">
        <RecordingTimer active={state === "recording"} />
      </div>

      <div className="relative flex items-center justify-center w-20 h-20">

        {([0, 1, 2] as const).map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-amber-300/40"
            initial={{ width: 56, height: 56, opacity: 0 }}
            animate={
              state === "recording"
                ? { width: [56, 100 + i * 16], height: [56, 100 + i * 16], opacity: [0.5, 0] }
                : { opacity: 0 }
            }
            transition={{ duration: 1.8, delay: i * 0.55, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

        {state === "transcribing" && (
          <motion.div
            className="absolute w-16 h-16 rounded-full border-[1.5px] border-transparent border-t-blue-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}

        <motion.div
          onClick={onTap}
          style={{
            scale: state === "recording" ? orbScale : 1,
            background: cfg.background,
            boxShadow: cfg.boxShadow,
          }}
          animate={{
            scale:
              state === "idle" ? [1, 1.04, 1] :
              state === "processing" ? [1, 1.06, 1] :
              1,
          }}
          transition={
            state === "idle" || state === "processing"
              ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 200, damping: 20 }
          }
          className="w-14 h-14 rounded-full cursor-pointer relative z-10 select-none"
        >
          <div
            className="absolute rounded-full opacity-60"
            style={{
              top: "18%",
              left: "20%",
              width: "30%",
              height: "20%",
              background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)",
            }}
          />
        </motion.div>

      </div>
    </div>
  )
}
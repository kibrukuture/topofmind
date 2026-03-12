"use client"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ArrowLeft, Buildings, Briefcase, ArrowRight, Users } from "@phosphor-icons/react"
import Link from "next/link"
import { SearchBar } from "@/components/search-bar"

interface Person {
  id: string
  name: string
  company?: string | null
  role?: string | null
  summary?: string | null
  createdAt: string
  openCommitmentsCount: number
}

const avatarColors = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#f97316"]

function PersonCard({ person, index }: { person: Person; index: number }) {
  const color = avatarColors[person.name.charCodeAt(0) % avatarColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
    >
      <Link href={`/people/${person.id}`}>
        <div className="bg-white border border-neutral-100 hover:border-neutral-200 rounded-2xl p-4 transition-all group">
          <div className="flex items-center gap-3">
            {/* avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: color }}
            >
              {person.name.charAt(0).toUpperCase()}
            </div>

            {/* info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-neutral-800 truncate">{person.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {person.role && (
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Briefcase size={9} />
                    {person.role}
                  </span>
                )}
                {person.company && (
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Buildings size={9} />
                    {person.company}
                  </span>
                )}
              </div>
            </div>

            {/* right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {person.openCommitmentsCount > 0 && (
                <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2 py-0.5 font-medium">
                  {person.openCommitmentsCount} open
                </span>
              )}
              <ArrowRight
                size={13}
                className="text-neutral-200 group-hover:text-neutral-400 transition-colors"
              />
            </div>
          </div>

          {/* summary preview if exists */}
          {person.summary && (
            <p className="text-[11px] text-neutral-400 leading-relaxed mt-2.5 line-clamp-2">
              {person.summary}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/people")
      .then((r) => r.json())
      .then((payload) => {
        const list = payload?.data ?? payload ?? []
        setPeople(Array.isArray(list) ? list : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* top bar */}
      <div className="flex-shrink-0 w-full border-b border-neutral-50">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft size={14} className="text-neutral-500" />
            </Link>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-neutral-800" weight="bold" />
              <span className="font-parafina text-[13px] font-semibold text-neutral-800 tracking-tight">
                your network
              </span>
            </div>
          </div>
          <SearchBar />
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-5">

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && people.length === 0 && (
            <p className="text-[13px] text-neutral-300 text-center py-16">
              no people yet — add some notes first
            </p>
          )}

          {!loading && people.length > 0 && (
            <div className="space-y-2">
              {people.map((person, i) => (
                <PersonCard key={person.id} person={person} index={i} />
              ))}
            </div>
          )}

        </div>
      </div>

    </main>
  )
}
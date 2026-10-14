import React, { useMemo, useState } from 'react'

/* ───────────────────────── class emblems ───────────────────────── */

// Class artwork is mapped from the saved `cls` value, so choosing a class
// automatically gives the member the matching visual without storing image data per member.
const ClassIcon = ({ cls, size = 32 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  }

  const frame = (
    <rect x="1" y="1" width="46" height="46" rx="10" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.22" />
  )

  if (cls === 'Archer') return (
    <svg {...common} className="text-emerald-300">
      {frame}
      <path d="M31.5 8.5C22 13 17 22 17 32c0 4 1.5 6 3 8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M16.5 10.5c9.5 4.5 14.5 13.5 14.5 23.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".7"/>
      <path d="M10 28h27" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="m31 24 8 4-8 4 2.5-4L31 24Z" fill="currentColor"/>
    </svg>
  )

  if (cls === 'Warlord') return (
    <svg {...common} className="text-sky-300">
      {frame}
      <path d="M13 19 17 11l7 4 7-4 4 8v8c0 8-5.5 12-12 15-6.5-3-12-7-12-15v-8Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/>
      <path d="M15 22h18M18 28h12M21 34h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".9"/>
    </svg>
  )

  if (cls === 'Skald') return (
    <svg {...common} className="text-violet-300">
      {frame}
      <path d="M16 13c10 1 16 7 16 15 0 7-5 11-11 11-5 0-9-3-9-8 0-5 4-8 9-8 4 0 7 2 7 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M25 11v21M21 35h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="20" cy="31" r="2.3" fill="currentColor"/>
    </svg>
  )

  if (cls === 'Volva') return (
    <svg {...common} className="text-fuchsia-300">
      {frame}
      <path d="M24 8v32M12 14l24 20M36 14 12 34" stroke="currentColor" strokeWidth="1.7" opacity=".65"/>
      <path d="M24 13 28 20l7 4-7 4-4 7-4-7-7-4 7-4 4-7Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round"/>
      <circle cx="24" cy="24" r="3" fill="currentColor"/>
    </svg>
  )

  if (cls === 'Rune Fighter') return (
    <svg {...common} className="text-gold-bright">
      {frame}
      <path d="M24 7v34M14 14l20 20M34 14 14 34" stroke="currentColor" strokeWidth="1.4" opacity=".45"/>
      <path d="M28 8 15 27h9l-4 13 13-20h-9l4-12Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="1.1" opacity=".45"/>
    </svg>
  )

  // Berserker is the default and also the fallback for unknown/new classes.
  return (
    <svg {...common} className="text-red-300">
      {frame}
      <path d="M14 12 24 18l10-6-2 12 5 9-11-3-11 3 5-9-2-12Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
      <path d="m13 18 8 8M35 18l-8 8M24 18v18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/>
    </svg>
  )
}

const classIconTone = (cls) =>
  cls === 'Archer' ? 'border-emerald-400/30 bg-emerald-400/[0.07]' :
  cls === 'Warlord' ? 'border-sky-400/30 bg-sky-400/[0.07]' :
  cls === 'Skald' ? 'border-violet-400/30 bg-violet-400/[0.07]' :
  cls === 'Volva' ? 'border-fuchsia-400/30 bg-fuchsia-400/[0.07]' :
  cls === 'Rune Fighter' ? 'border-gold/35 bg-gold/[0.08]' :
  'border-red-400/30 bg-red-400/[0.07]'

// rgb triplets used for the soft glow behind each class emblem
const CLASS_GLOW = {
  Archer: '110,231,183',
  Warlord: '125,211,252',
  Skald: '196,181,253',
  Volva: '240,171,252',
  'Rune Fighter': '242,204,96',
}
const classGlow = cls => CLASS_GLOW[cls] || '252,165,165'

/* ───────────────────────── data ───────────────────────── */

const CATEGORIES = {
  power: {
    label: 'Combat Power',
    shortLabel: 'Power',
    tagline: 'Strongest warriors',
    icon: '⚔️',
    field: 'power',
    suffix: '',
  },
  coins: {
    label: 'Wealth',
    shortLabel: 'Coins',
    tagline: 'Richest hoarders',
    icon: '🪙',
    field: 'coins',
    suffix: '',
  },
  attendance: {
    label: 'Activity',
    shortLabel: 'Events',
    tagline: 'Most dedicated',
    icon: '◆',
    field: 'attendance',
    suffix: 'x',
  },
}

const PODIUM = {
  1: { title: 'Champion', rgb: '242,204,96', text: 'text-gold-bright', border: 'border-gold/50' },
  2: { title: 'Runner-up', rgb: '203,213,225', text: 'text-slate-200', border: 'border-slate-300/40' },
  3: { title: 'Third Place', rgb: '205,127,50', text: 'text-orange-300', border: 'border-orange-400/40' },
}

const PAGE_SIZE = 10

/* ───────────────────────── small pieces ───────────────────────── */

const Crown = ({ size = 26, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4L3 18Zm0 2h18v2H3v-2Z" />
  </svg>
)

// Little gold corner brackets that make a panel feel like a game window.
function Corners({ className = 'border-gold/55' }) {
  const base = `pointer-events-none absolute h-3 w-3 ${className}`
  return (
    <>
      <span aria-hidden="true" className={`${base} left-1.5 top-1.5 border-l border-t`} />
      <span aria-hidden="true" className={`${base} right-1.5 top-1.5 border-r border-t`} />
      <span aria-hidden="true" className={`${base} bottom-1.5 left-1.5 border-b border-l`} />
      <span aria-hidden="true" className={`${base} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  )
}

function RankBadge({ rank }) {
  const p = PODIUM[rank]

  if (p) {
    return (
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border font-spectral text-[16px] font-bold ${p.text} ${p.border}`}
        style={{
          background: `radial-gradient(circle at 30% 25%, rgba(${p.rgb},.35), rgba(${p.rgb},.08))`,
          boxShadow: `0 0 14px -2px rgba(${p.rgb},.55)`,
        }}
      >
        {rank}
      </span>
    )
  }

  return (
    <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-white/[.08] bg-black/25 px-1.5 font-mono text-[14px] font-bold tabular-nums text-text-dim">
      {rank}
    </span>
  )
}

function Emblem({ cls, size = 44, glow = false, className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border ${classIconTone(cls)} ${className}`}
      style={{
        width: size + 10,
        height: size + 10,
        boxShadow: glow ? `0 0 26px -4px rgba(${classGlow(cls)},.55)` : undefined,
      }}
      title={cls || 'Berserker'}
    >
      <ClassIcon cls={cls} size={size} />
    </div>
  )
}

function RankValue({ rank, top = false }) {
  return (
    <span className={`font-mono font-bold tabular-nums ${
      top ? 'text-gold-bright' : 'text-text-bright'
    }`}>
      #{rank}
    </span>
  )
}


/* ───────────────────────── page ───────────────────────── */

export default function Leaderboard({ ctx }) {
  const { members = [], currentUser } = ctx
  const [category, setCategory] = useState('power')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Admin accounts are hidden from everyone except other Admins.
  const isAdmin = currentUser?.role === 'Admin'
  const visibleMembers = useMemo(
    () => (isAdmin ? members : members.filter(m => m.role !== 'Admin')),
    [members, isAdmin]
  )

  const activeCategory = CATEGORIES[category]
  const field = activeCategory.field
  const valueOf = member => Number(member?.[field]) || 0

  // Always calculate the official ranking from the complete member list first.
  // Search only filters what is displayed; it must never change a member's rank.
  const allRankedMembers = useMemo(() => {
    return [...visibleMembers].sort((a, b) => (Number(b[field]) || 0) - (Number(a[field]) || 0))
  }, [visibleMembers, field])

  const rankById = useMemo(
    () => new Map(allRankedMembers.map((m, i) => [m.id, i + 1])),
    [allRankedMembers]
  )

  const query = search.trim().toLowerCase()

  const rankedMembers = useMemo(() => {
    if (!query) return allRankedMembers

    return allRankedMembers.filter(member => (
      String(member.name || '').toLowerCase().includes(query) ||
      String(member.cls || '').toLowerCase().includes(query) ||
      String(member.role || '').toLowerCase().includes(query)
    ))
  }, [allRankedMembers, query])

  // One continuous ranking board keeps the page simple.
  // Search filters the visible rows but never changes official ranks.
  const showPodium = false
  const listMembers = rankedMembers

  const totalPages = Math.max(1, Math.ceil(listMembers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageMembers = listMembers.slice(startIndex, startIndex + PAGE_SIZE)

  const topValue = allRankedMembers.length ? valueOf(allRankedMembers[0]) : 0
  const getRank = member => rankById.get(member.id) || 0
  const isMeMember = member => !!currentUser && String(member.id) === String(currentUser.id)

  const formatNumber = value => (Number(value) || 0).toLocaleString()
  const formatValue = value => `${formatNumber(value)}${activeCategory.suffix}`

  // "Your standing" banner
  const myIndex = currentUser
    ? allRankedMembers.findIndex(m => String(m.id) === String(currentUser.id))
    : -1
  const me = myIndex >= 0 ? allRankedMembers[myIndex] : null
  const myRank = myIndex + 1
  const above = myIndex > 0 ? allRankedMembers[myIndex - 1] : null
  const gap = me && above ? valueOf(above) - valueOf(me) : 0
  const topPercent = me ? Math.max(1, Math.ceil((myRank / allRankedMembers.length) * 100)) : 0
  const canJumpToMe = !!me

  const changeCategory = nextCategory => {
    setCategory(nextCategory)
    setPage(1)
  }

  const changeSearch = value => {
    setSearch(value)
    setPage(1)
  }

  const jumpToMe = () => {
    if (!me || myRank <= 0) return

    const targetPage = Math.floor((myRank - 1) / PAGE_SIZE) + 1
    setSearch('')
    setPage(targetPage)

    const scrollToMe = () => {
      const target = document.querySelector(
        `[data-leaderboard-member-id="${String(me.id)}"]`
      )
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    if (targetPage === safePage) {
      requestAnimationFrame(scrollToMe)
    } else {
      setTimeout(scrollToMe, 80)
    }
  }

  return (
    <div className="lb-root mx-auto w-full max-w-5xl space-y-4">
      <style>{LB_STYLES}</style>

      {/* ── Header + category tabs ───────────────────────────────── */}
      <header className="lb-glass rounded-[22px] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="font-spectral text-[28px] font-bold leading-tight text-text-bright sm:text-[32px]">Leaderboard</h1>
            <p className="mt-0.5 text-[13px] text-text-dim">
              {visibleMembers.length} members ranked by <span className="font-semibold text-gold-light">{activeCategory.label.toLowerCase()}</span>
            </p>
          </div>

          <div className="lb-seg grid grid-cols-3" role="tablist" aria-label="Ranking category">
            {Object.entries(CATEGORIES).map(([key, item]) => {
              const active = category === key
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeCategory(key)}
                  className="lb-seg-btn"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.shortLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Your standing ────────────────────────────────────────── */}
      {me && (
        <section className="lb-solid lb-me relative overflow-hidden rounded-[20px] px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <Emblem cls={me.cls} size={34} glow />
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[.16em] text-gold-dim">Your standing</div>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-spectral text-[30px] font-bold leading-none text-gold-bright">#{myRank}</span>
                  <span className="text-[14px] text-text-dim">of {allRankedMembers.length}</span>
                  <span className="rounded-full border border-gold/20 bg-gold/[.06] px-2 py-0.5 text-[11px] font-bold text-gold-light">Top {topPercent}%</span>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[360px]">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="font-mono font-bold tabular-nums text-text-bright">{formatValue(valueOf(me))}</span>
                <span className="min-w-0 truncate text-right text-text-dim">
                  {above
                    ? gap === 0
                      ? `Tied with ${above.name}`
                      : <>{formatNumber(gap)}{activeCategory.suffix} behind <span className="font-semibold text-text-bright">{above.name}</span></>
                    : <span className="font-semibold text-gold-light">You are #1 👑</span>}
                </span>
              </div>
              {above && gap > 0 && (
                <div className="lb-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(4, Math.min(100, Math.round((valueOf(me) / Math.max(1, valueOf(above))) * 100)))}%` }} />
                </div>
              )}
            </div>

            <button type="button" onClick={jumpToMe} disabled={!canJumpToMe} className="lb-btn lb-btn-gold shrink-0">
              Find me ↓
            </button>
          </div>
        </section>
      )}

      {/* ── Ranking board ────────────────────────────────────────── */}
      <section className="lb-solid overflow-hidden rounded-[22px]">
        <div className="flex flex-col gap-3 border-b border-white/[.07] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/20 bg-gold/[.07] text-[17px]" aria-hidden="true">{activeCategory.icon}</span>
            <div>
              <h2 className="text-[16px] font-bold leading-tight text-text-bright">{activeCategory.label}</h2>
              <div className="text-[12px] text-text-dim">
                {activeCategory.tagline} · {query ? `${rankedMembers.length} found` : 'highest first'}
              </div>
            </div>
          </div>

          <div className="relative sm:w-[300px]">
            <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-text-dim">⌕</span>
            <input
              value={search}
              onChange={e => changeSearch(e.target.value)}
              placeholder="Search name, class, or role…"
              className="lb-field h-10 w-full pl-9 pr-9 text-[14px]"
              aria-label="Search members"
            />
            {search && (
              <button
                type="button"
                onClick={() => changeSearch('')}
                className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg text-[16px] leading-none text-text-dim hover:bg-white/[.06] hover:text-text-bright"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {pageMembers.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="text-[28px] opacity-60" aria-hidden="true">{query ? '⌕' : '🏆'}</div>
            <div className="mt-2 text-[15px] font-semibold text-text-bright">{query ? 'No members found' : 'No ranking data'}</div>
            <div className="mt-1 text-[13px] text-text-dim">{query ? 'Try another name, class, or role.' : 'There are no members to rank yet.'}</div>
            {query && <button type="button" onClick={() => changeSearch('')} className="lb-btn mt-4">Clear search</button>}
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[64px_minmax(0,1fr)_130px_minmax(150px,1fr)] gap-3 border-b border-white/[.06] bg-black/20 px-5 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-text-dim sm:grid">
              <div>Rank</div>
              <div>Member</div>
              <div>Class</div>
              <div className="text-right">{activeCategory.shortLabel}</div>
            </div>

            <div className="divide-y divide-white/[.05]">
              {pageMembers.map((member, index) => {
                const rank = getRank(member)
                const mine = isMeMember(member)
                const value = valueOf(member)
                const pct = topValue > 0
                  ? Math.max(3, Math.min(100, Math.round((value / topValue) * 100)))
                  : 0
                const podium = PODIUM[rank]

                return (
                  <div
                    key={`${category}-${member.id}`}
                    data-leaderboard-member-id={String(member.id)}
                    className={`lb-in lb-row relative px-3.5 py-3 sm:px-5 ${mine ? 'lb-row-me' : ''}`}
                    style={{
                      animationDelay: `${Math.min(index, 10) * 18}ms`,
                      ...(podium ? { '--lb-podium': podium.rgb } : {}),
                    }}
                    data-podium={podium ? rank : undefined}
                  >
                    <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[64px_minmax(0,1fr)_130px_minmax(150px,1fr)]">
                      <div>
                        {podium ? <RankBadge rank={rank} /> : <RankPill rank={rank} />}
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <Emblem cls={member.cls} size={28} glow={!!podium} className={mine ? 'ring-1 ring-gold/40' : ''} />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className={`truncate text-[14px] font-semibold ${podium ? podium.text : 'text-text-bright'}`}>{member.name}</span>
                            {rank === 1 && <Crown size={14} className="shrink-0 text-gold-bright" />}
                            {mine && <span className="shrink-0 rounded-full bg-gold/[.15] px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-gold-light">You</span>}
                          </div>
                          <div className="truncate text-[12px] text-text-dim sm:hidden">{member.cls || 'Berserker'} · {member.role || 'Member'}</div>
                          <div className="hidden truncate text-[12px] text-text-dim sm:block">{podium ? podium.title : (member.role || 'Member')}</div>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <span className={`inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-1 text-[12px] font-semibold text-text ${classIconTone(member.cls)}`}>
                          {member.cls || 'Berserker'}
                        </span>
                      </div>

                      <div className="min-w-[78px] text-right">
                        <div className={`font-mono text-[15px] font-bold tabular-nums ${rank <= 3 ? 'text-gold-light' : 'text-text-bright'}`}>
                          {formatValue(value)}
                        </div>
                        <div className="lb-meter mt-1.5 hidden sm:block" aria-hidden="true">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="lb-meter mt-2 sm:hidden" aria-hidden="true">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[.06] px-4 py-3 sm:px-5">
                <div className="text-[12px] text-text-dim sm:text-[13px]">
                  Showing <span className="font-semibold text-text-bright">{startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, listMembers.length)}</span> of {listMembers.length}
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" disabled={safePage === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="lb-btn">‹ Prev</button>
                  <span className="min-w-[64px] text-center font-mono text-[12px] text-text-dim">{safePage} / {totalPages}</span>
                  <button type="button" disabled={safePage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="lb-btn">Next ›</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

/* ───────────────────────── UI-only helpers ───────────────────────── */

function RankPill({ rank }) {
  return (
    <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl border border-white/[.08] bg-black/25 px-1.5 font-mono text-[13px] font-bold tabular-nums text-text-dim">
      {rank}
    </span>
  )
}

// Glass look shared with the other portal pages. Only the header uses live
// blur; the big lists are solid so scrolling stays smooth on phones.
const LB_STYLES = `
  @keyframes lb-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  .lb-in { animation: lb-in .22s ease both; }
  @media (prefers-reduced-motion: reduce) { .lb-in { animation: none; } }

  .lb-root .lb-glass {
    position: relative;
    background:
      radial-gradient(120% 70% at 0% 0%, rgba(255,255,255,.07) 0%, transparent 50%),
      linear-gradient(160deg, rgba(34,28,22,.58) 0%, rgba(12,10,8,.66) 100%);
    backdrop-filter: blur(18px) saturate(150%);
    -webkit-backdrop-filter: blur(18px) saturate(150%);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 22px 60px -30px rgba(0,0,0,.85);
  }
  @media (max-width: 767px) {
    .lb-root .lb-glass { backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); }
  }
  .lb-root .lb-solid {
    background:
      radial-gradient(120% 70% at 0% 0%, rgba(255,255,255,.05) 0%, transparent 50%),
      linear-gradient(160deg, rgba(28,23,18,.94) 0%, rgba(12,10,8,.96) 100%);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 20px 50px -30px rgba(0,0,0,.9);
  }
  .lb-root .lb-me {
    border-color: rgba(212,175,55,.28);
    background:
      radial-gradient(90% 120% at 0% 0%, rgba(212,175,55,.12) 0%, transparent 55%),
      linear-gradient(160deg, rgba(30,24,16,.95) 0%, rgba(12,10,8,.96) 100%);
  }

  /* Category tabs */
  .lb-root .lb-seg { gap: 4px; padding: 4px; border-radius: 14px; background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.07); min-width: 280px; }
  .lb-root .lb-seg-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 38px; padding: 0 12px; border-radius: 10px;
    font-size: 13px; font-weight: 700; color: #a79c8a;
    transition: background .2s ease, color .2s ease, box-shadow .2s ease;
  }
  .lb-root .lb-seg-btn:hover { color: #f4ebd9; background: rgba(255,255,255,.03); }
  .lb-root .lb-seg-btn[aria-selected="true"] {
    color: #1a1206;
    background: linear-gradient(180deg, #f2d27a 0%, #d4af37 55%, #b38d2a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 6px 18px -8px rgba(212,175,55,.6);
  }

  /* Buttons & search */
  .lb-root .lb-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 36px; padding: 0 14px; border-radius: 11px;
    border: 1px solid rgba(255,255,255,.09); background: rgba(255,255,255,.03);
    font-size: 12px; font-weight: 700; color: #a79c8a;
    transition: border-color .2s ease, color .2s ease, background .2s ease;
  }
  .lb-root .lb-btn:hover:not(:disabled) { border-color: rgba(212,175,55,.3); color: #f4ebd9; }
  .lb-root .lb-btn:disabled { opacity: .35; cursor: not-allowed; }
  .lb-root .lb-btn-gold { border-color: rgba(212,175,55,.3); background: rgba(212,175,55,.08); color: #e7c873; }
  .lb-root .lb-btn-gold:hover:not(:disabled) { background: rgba(212,175,55,.14); color: #f2cc60; }
  .lb-root .lb-field {
    border-radius: 12px; border: 1px solid rgba(255,255,255,.09); background: rgba(0,0,0,.3);
    color: #f4ebd9; outline: none; transition: border-color .2s ease, box-shadow .2s ease;
  }
  .lb-root .lb-field::placeholder { color: rgba(167,156,138,.6); }
  .lb-root .lb-field:focus { border-color: rgba(212,175,55,.45); box-shadow: 0 0 0 3px rgba(212,175,55,.1); }

  /* Rows */
  .lb-root .lb-row { transition: background .15s ease; }
  .lb-root .lb-row:hover { background: rgba(255,255,255,.025); }
  .lb-root .lb-row[data-podium] {
    background: linear-gradient(90deg, rgba(var(--lb-podium), .09) 0%, transparent 60%);
  }
  .lb-root .lb-row[data-podium]::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: rgb(var(--lb-podium)); opacity: .75;
  }
  .lb-root .lb-row-me { background: rgba(212,175,55,.07) !important; box-shadow: inset 0 0 0 1px rgba(212,175,55,.25); }
  .lb-root .lb-row-me::after {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #f2cc60;
  }

  /* Value meters */
  .lb-root .lb-meter { height: 5px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.06); }
  .lb-root .lb-meter > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, rgba(179,141,42,.8), rgba(242,210,122,.95)); }
  .lb-root .lb-bar { height: 6px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.07); }
  .lb-root .lb-bar > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #b38d2a, #f2d27a); }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .lb-root .lb-glass { background: rgba(16,13,11,.96); }
  }
`

/* ─────────────────────────────────────────────────────────────────────
   PeakyBlinder · editable attendance rewards
   One reward table for the whole clan, edited in Attendance → Reward Guide.

   - Saved in Supabase (table `attendance_reward_config`, see attendance_rewards.sql).
   - Read once when the page opens, then reused for 10 minutes. The last copy
     is also kept in the browser, so the page shows it instantly next time.
   - If Supabase can't be reached (or the table doesn't exist yet), the
     built-in DEFAULT_REWARDS below are used, so recording never breaks.
   - Only Admin / Master / Elder can save (checked again in the database).
   ───────────────────────────────────────────────────────────────────── */
import { useEffect, useState } from 'react'

export const REWARD_EDIT_ROLES = ['Admin', 'Master', 'Elder']
export const canEditRewards = user => REWARD_EDIT_ROLES.includes(user?.role)

// Event names must match the attendance events exactly.
export const REWARD_EVENTS = [
  { event: 'Inter-Server Battle', label: 'Server Battle', short: 'Battle' },
  { event: 'World Boss', label: 'World Boss', short: 'Boss' },
  { event: 'Clan Annihilation', label: 'Clan Annihilation', short: 'Annihilation' },
  { event: "Sindri's Treasure Island", label: "Sindri's Treasure Island", short: 'Sindri' },
  { event: 'Clan Sanctuary', label: 'Clan Sanctuary', short: 'Sanctuary' },
]

// The clan's original reward table. Used until Supabase answers, or if it can't.
export const DEFAULT_REWARDS = {
  events: {
    'Inter-Server Battle': { base: 100, bonuses: [5, 10, 15, 20] },
    'World Boss': { base: 50, bonuses: [3, 5, 10, 15] },
    'Clan Annihilation': { base: 75, bonuses: [5, 10, 15, 20] },
    "Sindri's Treasure Island": { base: 75, bonuses: [5, 10, 15, 20] },
    'Clan Sanctuary': { base: 50, bonuses: [3, 5, 10, 15] },
  },
  // GP needed for bonus tier 1, 2, 3, 4 (below tier 1 = no GP bonus).
  gpTiers: [100000, 150000, 200000, 250000],
  perfectBonus: 150,
}

const CACHE_MS = 10 * 60 * 1000
const LOCAL_KEY = 'pb-attendance-rewards-v1'
const MAX_COINS = 100000
const MAX_GP = 100000000

const toInt = (value, fallback = 0) => {
  const n = Math.round(Number(value))
  return Number.isFinite(n) ? n : fallback
}
const clampCoins = n => Math.min(MAX_COINS, Math.max(0, toInt(n)))

// Clean a reward table: whole numbers, never negative, tiers in rising order.
export function normalizeRewards(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const events = {}
  for (const { event } of REWARD_EVENTS) {
    const def = DEFAULT_REWARDS.events[event]
    const given = src.events?.[event] || {}
    const bonuses = Array.isArray(given.bonuses) ? given.bonuses : def.bonuses
    events[event] = {
      base: clampCoins(given.base ?? def.base),
      bonuses: [0, 1, 2, 3].map(i => clampCoins(bonuses[i] ?? def.bonuses[i])),
    }
  }
  const tiersIn = Array.isArray(src.gpTiers) ? src.gpTiers : DEFAULT_REWARDS.gpTiers
  const gpTiers = [0, 1, 2, 3].map(i => Math.min(MAX_GP, Math.max(0, toInt(tiersIn[i], DEFAULT_REWARDS.gpTiers[i]))))
  for (let i = 1; i < 4; i++) if (gpTiers[i] <= gpTiers[i - 1]) gpTiers[i] = gpTiers[i - 1] + 1
  return {
    events,
    gpTiers,
    perfectBonus: clampCoins(src.perfectBonus ?? DEFAULT_REWARDS.perfectBonus),
  }
}

// Problems that should block saving (shown to the editor).
export function validateRewards(rules) {
  const t = rules?.gpTiers || []
  for (let i = 1; i < t.length; i++) {
    if (!(Number(t[i]) > Number(t[i - 1]))) return 'Each GP tier must be higher than the one before it.'
  }
  return ''
}

// "100k", "1.5M"… for tier labels.
export function formatGpShort(value) {
  const n = Number(value) || 0
  if (n >= 1000000) return `${+(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${+(n / 1000).toFixed(1)}k`
  return String(n)
}

export function tierLabels(gpTiers) {
  const t = gpTiers || DEFAULT_REWARDS.gpTiers
  return [
    `${formatGpShort(t[0])}–${formatGpShort(t[1])}`,
    `${formatGpShort(t[1])}–${formatGpShort(t[2])}`,
    `${formatGpShort(t[2])}–${formatGpShort(t[3])}`,
    `${formatGpShort(t[3])}+`,
  ]
}

/* ── Shared store (one copy for the whole app) ─────────────────────── */

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? normalizeRewards(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function writeLocal(rules) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(rules)) } catch { /* storage unavailable */ }
}

const store = {
  rules: readLocal() || normalizeRewards(DEFAULT_REWARDS),
  meta: null, // { updatedBy, updatedAt }
  loadedAt: 0,
  promise: null,
}
const listeners = new Set()

function publish(rules, meta = store.meta) {
  store.rules = rules
  store.meta = meta
  writeLocal(rules)
  listeners.forEach(fn => fn({ rules, meta }))
}

export function loadAttendanceRewards(supabase, { force = false } = {}) {
  if (!supabase) return Promise.resolve(store.rules)
  if (!force && store.loadedAt && Date.now() - store.loadedAt < CACHE_MS) return Promise.resolve(store.rules)
  if (store.promise) return store.promise

  store.promise = (async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_reward_config')
        .select('config,updated_by,updated_at')
        .eq('id', 1)
        .maybeSingle()
      if (error) {
        console.warn('[attendanceRewards] Using the built-in reward table:', error.message)
      } else if (data?.config) {
        publish(normalizeRewards(data.config), { updatedBy: data.updated_by || '', updatedAt: data.updated_at || null })
      }
    } catch (error) {
      console.warn('[attendanceRewards] Using the built-in reward table:', error)
    } finally {
      // Also after a failure, so a missing table isn't asked about again and again.
      store.loadedAt = Date.now()
      store.promise = null
    }
    return store.rules
  })()

  return store.promise
}

export function useAttendanceRewards(supabase) {
  const [state, setState] = useState({ rules: store.rules, meta: store.meta })

  useEffect(() => {
    listeners.add(setState)
    setState({ rules: store.rules, meta: store.meta })
    loadAttendanceRewards(supabase)

    // Coming back to the tab after a while picks up changes other staff made.
    const onVisible = () => { if (!document.hidden) loadAttendanceRewards(supabase) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      listeners.delete(setState)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [supabase])

  return state
}

export async function saveAttendanceRewards(supabase, currentUser, rules) {
  if (!supabase) throw new Error('Not connected to the database.')
  if (!canEditRewards(currentUser)) throw new Error('Only Admin, Master, or Elder can change attendance rewards.')
  if (!currentUser?.password) throw new Error('Your login session is missing credentials. Please log out and log in again.')

  const clean = normalizeRewards(rules)
  const problem = validateRewards(clean)
  if (problem) throw new Error(problem)

  const { data, error } = await supabase.rpc('save_attendance_rewards', {
    p_config: clean,
    p_actor_id: Number(currentUser.id),
    p_actor_password: String(currentUser.password),
  })

  if (error) {
    const message = String(error.message || '')
    if (error.code === 'PGRST202' || /could not find the function|schema cache/i.test(message)) {
      throw new Error('Run attendance_rewards.sql in Supabase once, then try saving again.')
    }
    throw new Error(message || 'Could not save the rewards.')
  }

  store.loadedAt = Date.now()
  publish(clean, { updatedBy: currentUser.name || '', updatedAt: data?.updated_at || new Date().toISOString() })
  return clean
}

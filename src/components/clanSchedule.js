/* ─────────────────────────────────────────────────────────────────────
   PeakyBlinder · shared weekly clan schedule
   One schedule for the Dashboard and the Event Calendar.

   - Saved in Supabase (table `clan_schedule`, see clan_schedule.sql).
   - Read once when a page opens, then reused for 10 minutes. The last copy
     is also kept in the browser, so pages show it instantly on the next visit.
   - If Supabase can't be reached (or the table doesn't exist yet), the
     built-in DEFAULT_SCHEDULE below is used, so the calendar never goes empty.
   - Only Admin / Master / Elder can save (checked again in the database).
   ───────────────────────────────────────────────────────────────────── */
import { useEffect, useState } from 'react'

export const SCHEDULE_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
export const SCHEDULE_TYPES = ['boss', 'battle', 'treasure', 'sanctuary', 'arena']
export const SCHEDULE_EDIT_ROLES = ['Admin', 'Master', 'Elder']

// Server time (GMT+8), 24h. Used until Supabase answers, or if it can't.
export const DEFAULT_SCHEDULE = {
  1: [
    { time: '21:00', type: 'boss', name: 'Canyon of Nidavellir 1F', boss: 'Nargrim' },
    { time: '21:10', type: 'boss', name: 'Folkvang 5F · Inter-Server', boss: 'Twilight Disaster Nirva' },
  ],
  2: [
    { time: '20:00', type: 'battle', name: 'Server Battle', subtitle: 'Lv 40+ · Top 500 Growth Power' },
  ],
  3: [
    { time: '21:00', type: 'boss', name: 'Canyon of the World Tree', boss: 'Twilight Overlord Rogvalt' },
    { time: '21:10', type: 'boss', name: 'Crossroads of Ragnarok', boss: 'Faded Oath Vargreif' },
  ],
  4: [
    { time: '13:00', type: 'battle', name: 'Clan Annihilation', subtitle: '13:00 – 14:00' },
    { time: '19:00', type: 'boss', name: 'Myrkrheim', boss: 'Wrath of the Earth Bergbernd' },
    { time: '20:00', type: 'battle', name: 'Clan Annihilation', subtitle: '20:00 – 21:00' },
  ],
  5: [
    { time: '21:00', type: 'boss', name: 'Folkvang 5F · Inter-Server', boss: 'Twilight Disaster Nirva' },
    { time: '21:10', type: 'boss', name: 'Crossroads of Ragnarok', boss: 'Faded Oath Vargreif' },
  ],
  6: [
    { time: '13:00', type: 'treasure', name: "Sindri's Treasure Island", subtitle: '13:00 – 14:00' },
    { time: '19:00', type: 'boss', name: 'Glasir Forest', boss: 'Divine Beast of Void Ulnos' },
    { time: '20:00', type: 'treasure', name: "Sindri's Treasure Island", subtitle: '20:00 – 21:00' },
    { time: '21:00', type: 'sanctuary', name: 'Clan Sanctuary', subtitle: '21:00 – 22:00' },
  ],
  0: [
    { time: '20:00', type: 'arena', name: 'Clan Arena Tournament', subtitle: 'See Announcement' },
    { time: '21:00', type: 'boss', name: 'Canyon of the World Tree', boss: 'Twilight Overlord Rogvalt' },
    { time: '21:10', type: 'boss', name: 'Canyon of Nidavellir 1F', boss: 'Nargrim' },
  ],
}

const CACHE_MS = 10 * 60 * 1000
const LOCAL_KEY = 'pb-clan-schedule-v1'
const COLUMNS = 'dow,time,type,name,boss,subtitle'

export const canEditSchedule = user => SCHEDULE_EDIT_ROLES.includes(user?.role)

const isTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ''))

function emptyWeek() {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
}

// Clean one event (drops anything the database would reject).
function cleanEvent(e) {
  if (!e || !isTime(e.time) || !String(e.name || '').trim()) return null
  const type = SCHEDULE_TYPES.includes(e.type) ? e.type : 'battle'
  const out = { time: e.time, type, name: String(e.name).trim() }
  const boss = String(e.boss || '').trim()
  const subtitle = String(e.subtitle || '').trim()
  if (boss) out.boss = boss
  if (subtitle) out.subtitle = subtitle
  return out
}

export function normalizeSchedule(schedule) {
  const out = emptyWeek()
  for (const dow of SCHEDULE_DAY_ORDER) {
    out[dow] = (schedule?.[dow] || [])
      .map(cleanEvent)
      .filter(Boolean)
      .sort((a, b) => a.time.localeCompare(b.time))
  }
  return out
}

function rowsToSchedule(rows) {
  const out = emptyWeek()
  for (const r of rows || []) {
    const dow = Number(r.dow)
    if (out[dow]) out[dow].push(r)
  }
  return normalizeSchedule(out)
}

export function scheduleToRows(schedule) {
  const rows = []
  const clean = normalizeSchedule(schedule)
  for (const dow of SCHEDULE_DAY_ORDER) {
    for (const e of clean[dow]) {
      rows.push({ dow, time: e.time, type: e.type, name: e.name, boss: e.boss || null, subtitle: e.subtitle || null })
    }
  }
  return rows
}

// { byDay: {dow: [event + {dow, key}]}, all: [...] } in Mon → Sun order.
export function buildSchedule(schedule) {
  const byDay = {}
  for (const dow of SCHEDULE_DAY_ORDER) {
    byDay[dow] = (schedule?.[dow] || []).map((event, i) => ({ ...event, dow, key: `${dow}-${event.time}-${i}` }))
  }
  return { byDay, all: SCHEDULE_DAY_ORDER.flatMap(dow => byDay[dow]) }
}

/* ── Shared store (one copy for the whole app) ─────────────────────── */

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const clean = normalizeSchedule(parsed)
    return Object.values(clean).some(list => list.length) ? clean : null
  } catch {
    return null
  }
}

function writeLocal(schedule) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(schedule)) } catch { /* storage unavailable */ }
}

const store = {
  schedule: readLocal() || normalizeSchedule(DEFAULT_SCHEDULE),
  loadedAt: 0,
  promise: null,
}
const listeners = new Set()

function publish(schedule) {
  store.schedule = schedule
  writeLocal(schedule)
  listeners.forEach(fn => fn(schedule))
}

export function loadClanSchedule(supabase, { force = false } = {}) {
  if (!supabase) return Promise.resolve(store.schedule)
  if (!force && store.loadedAt && Date.now() - store.loadedAt < CACHE_MS) return Promise.resolve(store.schedule)
  if (store.promise) return store.promise

  store.promise = (async () => {
    try {
      const { data, error } = await supabase
        .from('clan_schedule')
        .select(COLUMNS)
        .order('dow')
        .order('time')
      if (error) {
        console.warn('[clanSchedule] Using the built-in schedule:', error.message)
      } else if (Array.isArray(data) && data.length > 0) {
        publish(rowsToSchedule(data))
      }
    } catch (error) {
      console.warn('[clanSchedule] Using the built-in schedule:', error)
    } finally {
      // Also after a failure, so a missing table isn't asked about every second.
      store.loadedAt = Date.now()
      store.promise = null
    }
    return store.schedule
  })()

  return store.promise
}

export function useClanSchedule(supabase) {
  const [schedule, setSchedule] = useState(store.schedule)

  useEffect(() => {
    listeners.add(setSchedule)
    setSchedule(store.schedule)
    loadClanSchedule(supabase)

    // Coming back to the tab after a while picks up changes other staff made.
    const onVisible = () => { if (!document.hidden) loadClanSchedule(supabase) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      listeners.delete(setSchedule)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [supabase])

  return schedule
}

export async function saveClanSchedule(supabase, currentUser, schedule) {
  if (!supabase) throw new Error('Not connected to the database.')
  if (!canEditSchedule(currentUser)) throw new Error('Only Admin, Master, or Elder can change the schedule.')
  if (!currentUser?.password) throw new Error('Your login session is missing credentials. Please log out and log in again.')

  const clean = normalizeSchedule(schedule)
  const { error } = await supabase.rpc('save_clan_schedule', {
    p_events: scheduleToRows(clean),
    p_actor_id: Number(currentUser.id),
    p_actor_password: String(currentUser.password),
  })

  if (error) {
    const message = String(error.message || '')
    if (error.code === 'PGRST202' || /could not find the function|schema cache/i.test(message)) {
      throw new Error('Run clan_schedule.sql in Supabase once, then try saving again.')
    }
    throw new Error(message || 'Could not save the schedule.')
  }

  store.loadedAt = Date.now()
  publish(clean)
  return clean
}

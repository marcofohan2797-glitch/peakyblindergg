import React, { useEffect, useMemo, useRef, useState } from 'react'

const ROLES = {
  ADMIN: 'Admin',
  MASTER: 'Master',
  ELDER: 'Elder',
}

const REVIEW_ROLES = [ROLES.ADMIN, ROLES.MASTER]
const DISTRIBUTE_ROLES = [ROLES.ADMIN, ROLES.MASTER, ROLES.ELDER]
const LISTING_CONTROL_ROLES = [ROLES.ADMIN, ROLES.MASTER, ROLES.ELDER]
const BULK_LISTING_REMOVE_ROLES = [ROLES.MASTER]
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const IMAGE_BUCKET = 'auction-images'

const formatCoins = value => new Intl.NumberFormat('en-US').format(Number(value) || 0)

const formatDate = value => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatShortDate = value => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const timeRemaining = value => {
  if (!value) return 'No expiry'
  const diff = new Date(value).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`
  return `${hours} hour${hours === 1 ? '' : 's'} left`
}

const displayNameForLibraryImage = img => {
  if (!img) return ''
  if (img.displayName) return img.displayName
  const base = (img.name || '').split('/').pop()
  const m = base.match(/^(\d+)-[a-z0-9]+\.([a-z0-9]+)$/i)
  if (m) return `image-${m[1]}.${m[2]}`
  return base || 'Marketplace artwork'
}

const rarityClass = rarity => {
  const r = String(rarity || 'common').toLowerCase()
  if (r === 'legendary') return 'border-amber-300/45 bg-amber-300/[.06] text-amber-200'
  if (r === 'epic') return 'border-red-400/35 bg-red-400/[.05] text-red-300'
  if (r === 'rare') return 'border-blue-400/35 bg-blue-400/[.05] text-blue-300'
  if (r === 'uncommon') return 'border-emerald-400/35 bg-emerald-400/[.05] text-emerald-300'
  return 'border-white/15 bg-white/[.025] text-text-dim'
}

const rarityTextClass = rarity => {
  const r = String(rarity || 'common').toLowerCase()
  if (r === 'legendary') return 'text-amber-200'
  if (r === 'epic') return 'text-red-300'
  if (r === 'rare') return 'text-blue-300'
  if (r === 'uncommon') return 'text-emerald-300'
  return 'text-text-bright'
}

const rarityGlowClass = rarity => {
  const r = String(rarity || 'common').toLowerCase()
  if (r === 'legendary') return 'bg-[radial-gradient(circle,rgba(255,215,70,.62),rgba(255,170,0,.28)_34%,rgba(255,120,0,.10)_56%,transparent_78%)]'
  if (r === 'epic') return 'bg-[radial-gradient(circle,rgba(255,45,65,.72),rgba(245,35,50,.36)_34%,rgba(190,20,35,.16)_56%,transparent_78%)]'
  if (r === 'rare') return 'bg-[radial-gradient(circle,rgba(55,155,255,.68),rgba(35,105,235,.30)_34%,rgba(20,70,190,.13)_56%,transparent_78%)]'
  if (r === 'uncommon') return 'bg-[radial-gradient(circle,rgba(35,235,145,.62),rgba(20,190,110,.28)_34%,rgba(10,130,75,.12)_56%,transparent_78%)]'
  return 'bg-[radial-gradient(circle,rgba(205,155,70,.48),rgba(150,100,30,.20)_34%,rgba(120,75,20,.08)_56%,transparent_78%)]'
}

const rarityArtworkBorderClass = rarity => {
  const r = String(rarity || 'common').toLowerCase()
  if (r === 'legendary') return 'border-amber-300/70 shadow-[inset_0_0_22px_rgba(255,190,30,.16),0_0_18px_rgba(255,175,0,.10)]'
  if (r === 'epic') return 'border-red-500/75 shadow-[inset_0_0_24px_rgba(255,35,50,.20),0_0_20px_rgba(235,25,40,.16)]'
  if (r === 'rare') return 'border-blue-400/70 shadow-[inset_0_0_22px_rgba(45,145,255,.18),0_0_18px_rgba(35,110,235,.12)]'
  if (r === 'uncommon') return 'border-emerald-400/65 shadow-[inset_0_0_22px_rgba(30,220,130,.16),0_0_18px_rgba(20,180,100,.10)]'
  return 'border-amber-100/20 shadow-[inset_0_0_18px_rgba(205,155,70,.06)]'
}

const statusClass = status => {
  if (status === 'active') return 'border-emerald-400/30 bg-emerald-400/[.06] text-emerald-300'
  if (status === 'pending_review') return 'border-amber-300/30 bg-amber-300/[.06] text-amber-200'
  if (status === 'rejected') return 'border-red-400/30 bg-red-400/[.06] text-red-300'
  if (status === 'sold_out') return 'border-blue-400/30 bg-blue-400/[.06] text-blue-300'
  if (status === 'distributed') return 'border-emerald-400/30 bg-emerald-400/[.06] text-emerald-300'
  if (status === 'purchased') return 'border-amber-300/30 bg-amber-300/[.06] text-amber-200'
  return 'border-white/10 bg-white/[.025] text-text-dim'
}

const statusLabel = status => String(status || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown'


const RARITY_DOT = {
  legendary: '#f6c453',
  epic: '#f0505f',
  rare: '#4ea3ff',
  uncommon: '#3fd68f',
  common: '#a79c8a',
}

function CoinIcon({ size = 14 }) {
  return <span aria-hidden="true" className="mk-coin" style={{ width: size, height: size }} />
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="mk-eyebrow mb-1">{eyebrow}</div>}
        <h2 className="font-spectral text-[20px] font-bold leading-tight text-text-bright sm:text-[22px]">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-[12.5px] leading-5 text-text-dim">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function Modal({ title, children, onClose, wide = false, compact = false, narrow = false }) {
  return (
    <div
      className="mk-root mk-scrim fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-5"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`mk-modal relative max-h-[92vh] w-full overflow-y-auto rounded-t-[22px] sm:rounded-[20px] ${
          wide ? 'sm:max-w-4xl' : narrow ? 'sm:max-w-[440px]' : compact ? 'sm:max-w-xl' : 'sm:max-w-lg'
        }`}
        style={narrow ? { width: '440px', maxWidth: '100vw' } : undefined}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="mk-modal-head sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
          <span aria-hidden="true" className="mk-grabber sm:hidden" />
          <h2 className="min-w-0 truncate font-spectral text-[19px] font-bold text-gold-light">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="mk-icon-btn shrink-0"
          >
            ×
          </button>
        </div>
        <div className={compact ? 'p-4 sm:p-5' : 'p-4 sm:p-6'}>{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[.12em] text-text-dim">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] leading-4 text-text-dim/70">{hint}</span>}
    </label>
  )
}

function ItemArtwork({ item, size = 'card' }) {
  const src = item?.image_url || item?.image_data
  const isTable = size === 'table'
  const isPurchase = size === 'purchase'
  const isReview = size === 'review'

  const box = isTable
    ? 'h-12 w-12'
    : isPurchase
      ? 'h-48 w-full sm:h-52'
      : isReview
        ? 'h-36 w-full sm:h-40'
        : 'aspect-square w-full'

  if (isTable) {
    return (
      <div className={`mk-thumb relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-[11px]`} data-rarity={String(item?.rarity || 'common').toLowerCase()}>
        {src
          ? <img src={src} alt={item?.name || 'Marketplace item'} className="relative z-10 h-[86%] w-[86%] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,.65)]" loading="lazy" />
          : <span className="relative z-10 text-xl text-gold-dim/30">◇</span>}
      </div>
    )
  }

  return (
    <div className={`group/art mk-art relative flex ${box} items-center justify-center overflow-hidden rounded-[14px] border ${rarityArtworkBorderClass(item?.rarity)}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${rarityGlowClass(item?.rarity)} ${
          isPurchase ? 'h-[120%] w-[120%] opacity-80' : isReview ? 'h-[120%] w-[120%] opacity-75' : 'h-[96%] w-[96%] opacity-80'
        }`}
      />

      {src
        ? (
          <div className={`relative z-10 flex items-center justify-center ${isPurchase ? 'h-[82%] w-[82%]' : 'h-[74%] w-[74%]'}`}>
            <img
              src={src}
              alt={item?.name || 'Marketplace item'}
              className="mk-art-img block h-full w-full object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,.9)]"
              loading="lazy"
              style={{ imageRendering: 'auto' }}
            />
          </div>
        )
        : <span className="relative z-10 text-4xl text-gold-dim/30">◇</span>}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,.32)_100%)]" />
    </div>
  )
}

function ItemCard({ item, onBuy, canBuy, sold = false, buyerName = null, purchasedAt = null }) {
  const stock = Number(item?.stock) || 0
  const bundleQuantity = Math.max(1, Number(item?.bundle_quantity ?? item?.stock) || 1)
  const price = Number(item?.price) || 0
  const expired = item?.available_until && new Date(item.available_until).getTime() <= Date.now()
  const soldOut = sold || item?.status === 'sold_out' || stock < 1
  const rarity = String(item?.rarity || 'common').toLowerCase()

  return (
    <article
      className={`mk-card group flex flex-col ${soldOut ? 'mk-card-sold' : ''}`}
      data-rarity={rarity}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 360px' }}
    >
      <div className="relative p-2 pb-0">
        <ItemArtwork item={item} />
        <span
          className={`absolute left-3.5 top-3.5 z-30 inline-flex max-w-[70%] items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase leading-none tracking-[.1em] ${rarityClass(rarity)} mk-pill-dark`}
          title={item.rarity || 'common'}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RARITY_DOT[rarity] || RARITY_DOT.common }} />
          <span className="truncate">{item.rarity || 'common'}</span>
        </span>
        <span className="mk-qty absolute right-3.5 top-3.5 z-30" title={`${bundleQuantity} items in this package`}>
          {bundleQuantity}×
        </span>
        {soldOut && (
          <span className="mk-sold-stamp absolute bottom-2.5 left-1/2 z-30 -translate-x-1/2">Sold Out</span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5">
        <h3
          className={`truncate font-spectral text-[16px] font-bold leading-tight sm:text-[17px] ${rarityTextClass(item.rarity)}`}
          title={item.name}
        >
          {item.name}
        </h3>

        <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
          <CoinIcon size={15} />
          <span className="min-w-0 truncate font-mono text-[18px] font-extrabold leading-none text-gold-bright sm:text-[19px]">{formatCoins(price)}</span>
          <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-[.08em] text-gold-light/70">coins</span>
        </div>

        {sold && (
          <div className="mt-2.5 rounded-[10px] border border-white/[.07] bg-white/[.025] px-2.5 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[.12em] text-text-dim">Purchased By</div>
            <div className="mt-0.5 truncate text-[13.5px] font-semibold text-gold-light">{buyerName || 'Buyer information unavailable'}</div>
            {purchasedAt && (
              <div className="mt-0.5 text-[11px] leading-4 text-text-dim">
                {new Date(purchasedAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-2.5">
          <div className="flex items-center justify-between gap-2 text-[11.5px]">
            <span className="text-text-dim">{soldOut ? 'Status' : 'Closes in'}</span>
            <span className={`truncate font-semibold ${soldOut ? 'text-white/55' : expired ? 'text-red-300' : 'text-text-bright'}`}>
              {soldOut ? 'Sold Out' : expired ? 'Expired' : timeRemaining(item.available_until)}
            </span>
          </div>

          <button
            type="button"
            disabled={!canBuy || soldOut || expired}
            onClick={() => onBuy(item)}
            className="mk-btn mk-btn-primary mt-2 w-full"
          >
            {!canBuy ? 'Sign In To Purchase' : soldOut ? 'Sold Out' : expired ? 'Expired' : 'Buy Now'}
          </button>
        </div>
      </div>
    </article>
  )
}


const MemoizedItemCard = React.memo(ItemCard)

function ImageManager({ imageFile, imagePreview, pickedLibraryImg, libraryImages, libraryLoading, libraryError, uploading, deletingImageName, canDeleteImage, fileInputRef, onRefresh, onFileChange, onPick, onClear, onDeleteImage }) {
  const selectedLabel = imageFile
    ? imageFile.name
    : pickedLibraryImg
      ? (pickedLibraryImg.displayName || displayNameForLibraryImage(pickedLibraryImg))
      : ''
  const hasSelectedImage = Boolean(imageFile || pickedLibraryImg || imagePreview)

  return (
    <div className="mk-inset rounded-[16px] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mk-eyebrow">Item Artwork</div>
          <div className="mt-1 text-[12.5px] leading-5 text-text-dim">Use an Auction House image or upload a new one for this Clan Marketplace item.</div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={libraryLoading || uploading}
          className="mk-btn mk-btn-sm shrink-0"
        >
          {libraryLoading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-white/[.07] bg-black/25 p-3">
        {imagePreview ? (
          <img src={imagePreview} alt="Selected artwork" className="h-16 w-16 shrink-0 rounded-[12px] border border-gold/30 bg-black object-contain" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] border border-dashed border-white/[.14] text-[11px] font-semibold text-text-dim/60">IMAGE</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">Selected Asset</div>
          <div className="mt-1 truncate text-[13px] text-text-bright">
            {hasSelectedImage ? selectedLabel || 'Selected image' : 'No image selected'}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onFileChange}
            disabled={uploading}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mk-btn mk-btn-sm mk-btn-gold"
          >
            {uploading ? 'Uploading…' : hasSelectedImage ? 'Change' : 'Upload'}
          </button>
          {hasSelectedImage && (
            <button
              type="button"
              onClick={onClear}
              disabled={uploading}
              className="mk-btn mk-btn-sm mk-btn-red"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-white/[.07] pt-4">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="text-[11.5px] font-bold uppercase tracking-[.12em] text-text-dim">Image Library</div>
          <div className="text-[12px] text-text-dim">
            {libraryLoading ? 'Loading…' : libraryError ? <span className="text-red-400">{libraryError}</span> : `${libraryImages.length} assets`}
          </div>
        </div>

        {libraryImages.length > 0 ? (
          <div className="grid max-h-[240px] grid-cols-4 gap-2 overflow-y-auto pr-1 min-[420px]:grid-cols-5 sm:grid-cols-6 lg:grid-cols-7">
            {libraryImages.map(image => {
              const picked = pickedLibraryImg?.name === image.name || (!imageFile && imagePreview === image.url)
              const title = image.displayName || displayNameForLibraryImage(image)
              const isDeleting = deletingImageName === image.name

              return (
                <div
                  key={image.name}
                  className={`group relative overflow-hidden rounded-[10px] border transition-colors ${
                    picked ? 'border-gold-bright ring-2 ring-gold/35' : 'border-white/[.08] hover:border-gold/40'
                  } ${isDeleting ? 'pointer-events-none opacity-40' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => onPick(image)}
                    title={title}
                    className="block w-full"
                    aria-pressed={picked}
                    aria-label={`Use image ${title}`}
                  >
                    <img src={image.url} alt={title} className="aspect-square w-full bg-black object-contain" loading="lazy" />
                  </button>

                  {picked && (
                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-black">
                      ✓
                    </span>
                  )}

                  {canDeleteImage && (
                    <button
                      type="button"
                      onClick={event => {
                        event.stopPropagation()
                        onDeleteImage(image)
                      }}
                      disabled={isDeleting || Boolean(deletingImageName)}
                      title={`Delete image ${title}`}
                      aria-label={`Delete image ${title}`}
                      className="mk-img-del absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-red-500/50 bg-black/85 text-[10px] font-bold leading-none text-red-400 transition hover:border-red-400 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed"
                    >
                      {isDeleting ? '…' : '✕'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[12px] border border-dashed border-white/[.1] py-7 text-center text-[12.5px] text-text-dim">No images available yet.</div>
        )}

        <div className="mt-2.5 text-[11.5px] text-text-dim/70">Shared with the Auction House artwork library. Maximum upload size: 2 MB.</div>
      </div>
    </div>
  )
}

export default function Marketplace({ ctx }) {
  const { currentUser, supabase, addToast, allMembers } = ctx
  const liveCurrentUser = allMembers?.find(
    member => String(member.id) === String(currentUser?.id)
  ) || currentUser
  const role = liveCurrentUser?.role || currentUser?.role || 'Member'
  const isStaff = [ROLES.ADMIN, ROLES.MASTER, ROLES.ELDER].includes(role)
  const canReview = REVIEW_ROLES.includes(role)
  const canDistribute = DISTRIBUTE_ROLES.includes(role)
  const canManageListings = LISTING_CONTROL_ROLES.includes(role)
  const canBulkRemoveListings = BULK_LISTING_REMOVE_ROLES.includes(role)
  const canManageHistory = isStaff
  const canBuy = Boolean(currentUser && role !== 'Guest')
  // Marketplace submission controls are available only to staff.
  // Regular Members keep the existing Marketplace experience unchanged.
  const canSubmit = isStaff

  const [items, setItems] = useState([])
  const [purchases, setPurchases] = useState([])
  const [displayCoins, setDisplayCoins] = useState(Number(liveCurrentUser?.coins || 0))
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('shop')
  const [staffTab, setStaffTab] = useState(canReview ? 'pending' : 'distribution')
  const [buyItem, setBuyItem] = useState(null)
  const [purchaseError, setPurchaseError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [distributionPurchase, setDistributionPurchase] = useState(null)
  const [distributionNote, setDistributionNote] = useState('')
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([])
  const [selectedListingIds, setSelectedListingIds] = useState([])
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState([])

  const emptyForm = { name: '', description: '', rarity: 'common', image_url: '', image_data: '', price: 100, stock: 1, duration_days: 7 }
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [pickedLibraryImg, setPickedLibraryImg] = useState(null)
  const [libraryImages, setLibraryImages] = useState([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [libraryError, setLibraryError] = useState(null)
  const [deletingImageName, setDeletingImageName] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const load = async ({ silent = false } = {}) => {
    if (!supabase) return
    try {
      if (!silent) setLoading(true)
      // Marketplace Sold Inventory needs the buyer name for sold listings.
      // Purchase history remains read-only here; the listing itself is still controlled by the Marketplace RPCs.
      const purchaseQuery = supabase.from('marketplace_purchases').select('*').order('purchased_at', { ascending: false })

      const [{ data: itemData, error: itemError }, { data: purchaseData, error: purchaseError }] = await Promise.all([
        supabase.from('marketplace_items').select('*').order('created_at', { ascending: false }),
        purchaseQuery,
      ])
      if (itemError) throw itemError
      if (purchaseError) throw purchaseError
      setItems(itemData || [])
      setPurchases(purchaseData || [])

      // Staff needs the full member list for management controls.
      // Regular members also need buyer names for sold-out Marketplace cards,
      // in addition to the staff names shown on distributed purchases.
      const relatedMemberIds = [...new Set(
        (purchaseData || [])
          .flatMap(p => [p.buyer_id, p.distributed_by])
          .filter(id => id !== null && id !== undefined)
          .map(id => Number(id))
          .filter(Number.isFinite)
      )]

      if (isStaff || relatedMemberIds.length > 0) {
        let memberQuery = supabase
          .from('members')
          .select('id,name,role')
          .order('name')

        if (!isStaff) {
          memberQuery = memberQuery.in('id', relatedMemberIds)
        }

        const { data: memberData, error: memberError } = await memberQuery
        if (!memberError) setMembers(memberData || [])
      } else if (!isStaff) {
        setMembers([])
      }
    } catch (error) {
      console.error('[Marketplace] load failed:', error)
      addToast(error?.message || 'Could not load Marketplace.', 'red', 'Marketplace Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [currentUser?.id, role])

  // Keep the Marketplace balance synced from the shared member context.
  // This updates the UI immediately when Coins change elsewhere without polling
  // or forcing a Marketplace reload.
  useEffect(() => {
    // Sync from the shared member context when it changes.
    // Supabase Realtime below can update displayCoins directly between context syncs.
    if (liveCurrentUser?.id) {
      setDisplayCoins(Number(liveCurrentUser?.coins || 0))
    }
  }, [liveCurrentUser?.id, liveCurrentUser?.coins])

  // Listen only for this player's member-row updates. This is event-driven
  // (no interval/polling), so the balance changes as soon as Supabase sends
  // the database update without making the Marketplace feel like it refreshes.
  useEffect(() => {
    if (!supabase || !currentUser?.id) return undefined

    const memberId = Number(currentUser.id)
    const channel = supabase
      .channel(`marketplace-member-balance-${memberId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'members',
          filter: `id=eq.${memberId}`,
        },
        payload => {
          const nextCoins = Number(payload?.new?.coins)
          if (Number.isFinite(nextCoins)) {
            setDisplayCoins(nextCoins)
          }
        }
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Marketplace] Member balance realtime ${status.toLowerCase()}.`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentUser?.id])

  // Keep Marketplace data in sync in the background. Realtime updates are
  // intentionally silent so the page never looks like it is reloading.
  useEffect(() => {
    if (!supabase) return undefined

    let refreshTimer = null
    let disposed = false

    const schedulePurchaseRefresh = () => {
      if (disposed) return
      if (refreshTimer) window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        if (!disposed) load({ silent: true })
      }, 400)
    }

    const applyItemRealtimeChange = payload => {
      if (disposed || !payload) return

      const eventType = payload.eventType
      const record = payload.new
      const oldRecord = payload.old

      setItems(prev => {
        if (eventType === 'INSERT') {
          if (!record?.id || prev.some(item => item.id === record.id)) return prev
          return [record, ...prev]
        }

        if (eventType === 'UPDATE') {
          if (!record?.id) return prev
          const exists = prev.some(item => item.id === record.id)
          return exists
            ? prev.map(item => item.id === record.id ? record : item)
            : [record, ...prev]
        }

        if (eventType === 'DELETE') {
          const deletedId = oldRecord?.id
          if (!deletedId) return prev
          return prev.filter(item => item.id !== deletedId)
        }

        return prev
      })
    }

    const channel = supabase
      .channel(`marketplace-realtime-${currentUser?.id || 'guest'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_items' },
        applyItemRealtimeChange
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_purchases' },
        schedulePurchaseRefresh
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Marketplace] Realtime subscription ${status.toLowerCase()}. Manual refresh remains available.`)
        }
      })

    return () => {
      disposed = true
      if (refreshTimer) window.clearTimeout(refreshTimer)
      supabase.removeChannel(channel)
    }
  }, [supabase, currentUser?.id, role])

  const loadLibrary = async () => {
    if (!supabase) return
    setLibraryLoading(true)
    setLibraryError(null)
    try {
      const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
      if (error) throw error
      const library = (data || []).filter(file => file?.name && !file.name.startsWith('.')).map(file => {
        const { data: urlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(file.name)
        return { name: file.name, displayName: displayNameForLibraryImage({ name: file.name }), url: urlData?.publicUrl || '', createdAt: file.created_at || file.updated_at || null }
      }).filter(file => file.url)
      setLibraryImages(library)
    } catch (error) {
      console.error('[Marketplace] image library load failed:', error)
      setLibraryError(error?.message || 'Failed to load image library')
    } finally {
      setLibraryLoading(false)
    }
  }

  const clearImage = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setPickedLibraryImg(null)
    setImagePreview(null)
    setForm(prev => ({ ...prev, image_url: '', image_data: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const deleteLibraryImage = async image => {
    if (!isStaff || !supabase || !image?.name || deletingImageName) return

    const title = image.displayName || displayNameForLibraryImage(image)
    if (!window.confirm(
      `Delete this image permanently?\n\n${title}\n\nThis removes it from the shared Auction House artwork library. Any existing listing that already uses this image will keep its stored URL.`
    )) {
      return
    }

    const fileName = image.name
    setDeletingImageName(fileName)

    try {
      const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([fileName])
      if (error) throw error

      setLibraryImages(prev => prev.filter(item => item.name !== fileName))

      if (pickedLibraryImg?.name === fileName || imagePreview === image.url) {
        clearImage()
      }

      addToast('Image deleted from the artwork library.', 'red', 'Image Deleted')
    } catch (error) {
      console.error('[Marketplace] delete image failed:', error)
      addToast(error?.message || 'Could not delete image.', 'red', 'Delete Failed')
    } finally {
      setDeletingImageName(null)
    }
  }

  const handleImageChange = event => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { addToast('Please choose an image file.', 'red', 'Invalid File'); return }
    if (file.size > 2 * 1024 * 1024) { addToast('Image must be under 2 MB.', 'red', 'Too Large'); return }
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setPickedLibraryImg(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setForm(prev => ({ ...prev, image_url: '', image_data: '' }))
  }

  const pickFromLibrary = image => {
    if (!image?.url) return
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setPickedLibraryImg(image)
    setImagePreview(image.url)
    setForm(prev => ({ ...prev, image_url: image.url, image_data: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async () => {
    if (pickedLibraryImg?.url) return pickedLibraryImg.url
    if (!imageFile) return form.image_url?.trim() || null
    setUploading(true)
    try {
      const ext = imageFile.type === 'image/png' ? 'png' : (imageFile.name.split('.').pop()?.toLowerCase() || 'png')
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, imageFile, { cacheControl: '3600', upsert: false, contentType: imageFile.type || 'image/png' })
      if (error) throw error
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
      const url = data?.publicUrl || null
      if (!url) throw new Error('The uploaded image URL could not be created.')
      setLibraryImages(prev => [{ name: path, displayName: imageFile.name, url, createdAt: new Date().toISOString() }, ...prev.filter(image => image.url !== url)])
      setForm(prev => ({ ...prev, image_url: url, image_data: '' }))
      return url
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (showSubmit || showEdit) loadLibrary()
  }, [showSubmit, showEdit])

  const activeItems = useMemo(() => items.filter(item => item.status === 'active' && new Date(item.available_until).getTime() > Date.now() && Number(item.stock) > 0), [items])
  const soldItems = useMemo(() => items.filter(item => item.status === 'sold_out'), [items])

  const filteredActiveItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = activeItems.filter(item => {
      const matchesSearch = !q || [item.name, item.description, item.rarity].some(value => String(value || '').toLowerCase().includes(q))
      const matchesRarity = rarityFilter === 'all' || String(item.rarity || 'common').toLowerCase() === rarityFilter
      return matchesSearch && matchesRarity
    })
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_low') return Number(a.price) - Number(b.price)
      if (sortBy === 'price_high') return Number(b.price) - Number(a.price)
      if (sortBy === 'stock') return Number(b.stock) - Number(a.stock)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
  }, [activeItems, search, rarityFilter, sortBy])

  const filteredSoldItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = soldItems.filter(item => {
      const matchesSearch = !q || [item.name, item.description, item.rarity].some(value => String(value || '').toLowerCase().includes(q))
      const matchesRarity = rarityFilter === 'all' || String(item.rarity || 'common').toLowerCase() === rarityFilter
      return matchesSearch && matchesRarity
    })
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_low') return Number(a.price) - Number(b.price)
      if (sortBy === 'price_high') return Number(b.price) - Number(a.price)
      return new Date(b.purchased_at || b.updated_at || b.created_at || 0).getTime() - new Date(a.purchased_at || a.updated_at || a.created_at || 0).getTime()
    })
  }, [soldItems, search, rarityFilter, sortBy])

  const myPurchases = useMemo(() => purchases.filter(p => Number(p.buyer_id) === Number(currentUser?.id)), [purchases, currentUser?.id])
  const pendingItems = useMemo(() => items.filter(item => item.status === 'pending_review'), [items])
  const mySubmissions = useMemo(() => items.filter(item => Number(item.submitted_by) === Number(currentUser?.id)), [items, currentUser?.id])
  const distributionQueue = useMemo(() => purchases.filter(p => p.status === 'purchased'), [purchases])
  const activeListings = useMemo(() => items.filter(item => item.status === 'active' || item.status === 'sold_out'), [items])

  const memberName = id => members.find(m => Number(m.id) === Number(id))?.name || `Member #${id}`
  const itemName = id => items.find(item => item.id === id)?.name || 'Marketplace Item'
  const itemPackageQuantity = id => {
    const item = items.find(entry => entry.id === id)
    return Math.max(1, Number(item?.bundle_quantity ?? item?.stock) || 1)
  }

  const buyerForItem = itemId => {
    const purchase = purchases.find(p => p.item_id === itemId && p.status !== 'cancelled')
    return purchase ? memberName(purchase.buyer_id) : null
  }

  const purchasedAtForItem = itemId => {
    const purchase = purchases.find(p => p.item_id === itemId && p.status !== 'cancelled')
    return purchase?.purchased_at || null
  }

  const openBuy = item => {
    setPurchaseError('')
    setBuyItem(item)
  }

  const openSubmit = () => {
    clearImage()
    setForm({ ...emptyForm })
    setShowSubmit(true)
  }

  const submitItem = async e => {
    e.preventDefault()
    if (!canSubmit || busy) return
    setBusy(true)
    try {
      const imageUrl = await uploadImage()
      const { data: createdItem, error } = await supabase.rpc('marketplace_submit_item', {
        p_actor_id: currentUser.id,
        p_name: form.name.trim(),
        p_description: form.description.trim() || '',
        p_rarity: form.rarity,
        p_image_url: imageUrl,
        p_image_data: null,
        p_price: Number(form.price),
        p_stock: Number(form.stock),
        p_duration_days: Number(form.duration_days),
      })
      if (error) throw error

      // The RPC returns the new row, so update the local list instead of
      // downloading the entire Marketplace again.
      if (createdItem) {
        const created = Array.isArray(createdItem) ? createdItem[0] : createdItem
        if (created?.id) {
          setItems(prev => [created, ...prev.filter(item => item.id !== created.id)])
        }
      }

      setShowSubmit(false)
      addToast('Clan item submitted for Master review.', 'gold', 'Marketplace Submitted')
    } catch (error) {
      addToast(error?.message || 'Failed to submit Marketplace item.', 'red', 'Submit Failed')
    } finally { setBusy(false) }
  }

  const confirmDirectList = async e => {
    e?.preventDefault?.()
    if (!canSubmit || busy || showEdit) return

    const itemName = String(form.name || '').trim()
    const price = Number(form.price)
    const stock = Number(form.stock)
    const durationDays = Number(form.duration_days)

    if (!itemName) {
      addToast('Enter an item name before listing.', 'red', 'Cannot List')
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      addToast('Enter a valid price.', 'red', 'Cannot List')
      return
    }

    if (!Number.isInteger(stock) || stock < 1) {
      addToast('Quantity must be at least 1.', 'red', 'Cannot List')
      return
    }

    if (!Number.isInteger(durationDays) || durationDays < 1) {
      addToast('Duration must be at least 1 day.', 'red', 'Cannot List')
      return
    }

    if (!window.confirm(
      `Confirm direct listing?\n\n"${itemName}" will be published to the Clan Marketplace immediately.\n\nThis bypasses the review queue.`
    )) {
      return
    }

    setBusy(true)
    try {
      const imageUrl = await uploadImage()
      const { data: createdItem, error } = await supabase.rpc('marketplace_staff_list_item', {
        p_actor_id: Number(currentUser.id),
        p_name: itemName,
        p_description: String(form.description || '').trim(),
        p_rarity: form.rarity || 'common',
        p_image_url: imageUrl || null,
        p_image_data: null,
        p_price: Math.round(price),
        p_stock: stock,
        p_duration_days: durationDays,
      })

      if (error) throw error

      // The RPC returns the new row, so add it directly to the current list.
      // This avoids refetching every Marketplace item after each listing.
      if (createdItem) {
        const created = Array.isArray(createdItem) ? createdItem[0] : createdItem
        if (created?.id) {
          setItems(prev => [created, ...prev.filter(item => item.id !== created.id)])
        }
      }

      setShowSubmit(false)
      clearImage()
      addToast(`"${itemName}" is now live on the Marketplace.`, 'gold', 'Listing Confirmed')
    } catch (error) {
      const message = String(error?.message || 'Failed to list Marketplace item.')
      if (/PGRST202|Could not find the function|schema cache/i.test(message)) {
        addToast(
          'Run the Marketplace staff-listing SQL once in Supabase, then try Confirm & List again.',
          'red',
          'Database Setup Required'
        )
      } else {
        addToast(message, 'red', 'Listing Failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const confirmBuy = async () => {
    if (!buyItem) return

    setPurchaseError('')
    setBusy(true)

    try {
      const total = Number(buyItem.price)
      const availableCoins = Number(liveCurrentUser?.coins ?? displayCoins ?? 0)

      if (availableCoins < total) {
        setPurchaseError(
          `You need ${formatCoins(total)} Coinsto purchase this item.`
        )
        return
      }

      const { error } = await supabase.rpc('marketplace_purchase_item', {
        p_buyer_id: currentUser.id,
        p_item_id: buyItem.id,
        p_quantity: 1,
      })
      if (error) throw error

      // Update the balance shown by Marketplace immediately after the RPC succeeds.
      // The global member context may refresh asynchronously, so do not wait for it
      // before updating the balance at the top of this page.
      setDisplayCoins(prev => Math.max(0, Number(prev || 0) - total))

      setBuyItem(null)
      addToast(`Purchased ${buyItem.name} for ${formatCoins(total)} coins.`, 'gold', 'Purchase Complete')
    } catch (error) {
      // Keep all non-balance purchase errors on the existing toast behavior.
      addToast(error?.message || 'Purchase failed.', 'red', 'Purchase Failed')
    } finally {
      setBusy(false)
    }
  }

  const approve = async () => {
    if (!reviewItem || !canReview) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('marketplace_master_review_item', { p_actor_id: currentUser.id, p_item_id: reviewItem.id, p_action: 'approve', p_rejection_reason: null })
      if (error) throw error
      setReviewItem(null)
      addToast(`"${reviewItem.name}" is now active.`, 'gold', 'Marketplace Approved')
      await load()
    } catch (error) { addToast(error?.message || 'Approval failed.', 'red', 'Review Failed') } finally { setBusy(false) }
  }

  const reject = async () => {
    if (!reviewItem || !canReview) return
    const reason = window.prompt('Rejection reason (optional):', '')
    if (reason === null) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('marketplace_master_review_item', { p_actor_id: currentUser.id, p_item_id: reviewItem.id, p_action: 'reject', p_rejection_reason: reason.trim() || null })
      if (error) throw error
      setReviewItem(null)
      addToast(`"${reviewItem.name}" was rejected.`, 'blue', 'Marketplace Review')
      await load()
    } catch (error) { addToast(error?.message || 'Rejection failed.', 'red', 'Review Failed') } finally { setBusy(false) }
  }

  const openEdit = item => {
    if (!item?.id || !canReview) return
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)

    const imageUrl = item.image_url || item.image_data || ''
    const matchingLibraryImage = libraryImages.find(image => image.url === imageUrl) || null
    const fromMs = new Date(item.available_from || item.created_at || Date.now()).getTime()
    const untilMs = new Date(item.available_until || '').getTime()
    const calculatedDays = Number.isFinite(fromMs) && Number.isFinite(untilMs) && untilMs > fromMs
      ? Math.max(1, Math.ceil((untilMs - fromMs) / 86400000))
      : 7

    setImageFile(null)
    setPickedLibraryImg(matchingLibraryImage)
    setImagePreview(imageUrl || null)
    setForm({
      name: item.name || '',
      description: item.description || '',
      rarity: item.rarity || 'common',
      image_url: item.image_url || '',
      image_data: item.image_data || '',
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
      stock: Math.max(1, Number(item.bundle_quantity ?? item.stock) || 1),
      duration_days: calculatedDays,
    })
    setShowEdit(true)
  }

  const saveEdit = async (e, approveAfterSave = false) => {
    e.preventDefault()
    if (!reviewItem || !canReview || busy) return

    const name = String(form.name || '').trim()
    const price = Number(form.price)
    const packageQuantity = Number(form.stock)
    const durationDays = Number(form.duration_days)

    if (!name) {
      addToast('Item name is required.', 'red', 'Cannot Save')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      addToast('Enter a valid price.', 'red', 'Cannot Save')
      return
    }
    if (!Number.isInteger(packageQuantity) || packageQuantity < 1) {
      addToast('Package quantity must be at least 1.', 'red', 'Cannot Save')
      return
    }
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      addToast('Duration must be at least 1 day.', 'red', 'Cannot Save')
      return
    }

    setBusy(true)
    try {
      const imageUrl = await uploadImage()
      const itemId = reviewItem.id
      const itemName = name
      const { error } = await supabase.rpc('marketplace_master_edit_item', {
        p_actor_id: Number(currentUser.id),
        p_item_id: itemId,
        p_name: itemName,
        p_description: String(form.description || '').trim(),
        p_rarity: form.rarity || 'common',
        p_image_url: imageUrl || null,
        p_image_data: null,
        p_price: Math.round(price),
        p_stock: packageQuantity,
        p_duration_days: durationDays,
      })
      if (error) throw error

      if (approveAfterSave) {
        const { error: approveError } = await supabase.rpc('marketplace_master_review_item', {
          p_actor_id: Number(currentUser.id),
          p_item_id: itemId,
          p_action: 'approve',
          p_rejection_reason: null,
        })
        if (approveError) throw approveError

        setShowEdit(false)
        setReviewItem(null)
        addToast(`"${itemName}" was saved and is now active.`, 'gold', 'Listing Saved & Approved')
      } else {
        setShowEdit(false)
        setReviewItem(null)
        addToast('Marketplace submission updated.', 'gold', 'Changes Saved')
      }
      await load()
    } catch (error) {
      const message = String(error?.message || 'Edit failed.')
      if (/PGRST202|Could not find the function|schema cache/i.test(message)) {
        addToast('The Marketplace edit RPC is missing in Supabase. Run the Marketplace edit repair SQL.', 'red', 'Database Setup Required')
      } else {
        addToast(message, 'red', 'Edit Failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const distribute = async () => {
    if (!distributionPurchase || !canDistribute) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('marketplace_distribute_purchase', { p_staff_id: currentUser.id, p_purchase_id: distributionPurchase.id, p_distribution_note: distributionNote.trim() || null })
      if (error) throw error
      setDistributionPurchase(null)
      setDistributionNote('')
      addToast('Purchase marked as distributed.', 'gold', 'Distribution Complete')
      await load()
    } catch (error) {
      const message = String(error?.message || '')
      if (/PGRST202|Could not find the function|schema cache/i.test(message)) addToast('The Marketplace distribution RPC is not installed in Supabase yet. Run the Marketplace Step 3 Repair SQL.', 'red', 'Database Setup Required')
      else addToast(message || 'Distribution failed.', 'red', 'Distribution Failed')
    } finally { setBusy(false) }
  }

  const closeListing = async item => {
    if (!canManageListings) return
    if (!window.confirm(`Close "${item.name}"? Existing purchase history will remain unchanged.`)) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('marketplace_close_item', { p_staff_id: currentUser.id, p_item_id: item.id })
      if (error) throw error
      addToast(`"${item.name}" has been closed.`, 'blue', 'Listing Closed')
      await load()
    } catch (error) { addToast(error?.message || 'Could not close listing.', 'red', 'Close Failed') } finally { setBusy(false) }
  }

  const removeListing = async item => {
    if (!canManageListings) return

    const isOwnElderActiveListing = role === ROLES.ELDER && Number(item?.submitted_by) === Number(currentUser?.id) && item?.status === 'active'
    const canRemoveCompletedListing = ['sold_out', 'closed', 'expired', 'rejected'].includes(item?.status)

    if (!isOwnElderActiveListing && !canRemoveCompletedListing) return

    const confirmation = isOwnElderActiveListing
      ? `Remove "${item.name}" from the Clan Marketplace?\n\nThis is your active listing. It will be closed and removed from the purchasable Marketplace. Existing purchase history, if any, will remain unchanged.`
      : `Remove "${item.name}" from the Clan Marketplace? Purchase history will remain unchanged.`

    if (!window.confirm(confirmation)) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('marketplace_remove_listing', {
        p_staff_id: currentUser.id,
        p_item_id: item.id,
      })
      if (error) throw error
      addToast(`"${item.name}" was removed from the Clan Marketplace.`, 'blue', 'Listing Removed')
      await load()
    } catch (error) {
      addToast(error?.message || 'Could not remove listing.', 'red', 'Remove Failed')
    } finally { setBusy(false) }
  }

  const deletableSubmissionStatuses = ['pending_review', 'rejected', 'expired', 'closed']

  const submissionsWithPurchaseHistory = useMemo(
    () => new Set((purchases || []).map(purchase => String(purchase.item_id))),
    [purchases]
  )

  const deletableSubmissions = useMemo(
    () => mySubmissions.filter(item =>
      deletableSubmissionStatuses.includes(item.status) &&
      !submissionsWithPurchaseHistory.has(String(item.id))
    ),
    [mySubmissions, submissionsWithPurchaseHistory]
  )

  const toggleSubmissionSelection = itemId => {
    const id = String(itemId)
    setSelectedSubmissionIds(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id])
  }

  const selectAllSubmissions = checked => {
    setSelectedSubmissionIds(checked ? deletableSubmissions.map(item => String(item.id)) : [])
  }

  const deleteSelectedSubmissions = async ids => {
    if (!canSubmit || busy) return

    const normalizedIds = [...new Set((ids || []).map(id => String(id)).filter(Boolean))]
    if (normalizedIds.length === 0) return

    if (!window.confirm(
      `Delete ${normalizedIds.length} selected Marketplace submission${normalizedIds.length === 1 ? '' : 's'}?\\n\\nThis permanently removes the selected submission records from your My Submissions list. Active or sold listings are not included.`
    )) {
      return
    }

    setBusy(true)
    try {
      const { data, error } = await supabase.rpc('marketplace_delete_my_submissions_bulk', {
        p_actor_id: Number(currentUser.id),
        p_item_ids: normalizedIds,
      })

      if (error) throw error

      const deletedCount = Number(data) || normalizedIds.length
      setSelectedSubmissionIds([])
      addToast(
        `${deletedCount} Marketplace submission${deletedCount === 1 ? '' : 's'} deleted.`,
        'blue',
        'Submissions Deleted'
      )
      await load()
    } catch (error) {
      const message = String(error?.message || 'Could not delete Marketplace submissions.')
      if (/PGRST202|Could not find the function|schema cache/i.test(message)) {
        addToast(
          'The Marketplace submission-delete RPC is missing in Supabase. Run the submission delete SQL once, then try again.',
          'red',
          'Database Setup Required'
        )
      } else {
        addToast(message, 'red', 'Delete Failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const toggleListingSelection = itemId => {
    const id = String(itemId)
    setSelectedListingIds(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id])
  }

  const selectAllListings = checked => {
    setSelectedListingIds(checked ? activeListings.map(item => String(item.id)) : [])
  }

  const removeSelectedListings = async ids => {
    if (!canBulkRemoveListings || busy) return
    const normalizedIds = [...new Set((ids || []).map(id => String(id)).filter(Boolean))]
    if (normalizedIds.length === 0) return

    const message = `Remove ${normalizedIds.length} selected Marketplace listing${normalizedIds.length === 1 ? '' : 's'}?\n\nThe listing${normalizedIds.length === 1 ? '' : 's'} will be removed from active Marketplace management and marked closed. Existing purchase history will remain unchanged.`
    if (!window.confirm(message)) return

    setBusy(true)
    try {
      const { data, error } = await supabase.rpc('marketplace_remove_listings_bulk', {
        p_staff_id: currentUser.id,
        p_item_ids: normalizedIds,
      })
      if (error) throw error
      const removedCount = Number(data) || normalizedIds.length
      setSelectedListingIds([])
      addToast(`${removedCount} Marketplace listing${removedCount === 1 ? '' : 's'} removed. Purchase history was preserved.`, 'blue', 'Listings Removed')
      await load()
    } catch (error) {
      addToast(error?.message || 'Could not remove Marketplace listings.', 'red', 'Listing Removal Failed')
    } finally {
      setBusy(false)
    }
  }

  const toggleHistorySelection = purchaseId => {
    const id = String(purchaseId)
    setSelectedHistoryIds(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id])
  }

  const selectAllHistory = checked => {
    setSelectedHistoryIds(checked ? purchases.map(p => String(p.id)) : [])
  }

  const deletePurchaseHistory = async ids => {
    if (!canManageHistory || busy) return
    const normalizedIds = [...new Set((ids || []).map(id => String(id)).filter(Boolean))]
    if (normalizedIds.length === 0) return

    const isAll = normalizedIds.length === purchases.length && purchases.length > 0
    const message = isAll
      ? `Delete ALL ${normalizedIds.length} Marketplace purchase history records?\n\nThis only removes purchase history records. Marketplace listings and member coin balances will not be changed.`
      : `Delete ${normalizedIds.length} selected Marketplace purchase history record${normalizedIds.length === 1 ? '' : 's'}?\n\nThis only removes purchase history records. Marketplace listings and member coin balances will not be changed.`

    if (!window.confirm(message)) return

    setBusy(true)
    try {
      const { data, error } = await supabase.rpc('marketplace_delete_purchase_history_bulk', {
        p_staff_id: currentUser.id,
        p_purchase_ids: normalizedIds,
      })
      if (error) throw error
      const deletedCount = Number(data) || normalizedIds.length
      setSelectedHistoryIds([])
      addToast(`${deletedCount} Marketplace purchase history record${deletedCount === 1 ? '' : 's'} deleted.`, 'blue', 'History Deleted')
      await load()
    } catch (error) {
      addToast(error?.message || 'Could not delete Marketplace purchase history.', 'red', 'History Delete Failed')
    } finally {
      setBusy(false)
    }
  }

  const shopTabs = [
    { id: 'shop', label: 'Shop' },
    { id: 'orders', label: 'My Purchases' },
    { id: 'history', label: 'Marketplace History', count: purchases.length },
    ...(canSubmit ? [{ id: 'listings', label: 'My Submissions' }] : []),
    ...(isStaff ? [{ id: 'management', label: role === ROLES.ELDER ? 'Distribution' : 'Management' }] : []),
  ]

  const staffTabs = canReview
    ? [
        { id: 'pending', label: 'Pending Review', count: pendingItems.length },
        { id: 'active', label: 'Active Listings', count: activeListings.length },
        { id: 'history', label: 'Purchase History', count: purchases.length },
        { id: 'distribution', label: 'Distribution', count: distributionQueue.length },
      ]
    : [
        { id: 'history', label: 'Purchase History', count: purchases.length },
        { id: 'distribution', label: 'Distribution Queue', count: distributionQueue.length },
      ]


  return (
    <>
      <style>{MK_STYLES}</style>

      <div className="mk-root space-y-4 pb-10">
      {/* MEMBER MARKETPLACE */}
      <section className="mk-glass mk-hero relative overflow-hidden rounded-[22px]">
        <div className="relative flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mk-eyebrow flex items-center gap-2"><span className="h-px w-5 bg-gold/50" /> Clan Trade Hall</div>
            <h1 className="mt-1.5 font-spectral text-[30px] font-bold leading-none tracking-[.01em] text-gold-light sm:text-[36px]">Marketplace</h1>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-text-dim">Browse items supplied by the PeakyBlinder Clan. Listings are clan-owned.</p>
          </div>
          <div className={`grid gap-2 ${canSubmit ? 'grid-cols-2' : 'grid-cols-1'} lg:flex lg:items-stretch`}>
            <div className="mk-balance min-w-0 rounded-[16px] px-4 py-3 lg:min-w-[180px]">
              <div className="text-[11px] font-bold uppercase tracking-[.12em] text-text-dim">Your Coins</div>
              <div className="mt-1 flex items-center gap-2">
                <CoinIcon size={18} />
                <span className="truncate font-mono text-[22px] font-extrabold leading-none text-gold-bright">{formatCoins(displayCoins)}</span>
              </div>
              <div className="mt-1 text-[11px] text-gold-dim">Clan Balance</div>
            </div>
            {canSubmit && (
              <button type="button" onClick={openSubmit} className="mk-cta min-w-0 rounded-[16px] px-4 py-3 text-left lg:min-w-[180px]">
                <div className="text-[11px] font-bold uppercase tracking-[.12em] text-gold-dim">Staff Tools</div>
                <div className="mt-1 flex items-center gap-1.5 text-[15px] font-bold text-gold-light"><span className="text-[18px] leading-none">＋</span> Submit Item</div>
                <div className="mt-1 truncate text-[11px] text-text-dim">Submit a clan inventory item for review</div>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mk-glass rounded-[16px] p-1.5">
        <div className="flex items-center gap-1.5">
          <div className="mk-scroll -my-0.5 flex min-w-0 flex-1 gap-1 overflow-x-auto py-0.5" role="tablist" aria-label="Marketplace sections">
            {shopTabs.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={e => { setTab(t.id); e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }) }}
                className="mk-seg-btn"
              >
                {t.label}
                {Number(t.count) > 0 && <span className="mk-count">{t.count}</span>}
              </button>
            ))}
          </div>
          <button type="button" onClick={load} disabled={loading} className="mk-btn shrink-0" aria-label="Refresh Marketplace">
            <span className={loading ? 'mk-spin' : ''}>↻</span>
            <span className="hidden sm:inline">{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </section>

      {tab === 'shop' && (
        <>
          <section className="mk-solid rounded-[16px] p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_118px] gap-2 sm:grid-cols-[minmax(0,1fr)_170px]">
              <label className="mk-field flex h-11 items-center gap-2 px-3">
                <span className="text-[15px] text-text-dim/70" aria-hidden="true">⌕</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." aria-label="Search items" className="min-w-0 flex-1 bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim/50" />
                {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="text-[16px] leading-none text-text-dim hover:text-text-bright">×</button>}
              </label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort items" className="mk-field mk-select h-11 px-3 text-[13.5px]"><option value="newest">Newest</option><option value="price_low">Price: Low</option><option value="price_high">Price: High</option><option value="stock">Stock</option></select>
            </div>
            <div className="mk-scroll mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5" role="radiogroup" aria-label="Filter by rarity">
              {['all', ...RARITIES].map(r => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={rarityFilter === r}
                  onClick={() => setRarityFilter(r)}
                  className="mk-chip"
                >
                  {r !== 'all' && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: RARITY_DOT[r] }} />}
                  {r === 'all' ? 'All Rarities' : r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="pt-1">
            {loading && filteredActiveItems.length === 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map(i => <div key={i} className="mk-skel h-[300px] rounded-[18px]" />)}
              </div>
            ) : filteredActiveItems.length > 0 ? (
              <>
                <div className="flex items-end justify-between gap-3">
                  <SectionTitle title="Available Now" />
                  <span className="pb-0.5 text-[12.5px] text-text-dim">{filteredActiveItems.length} item{filteredActiveItems.length === 1 ? '' : 's'}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">{filteredActiveItems.map(item => <MemoizedItemCard key={item.id} item={item} onBuy={openBuy} canBuy={canBuy} />)}</div>
              </>
            ) : activeItems.length === 0 ? (
              <div className="mk-solid relative overflow-hidden rounded-[22px]">
                <div className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                <div className="relative px-5 py-10 sm:px-10 sm:py-12">
                  <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[.05] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-gold-dim">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                      Marketplace Status
                      <span className="text-gold/30">•</span>
                      Standby
                    </div>
                    <div className="mk-empty-icon mt-5">◇</div>
                    <h3 className="mt-4 font-spectral text-[26px] font-bold text-gold-light sm:text-[30px]">The Shelves Are Empty</h3>
                    <p className="mt-2 text-[13px] leading-6 text-text-dim">No clan packages are available for purchase right now. Approved inventory will appear here automatically when it is ready for members.</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <div className="flex items-center gap-2 rounded-[10px] border border-white/[.08] bg-white/[.025] px-3 py-2">
                        <span className="font-mono text-[15px] font-bold text-text-bright">0</span>
                        <span className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">Active Packages</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-[10px] border border-gold/15 bg-gold/[.04] px-3 py-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                        <span className="text-[11px] font-bold uppercase tracking-[.1em] text-gold-dim">Awaiting New Stock</span>
                      </div>
                    </div>
                    <button type="button" onClick={load} disabled={loading} className="mk-btn mk-btn-gold mt-6">↻ Refresh Inventory</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mk-solid rounded-[22px] px-5 py-12">
                <div className="mx-auto max-w-md text-center">
                  <div className="mk-empty-icon mx-auto">⌕</div>
                  <h3 className="mt-4 font-spectral text-[22px] font-bold text-text-bright">No Matching Listings</h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-text-dim">No active package matches your current search or rarity filter.</p>
                  <button type="button" onClick={() => { setSearch(''); setRarityFilter('all'); setSortBy('newest') }} className="mk-btn mt-5">Clear Filters</button>
                </div>
              </div>
            )}
          </section>

          {filteredSoldItems.length > 0 && (
            <section className="pt-4">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[.07] pb-3">
                <SectionTitle eyebrow="Marketplace History" title="Sold Inventory" description="Previously sold Clan Marketplace packages remain visible here with the member who purchased each package. They cannot be purchased again." />
                <span className="rounded-full border border-white/[.08] bg-white/[.03] px-2.5 py-1 text-[12px] font-semibold text-text-dim">{filteredSoldItems.length} sold</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredSoldItems.map(item => (
                  <MemoizedItemCard
                    key={item.id}
                    item={item}
                    sold
                    onBuy={setBuyItem}
                    canBuy={canBuy}
                    buyerName={buyerForItem(item.id)}
                    purchasedAt={purchasedAtForItem(item.id)}
                  />
                ))}
              </div>
            </section>
          )}

        </>
      )}

      {tab === 'orders' && (
        <section className="mk-solid overflow-hidden rounded-[20px]">
          <div className="border-b border-white/[.07] px-4 py-4 sm:px-5">
            <SectionTitle eyebrow="Member History" title="My Purchases" description="Every purchase keeps its original price snapshot." />
          </div>

          {myPurchases.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mk-empty-icon mx-auto">◈</div>
              <p className="mt-3 text-[13px] text-text-dim">No purchases yet.</p>
            </div>
          ) : (
            <div>
              <div className="mk-th mk-g-orders hidden lg:grid">
                <div>Item</div>
                <div className="text-center">Price</div>
                <div className="text-center">Status</div>
                <div className="text-right">Distributed By</div>
              </div>

              <div className="divide-y divide-white/[.06]">
                {myPurchases.map(p => {
                  const purchaseItem = items.find(item => item.id === p.item_id)
                  const purchaseRarity = purchaseItem?.rarity

                  return (
                    <div key={p.id} className="mk-row px-4 py-4 sm:px-5">
                      <div className="mk-g-orders grid gap-3 lg:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                          <ItemArtwork item={purchaseItem} size="table" />
                          <div className="min-w-0">
                            <div className={`truncate text-[15px] font-semibold leading-5 ${rarityTextClass(purchaseRarity)}`}>
                              {itemName(p.item_id)}
                            </div>
                            <div className="mt-1 text-[12.5px] leading-5 text-text-dim">
                              Quantity {itemPackageQuantity(p.item_id)}×
                              <span className="mx-1.5 text-white/20">•</span>
                              Purchased {formatDate(p.purchased_at)}
                            </div>
                          </div>
                        </div>

                        <div className="mk-kv lg:block lg:text-center">
                          <span className="mk-kv-label lg:hidden">Price</span>
                          <span className="inline-flex items-center gap-1.5">
                            <CoinIcon size={13} />
                            <span className="font-mono text-[15px] font-bold text-gold-light">{formatCoins(p.total_price)}</span>
                            <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-gold-dim">Coins</span>
                          </span>
                        </div>

                        <div className="mk-kv lg:block lg:text-center">
                          <span className="mk-kv-label lg:hidden">Status</span>
                          <div className="text-right lg:text-center">
                            <span className={`mk-status ${statusClass(p.status)}`}>
                              {statusLabel(p.status)}
                            </span>
                            <div className="mt-1 text-[12px] leading-4 text-text-dim">
                              {p.status === 'purchased' ? 'Awaiting distribution' : 'Item successfully distributed'}
                            </div>
                          </div>
                        </div>

                        <div className="mk-kv lg:block lg:text-right">
                          <span className="mk-kv-label lg:hidden">Distributed By</span>
                          <div className="min-w-0 text-right">
                            {p.distributed_by ? (
                              <>
                                <div className="truncate text-[13.5px] font-semibold leading-5 text-text-bright">{memberName(p.distributed_by)}</div>
                                <div className="mt-0.5 text-[12px] leading-4 text-text-dim">Marketplace staff</div>
                              </>
                            ) : (
                              <>
                                <div className="text-[13.5px] font-medium leading-5 text-text-dim">Not distributed yet</div>
                                <div className="mt-0.5 text-[12px] leading-4 text-text-dim/75">Awaiting fulfillment</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'history' && (
        <section className="mk-solid overflow-hidden rounded-[20px]">
          <div className="border-b border-white/[.07] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionTitle
                eyebrow="Clan Activity"
                title="Marketplace History"
                description="Recent Marketplace purchases across the clan. This view is read-only for members."
              />
              <div className="mk-stat shrink-0">
                <div className="font-mono text-[18px] font-bold leading-none text-gold-light">{formatCoins(purchases.length)}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.1em] text-gold-dim">Transactions</div>
              </div>
            </div>
          </div>

          {purchases.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mk-empty-icon mx-auto">◈</div>
              <h3 className="mt-4 font-spectral text-[21px] font-bold text-text-bright">No Marketplace Activity</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-text-dim">Purchase transactions will appear here once members start trading in the Clan Marketplace.</p>
            </div>
          ) : (
            <div>
              <div className="mk-th mk-g-history hidden lg:grid">
                <div>Item</div>
                <div className="text-center">Buyer</div>
                <div className="text-center">Qty</div>
                <div className="text-center">Total</div>
                <div className="text-center">Status</div>
                <div className="text-right">Purchased</div>
              </div>

              <div className="divide-y divide-white/[.06]">
                {purchases.map(p => {
                  const purchaseItem = items.find(item => item.id === p.item_id)
                  const purchaseRarity = purchaseItem?.rarity

                  return (
                    <div key={p.id} className="mk-row px-4 py-3.5 sm:px-5">
                      <div className="mk-g-history grid gap-2 lg:items-center lg:gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <ItemArtwork item={purchaseItem} size="table" />
                          <div className="min-w-0">
                            <div className={`truncate text-[15px] font-semibold leading-5 ${rarityTextClass(purchaseRarity)}`}>
                              {itemName(p.item_id)}
                            </div>
                            <div className="mt-0.5 text-[12px] capitalize leading-5 text-text-dim">
                              {purchaseRarity || 'Common'}
                            </div>
                          </div>
                          <span className={`mk-status ml-auto shrink-0 lg:hidden ${statusClass(p.status)}`}>{statusLabel(p.status)}</span>
                        </div>

                        <div className="mk-kv lg:justify-center lg:text-center">
                          <span className="mk-kv-label lg:hidden">Buyer</span>
                          <span className="truncate text-[13.5px] font-semibold text-text-bright">{memberName(p.buyer_id)}</span>
                        </div>

                        <div className="mk-kv lg:justify-center lg:text-center">
                          <span className="mk-kv-label lg:hidden">Quantity</span>
                          <span className="font-mono text-[13.5px] text-text-dim">{itemPackageQuantity(p.item_id)}×</span>
                        </div>

                        <div className="mk-kv lg:justify-center lg:text-center">
                          <span className="mk-kv-label lg:hidden">Total</span>
                          <span className="inline-flex items-center gap-1.5">
                            <CoinIcon size={13} />
                            <span className="font-mono text-[14.5px] font-bold text-gold-light">{formatCoins(p.total_price)}</span>
                            <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-gold-dim">Coins</span>
                          </span>
                        </div>

                        <div className="hidden lg:flex lg:justify-center">
                          <span className={`mk-status ${statusClass(p.status)}`}>
                            {statusLabel(p.status)}
                          </span>
                        </div>

                        <div className="mk-kv lg:justify-end lg:text-right">
                          <span className="mk-kv-label lg:hidden">Purchased</span>
                          <div className="text-right">
                            <div className="text-[13px] text-text-dim">{formatDate(p.purchased_at)}</div>
                            {p.distributed_by && (
                              <div className="mt-0.5 text-[11.5px] text-text-dim/75">
                                Distributed by {memberName(p.distributed_by)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'listings' && canSubmit && <section className="mk-solid overflow-hidden rounded-[20px]">
        <div className="border-b border-white/[.07] px-4 py-4 sm:px-5">
          <SectionTitle
            eyebrow="Staff Submissions"
            title="My Submissions"
            description="Track clan inventory items you submitted for review."
            action={
              <div className="flex flex-wrap items-center justify-end gap-2">
                {deletableSubmissions.length > 0 && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => selectAllSubmissions(selectedSubmissionIds.length !== deletableSubmissions.length)}
                      className="mk-btn mk-btn-sm"
                    >
                      {selectedSubmissionIds.length === deletableSubmissions.length && deletableSubmissions.length > 0 ? 'Clear All' : 'Select All'}
                    </button>
                    <button
                      type="button"
                      disabled={busy || selectedSubmissionIds.length === 0}
                      onClick={() => deleteSelectedSubmissions(selectedSubmissionIds)}
                      className="mk-btn mk-btn-sm mk-btn-red"
                    >
                      Delete Selected{selectedSubmissionIds.length > 0 ? ` (${selectedSubmissionIds.length})` : ''}
                    </button>
                  </>
                )}
                <button type="button" onClick={openSubmit} className="mk-btn mk-btn-sm mk-btn-gold">
                  ＋ New Item
                </button>
              </div>
            }
          />
        </div>

        {selectedSubmissionIds.length > 0 && (
          <div className="mk-selbar">
            <span className="font-semibold text-gold-light">
              {selectedSubmissionIds.length} submission{selectedSubmissionIds.length === 1 ? '' : 's'} selected
            </span>
            <button type="button" onClick={() => setSelectedSubmissionIds([])} className="text-text-dim hover:text-text-bright">
              Clear selection
            </button>
          </div>
        )}

        {mySubmissions.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-text-dim">You have not submitted any clan items.</div>
        ) : (
          <div className="divide-y divide-white/[.06]">
            {mySubmissions.map(item => {
              const hasPurchaseHistory = submissionsWithPurchaseHistory.has(String(item.id))
              const canDeleteSubmission = deletableSubmissionStatuses.includes(item.status) && !hasPurchaseHistory
              const selected = selectedSubmissionIds.includes(String(item.id))

              return (
                <div key={item.id} className={`mk-row px-4 py-3.5 sm:px-5 ${selected ? 'mk-row-sel' : ''}`}>
                  <div className="flex items-center gap-3">
                    {deletableSubmissions.length > 0 && (
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={!canDeleteSubmission || busy}
                        onChange={() => toggleSubmissionSelection(item.id)}
                        aria-label={hasPurchaseHistory ? `${item.name} cannot be deleted because it has purchase history` : `Select ${item.name}`}
                        title={hasPurchaseHistory ? 'Cannot permanently delete: this submission has purchase history.' : undefined}
                        className="mk-check"
                      />
                    )}

                    <ItemArtwork item={item} size="table" />

                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[15px] font-semibold ${rarityTextClass(item.rarity)}`}>{item.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-text-dim">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-gold-light"><CoinIcon size={12} />{formatCoins(item.price)}</span>
                        <span className="text-white/20">•</span>
                        <span>{Math.max(1, Number(item.bundle_quantity ?? item.stock) || 1)}× package</span>
                        <span className="text-white/20">•</span>
                        <span>Submitted {formatDate(item.submitted_at)}</span>
                      </div>
                      {hasPurchaseHistory && (
                        <div className="mt-1 text-[11.5px] font-semibold text-amber-300/80">Purchase history • Cannot permanently delete</div>
                      )}
                    </div>

                    <span className={`mk-status shrink-0 ${statusClass(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  {!canDeleteSubmission && (
                    <div className="mt-2 text-[11.5px] text-text-dim/70">
                      {item.status === 'active' ? 'Active listings cannot be deleted while they are available for purchase.' : 'This listing is protected from deletion.'}
                    </div>
                  )}

                  {item.status === 'rejected' && (
                    <div className="mt-3 rounded-[12px] border border-red-400/20 bg-red-400/[.05] px-3 py-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-[.1em] text-red-300/85">Rejection Reason</div>
                      <div className="mt-1 text-[13px] leading-5 text-red-100/85">{item.rejection_reason || 'No reason was provided by the reviewer.'}</div>
                      {item.rejected_at && <div className="mt-1 text-[11.5px] text-red-200/55">Reviewed {formatDate(item.rejected_at)}</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>}


      {tab === 'management' && isStaff && (
  <section>
    <div className="mk-solid relative overflow-hidden rounded-[20px]">
      <div className="relative flex flex-col gap-3 border-b border-white/[.07] px-4 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mk-eyebrow flex items-center gap-2">
            <span className="h-px w-5 bg-gold/50" /> Staff Console
          </div>
          <h2 className="mt-1.5 font-spectral text-[24px] font-bold leading-tight text-gold-light">Marketplace Management</h2>
          <p className="mt-1 text-[13px] leading-5 text-text-dim">Approvals, active listings, purchase history, and in-game distribution.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[.09] bg-white/[.03] px-3 py-1.5 text-[12px] font-bold text-text-dim">{role}</span>
          {canSubmit && <button type="button" onClick={openSubmit} className="mk-btn mk-btn-gold">＋ Add Listing</button>}
        </div>
      </div>

      <div className="border-b border-white/[.07] p-1.5 sm:px-3 sm:py-2.5">
        <div className="mk-scroll flex gap-1 overflow-x-auto" role="tablist" aria-label="Management sections">
          {staffTabs.map(t => (
            <button key={t.id} type="button" role="tab" aria-selected={staffTab === t.id} onClick={e => { setStaffTab(t.id); e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }) }} className="mk-seg-btn">
              {t.label}
              {Number(t.count) > 0 && <span className="mk-count">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="relative p-3 sm:p-5">

        {staffTab === 'pending' && canReview && (
          <div className="mk-table">
            <div className="mk-th hidden md:grid md:grid-cols-[56px_minmax(220px,1.7fr)_110px_70px_100px_140px_120px] md:text-center">
              <span />
              <span className="text-left">Item</span><span>Price</span><span>Qty</span><span>Duration</span><span>Submitted By</span><span>Actions</span>
            </div>
            {pendingItems.length === 0 ? (
              <div className="px-5 py-14 text-center text-[13px] text-text-dim">No listings waiting for review.</div>
            ) : pendingItems.map(item => (
              <div key={item.id} className="mk-row grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3 py-3.5 sm:px-4 md:grid-cols-[56px_minmax(220px,1.7fr)_110px_70px_100px_140px_120px] md:text-center">
                <div className="flex justify-center"><ItemArtwork item={item} size="table" /></div>
                <div className="min-w-0 text-left">
                  <div className={`truncate text-[15px] font-semibold ${rarityTextClass(item.rarity)}`}>{item.name}</div>
                  <div className="mt-0.5 text-[12.5px] capitalize text-text-dim">{item.rarity} <span className="mx-1 text-white/20">•</span> {formatShortDate(item.submitted_at)}</div>
                </div>
                <div className="font-mono text-[14px] font-bold text-gold-light max-md:text-right">{formatCoins(item.price)}</div>
                <div className="col-span-3 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-text-dim md:contents">
                  <div className="md:block"><span className="md:hidden">Qty </span>{Math.max(1, Number(item.bundle_quantity ?? item.stock) || 1)}×</div>
                  <div><span className="text-white/20 md:hidden">• </span>{Math.max(1, Math.ceil((new Date(item.available_until).getTime() - new Date(item.available_from).getTime()) / 86400000))} days</div>
                  <div className="min-w-0 truncate"><span className="text-white/20 md:hidden">• </span><span className="md:hidden">by </span>{memberName(item.submitted_by)}</div>
                </div>
                <div className="col-span-3 flex justify-end md:col-span-1 md:justify-center">
                  <button type="button" onClick={() => setReviewItem(item)} className="mk-btn mk-btn-sm mk-btn-green max-md:w-full">Review</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {staffTab === 'active' && canReview && (
          <div className="mk-table">
            {canBulkRemoveListings && (
              <div className="flex flex-col gap-3 border-b border-white/[.07] bg-white/[.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mk-eyebrow">Listing Management</div>
                  <div className="mt-1 text-[12.5px] leading-5 text-text-dim">Select multiple listings to remove them from Marketplace management. Purchase history stays intact.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={busy || activeListings.length === 0} onClick={() => selectAllListings(selectedListingIds.length !== activeListings.length)} className="mk-btn mk-btn-sm">
                    {selectedListingIds.length === activeListings.length && activeListings.length > 0 ? 'Clear All' : 'Select All'}
                  </button>
                  <button type="button" disabled={busy || selectedListingIds.length === 0} onClick={() => removeSelectedListings(selectedListingIds)} className="mk-btn mk-btn-sm mk-btn-red">
                    Remove Selected{selectedListingIds.length > 0 ? ` (${selectedListingIds.length})` : ''}
                  </button>
                </div>
              </div>
            )}

            {selectedListingIds.length > 0 && canBulkRemoveListings && (
              <div className="mk-selbar">
                <span className="font-semibold text-gold-light">{selectedListingIds.length} listing{selectedListingIds.length === 1 ? '' : 's'} selected</span>
                <button type="button" onClick={() => setSelectedListingIds([])} className="text-text-dim hover:text-text-bright">Clear selection</button>
              </div>
            )}

            <div className={`mk-th hidden md:grid md:text-center ${canBulkRemoveListings ? 'md:grid-cols-[36px_minmax(240px,1.8fr)_120px_100px_130px_110px]' : 'md:grid-cols-[minmax(240px,1.8fr)_120px_100px_130px_110px]'}`}>
              {canBulkRemoveListings && <span />}
              <span className="text-left">Item</span><span>Price</span><span>Quantity</span><span>Availability</span><span>Action</span>
            </div>

            {activeListings.length === 0 ? (
              <div className="px-5 py-14 text-center text-[13px] text-text-dim">No active Marketplace listings.</div>
            ) : activeListings.map(item => {
              const selected = selectedListingIds.includes(String(item.id))
              return (
                <div key={item.id} className={`mk-row flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3.5 sm:px-4 md:grid md:gap-3 md:text-center ${canBulkRemoveListings ? 'md:grid-cols-[36px_minmax(240px,1.8fr)_120px_100px_130px_110px]' : 'md:grid-cols-[minmax(240px,1.8fr)_120px_100px_130px_110px]'} ${selected ? 'mk-row-sel' : ''}`}>
                  {canBulkRemoveListings && (
                    <div className="flex justify-center">
                      <input type="checkbox" checked={selected} onChange={() => toggleListingSelection(item.id)} disabled={busy} aria-label={`Select listing ${item.name}`} className="mk-check" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <ItemArtwork item={item} size="table" />
                    <div className="min-w-0">
                      <div className={`truncate text-[15px] font-semibold ${rarityTextClass(item.rarity)}`}>{item.name}</div>
                      <div className="mt-0.5 text-[12.5px] capitalize text-text-dim">{item.rarity} · {statusLabel(item.status)}</div>
                    </div>
                  </div>
                  <div className="font-mono text-[14px] font-bold text-gold-light">{formatCoins(item.price)}</div>
                  <div className="flex w-full items-center justify-between gap-3 text-[12.5px] text-text-dim md:contents">
                    <div><span className="md:hidden">Qty </span>{Math.max(1, Number(item.bundle_quantity ?? item.stock) || 1)}×</div>
                    <div>{timeRemaining(item.available_until)}</div>
                    <div className="flex justify-center">{item.status === 'active' || item.status === 'sold_out' ? <button type="button" onClick={() => closeListing(item)} disabled={busy} className="mk-btn mk-btn-sm mk-btn-red">Close</button> : null}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {staffTab === 'history' && canManageHistory && (
          <div className="mk-table">
            <div className="flex flex-col gap-3 border-b border-white/[.07] bg-white/[.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mk-eyebrow">Marketplace History Management</div>
                <div className="mt-1 text-[12.5px] leading-5 text-text-dim">Select individual purchase records or manage the entire visible history.</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={busy || purchases.length === 0} onClick={() => selectAllHistory(selectedHistoryIds.length !== purchases.length)} className="mk-btn mk-btn-sm">
                  {selectedHistoryIds.length === purchases.length && purchases.length > 0 ? 'Clear All' : 'Select All'}
                </button>
                <button type="button" disabled={busy || selectedHistoryIds.length === 0} onClick={() => deletePurchaseHistory(selectedHistoryIds)} className="mk-btn mk-btn-sm mk-btn-red">
                  Delete Selected{selectedHistoryIds.length > 0 ? ` (${selectedHistoryIds.length})` : ''}
                </button>
                <button type="button" disabled={busy || purchases.length === 0} onClick={() => deletePurchaseHistory(purchases.map(p => p.id))} className="mk-btn mk-btn-sm mk-btn-red-outline">
                  Delete All History
                </button>
              </div>
            </div>

            {selectedHistoryIds.length > 0 && (
              <div className="mk-selbar">
                <span className="font-semibold text-gold-light">{selectedHistoryIds.length} record{selectedHistoryIds.length === 1 ? '' : 's'} selected</span>
                <button type="button" onClick={() => setSelectedHistoryIds([])} className="text-text-dim hover:text-text-bright">Clear selection</button>
              </div>
            )}

            <div className="mk-th hidden md:grid md:grid-cols-[36px_minmax(220px,1.4fr)_130px_60px_120px_130px_160px] md:text-center">
              <span />
              <span className="text-left">Item</span><span>Buyer</span><span>Qty</span><span>Total</span><span>Status</span><span>Purchased</span>
            </div>
            {purchases.length === 0 ? (
              <div className="px-5 py-14 text-center text-[13px] text-text-dim">No purchase history.</div>
            ) : purchases.map(p => {
              const purchaseItem = items.find(item => item.id === p.item_id)
              const selected = selectedHistoryIds.includes(String(p.id))
              return (
                <div key={p.id} className={`mk-row flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3.5 sm:px-4 md:grid md:grid-cols-[36px_minmax(220px,1.4fr)_130px_60px_120px_130px_160px] md:gap-3 md:text-center ${selected ? 'mk-row-sel' : ''}`}>
                  <div className="flex justify-center">
                    <input type="checkbox" checked={selected} onChange={() => toggleHistorySelection(p.id)} disabled={busy} aria-label={`Select purchase ${p.id}`} className="mk-check" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <ItemArtwork item={purchaseItem} size="table" />
                    <div className={`truncate text-[15px] font-semibold ${rarityTextClass(purchaseItem?.rarity)}`}>{itemName(p.item_id)}</div>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 pl-[calc(1rem+12px)] text-[12.5px] text-text-dim md:contents">
                    <div className="font-semibold text-text-bright md:font-normal md:text-text-dim">{memberName(p.buyer_id)}</div>
                    <div><span className="md:hidden">Qty </span>{p.quantity}</div>
                    <div className="font-mono text-[14px] font-bold text-gold-light">{formatCoins(p.total_price)}</div>
                    <div><span className={`mk-status ${statusClass(p.status)}`}>{statusLabel(p.status)}</span></div>
                    <div className="w-full md:w-auto">{formatDate(p.purchased_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {staffTab === 'distribution' && canDistribute && (
          <div className="mk-table">
            <div className="mk-th hidden md:grid md:grid-cols-[minmax(260px,1.5fr)_150px_70px_130px_170px] md:text-center">
              <span className="text-left">Item</span><span>Buyer</span><span>Qty</span><span>Coins Paid</span><span>Action</span>
            </div>
            {distributionQueue.length === 0 ? (
              <div className="px-5 py-14 text-center text-[13px] text-text-dim">No purchases are waiting for distribution.</div>
            ) : distributionQueue.map(p => {
              const purchaseItem = items.find(item => item.id === p.item_id)
              return (
                <div key={p.id} className="mk-row flex flex-wrap items-center gap-x-3 gap-y-2.5 px-3 py-3.5 sm:px-4 md:grid md:grid-cols-[minmax(260px,1.5fr)_150px_70px_130px_170px] md:gap-3 md:text-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <ItemArtwork item={purchaseItem} size="table" />
                    <div className="min-w-0">
                      <div className={`truncate text-[15px] font-semibold ${rarityTextClass(purchaseItem?.rarity)}`}>{itemName(p.item_id)}</div>
                      <div className="mt-0.5 text-[12.5px] text-text-dim">Purchased {formatDate(p.purchased_at)}</div>
                    </div>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-text-dim md:contents">
                    <div><span className="md:hidden">Buyer </span><span className="font-semibold text-text-bright md:font-normal md:text-text-dim">{memberName(p.buyer_id)}</span></div>
                    <div><span className="md:hidden">Qty </span>{p.quantity}</div>
                    <div className="ml-auto font-mono text-[14px] font-bold text-gold-light md:ml-0">{formatCoins(p.total_price)}</div>
                  </div>
                  <div className="flex w-full justify-center md:w-auto"><button type="button" onClick={() => { setDistributionPurchase(p); setDistributionNote('') }} className="mk-btn mk-btn-green max-md:w-full">Distribute Item</button></div>
                </div>
              )
            })}
          </div>
        )}

        {staffTab === 'listings' && canSubmit && (
          <div className="mk-table">
            <div className="mk-th hidden md:grid md:grid-cols-[56px_minmax(240px,1.7fr)_120px_100px_130px] md:text-center">
              <span /><span className="text-left">Item</span><span>Price</span><span>Quantity</span><span>Status</span>
            </div>
            {mySubmissions.length === 0 ? (
              <div className="px-5 py-14 text-center text-[13px] text-text-dim">No submissions yet.</div>
            ) : mySubmissions.map(item => (
              <div key={item.id} className="mk-row grid gap-3 px-4 py-3.5 md:grid-cols-[56px_minmax(240px,1.7fr)_120px_100px_130px] md:items-center md:text-center">
                <div className="flex justify-center"><ItemArtwork item={item} size="table" /></div>
                <div className="min-w-0 text-left">
                  <div className={`truncate text-[15px] font-semibold ${rarityTextClass(item.rarity)}`}>{item.name}</div>
                  <div className="mt-0.5 text-[12.5px] capitalize text-text-dim">{item.rarity}</div>
                </div>
                <div className="font-mono text-[14px] text-gold-light">{formatCoins(item.price)}</div>
                <div className="text-[12.5px] text-text-dim">{item.stock}</div>
                <div className="flex flex-wrap items-center justify-center gap-2">
  <span className={`mk-status ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
  {(
    ['sold_out', 'closed', 'expired', 'rejected'].includes(item.status) ||
    (role === ROLES.ELDER && Number(item.submitted_by) === Number(currentUser?.id) && item.status === 'active')
  ) && (
    <button type="button" disabled={busy} onClick={() => removeListing(item)} className="mk-btn mk-btn-sm mk-btn-red">Remove</button>
  )}
</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  </section>
)}{buyItem && <Modal title="Confirm Purchase" narrow compact onClose={() => !busy && setBuyItem(null)}>
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 rounded-[14px] border border-white/[.08] bg-white/[.025] p-2.5">
            <ItemArtwork item={buyItem} size="table" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[.12em] text-text-dim">Confirm purchase</div>
              <div className={`mt-0.5 truncate font-spectral text-[19px] font-bold leading-tight ${rarityTextClass(buyItem.rarity)}`}>{buyItem.name}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="flex items-center justify-end gap-1.5 font-mono text-[19px] font-bold leading-none text-gold-bright"><CoinIcon size={15} />{formatCoins(Number(buyItem.price))}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.1em] text-gold-dim">Coins</div>
            </div>
          </div>

          {purchaseError && (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-[12px] border border-red-400/25 bg-red-500/[.07] px-3 py-2.5 text-left"
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/35 bg-red-400/[.1] text-[11px] font-bold text-red-300">
          !
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[.12em] text-red-300">
            Purchase Unavailable
          </div>
          <div className="mt-0.5 text-[12.5px] leading-5 text-red-200/85">
            {purchaseError}
          </div>
        </div>
      </div>
    )}

    <div className="mk-balance-flow grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="rounded-[12px] border border-white/[.08] bg-white/[.025] px-3 py-2.5">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">Your Balance</div>
              <div className="mt-1 truncate font-mono text-[19px] font-bold leading-none text-text-bright">
                {formatCoins(Number(displayCoins || 0))}
              </div>
            </div>

            <span aria-hidden="true" className="text-[16px] text-gold-dim">→</span>

            <div className="rounded-[12px] border border-gold/20 bg-gold/[.05] px-3 py-2.5">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">After Purchase</div>
              <div className="mt-1 truncate font-mono text-[19px] font-bold leading-none text-gold-light">
                {formatCoins(Math.max(0, Number(displayCoins || 0) - Number(buyItem.price)))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/[.07] pt-3.5">
            <button type="button" disabled={busy} onClick={() => { setPurchaseError(''); setBuyItem(null) }} className="mk-btn">Cancel</button>
            <button type="button" disabled={busy} onClick={confirmBuy} className="mk-btn mk-btn-primary">{busy ? 'Processing…' : 'Confirm Purchase'}</button>
          </div>
        </div>
      </Modal>}
      {(showSubmit || showEdit) && (
        <Modal
          title={showEdit ? 'Edit Pending Listing' : 'Submit Marketplace Item'}
          wide
          onClose={() => !busy && (showEdit ? setShowEdit(false) : setShowSubmit(false))}
        >
          <form onSubmit={showEdit ? saveEdit : submitItem} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <div className="mk-inset rounded-[16px] p-4">
                <div className="mb-4">
                  <div className="mk-eyebrow">Listing Details</div>
                  <div className="mt-1 text-[12.5px] leading-5 text-text-dim">Set the item, rarity, price, package size, and listing duration.</div>
                </div>

                <div className="space-y-4">
                  <Field label="Item Name">
                    <input
                      className="mk-field w-full px-3 py-2.5 text-[14px]"
                      required
                      maxLength={120}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Kari Top"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Rarity">
                      <select
                        className="mk-field mk-select w-full px-3 py-2.5 text-[14px]"
                        value={form.rarity}
                        onChange={e => setForm(f => ({ ...f, rarity: e.target.value }))}
                      >
                        {RARITIES.map(r => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </Field>

                    <Field label="Price · Coins">
                      <input
                        className="mk-field w-full px-3 py-2.5 text-[14px]"
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </Field>

                    <Field label="Quantity Items">
                      <input
                        className="mk-field w-full px-3 py-2.5 text-[14px]"
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      />
                    </Field>

                    <Field label="Duration · Days">
                      <input
                        className="mk-field w-full px-3 py-2.5 text-[14px]"
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={form.duration_days}
                        onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <div className="rounded-[10px] border border-gold/12 bg-gold/[.035] px-3 py-2 text-[12px] leading-5 text-text-dim">
                    Members receive all <span className="font-semibold text-gold-light">{form.stock || 1}×</span> in one purchase. The package can be bought only once.
                  </div>
                </div>
              </div>

              <ImageManager
                imageFile={imageFile}
                imagePreview={imagePreview}
                pickedLibraryImg={pickedLibraryImg}
                libraryImages={libraryImages}
                libraryLoading={libraryLoading}
                libraryError={libraryError}
                uploading={uploading}
                deletingImageName={deletingImageName}
                canDeleteImage={isStaff}
                fileInputRef={fileInputRef}
                onRefresh={loadLibrary}
                onFileChange={handleImageChange}
                onPick={pickFromLibrary}
                onClear={clearImage}
                onDeleteImage={deleteLibraryImage}
              />
            </div>

            <div className="flex items-start gap-2 rounded-[12px] border border-amber-300/15 bg-amber-300/[.035] px-3 py-2.5 text-[12.5px] leading-5 text-text-dim">
              <span aria-hidden="true" className="text-amber-200">ⓘ</span>
              <span>
              {showEdit
                ? 'Changes are limited to pending listings. Approval is still required before the item becomes active.'
                : isStaff
                  ? 'Submit for Review sends this item to the review queue. Confirm & List publishes it immediately.'
                  : 'New listings enter Pending Review. A Master or Admin must approve them before members can purchase.'}
              </span>
            </div>

            <div className="mk-form-actions flex flex-col-reverse gap-2 border-t border-white/[.07] pt-3.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => showEdit ? setShowEdit(false) : setShowSubmit(false)}
                className="mk-btn"
              >
                Cancel
              </button>

              {showEdit ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveEdit}
                  className="mk-btn mk-btn-primary"
                >
                  {busy ? 'Saving…' : 'Save Changes'}
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={busy}
                    className="mk-btn mk-btn-gold"
                  >
                    {busy ? 'Submitting…' : 'Submit for Review'}
                  </button>

                  {isStaff && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={confirmDirectList}
                      className="mk-btn mk-btn-green-solid"
                    >
                      {busy ? 'Publishing…' : 'Confirm & List'}
                    </button>
                  )}
                </>
              )}
            </div>
          </form>
        </Modal>
      )}


      {reviewItem && !showEdit && <Modal title="Marketplace Review" compact onClose={() => !busy && setReviewItem(null)}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
            <ItemArtwork item={reviewItem} size="review" />
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`mk-status ${rarityClass(reviewItem.rarity)}`}>{reviewItem.rarity}</span>
                <span className="mk-status border-amber-300/25 bg-amber-300/[.06] text-amber-200">Pending Review</span>
              </div>
              <h3 className={`mt-2 truncate font-spectral text-[22px] font-bold leading-tight ${rarityTextClass(reviewItem.rarity)}`}>{reviewItem.name}</h3>
              <p className="mt-1 text-[12.5px] leading-5 text-text-dim">Listed by <span className="font-semibold text-text-bright">{memberName(reviewItem.submitted_by)}</span> · {formatDate(reviewItem.submitted_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="mk-stat">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">Price</div>
              <div className="mt-1 flex items-center gap-1 font-mono text-[16px] font-bold text-gold-light"><CoinIcon size={12} />{formatCoins(reviewItem.price)}</div>
            </div>
            <div className="mk-stat">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">Quantity</div>
              <div className="mt-1 font-mono text-[16px] font-bold text-text-bright">{Math.max(1, Number(reviewItem.bundle_quantity ?? reviewItem.stock) || 1)}×</div>
            </div>
            <div className="mk-stat">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-text-dim">Expires</div>
              <div className="mt-1 text-[13px] font-semibold text-text-bright">{formatShortDate(reviewItem.available_until)}</div>
            </div>
          </div>

          <div className="rounded-[12px] border border-white/[.07] bg-white/[.02] px-3 py-2.5 text-[13px] leading-5 text-text-dim">
            {reviewItem.description || 'No description provided.'}
          </div>

          {canReview && <div className="grid grid-cols-2 gap-2 border-t border-white/[.07] pt-3.5 sm:flex sm:justify-end">
            <button type="button" disabled={busy} onClick={reject} className="mk-btn mk-btn-red">Reject</button>
            <button type="button" disabled={busy} onClick={() => openEdit(reviewItem)} className="mk-btn">Edit</button>
            <button type="button" disabled={busy} onClick={approve} className="mk-btn mk-btn-green-solid col-span-2">{busy ? 'Processing…' : 'Approve Listing'}</button>
          </div>}
        </div>
      </Modal>}

      {distributionPurchase && <Modal title="Complete Distribution" onClose={() => !busy && setDistributionPurchase(null)}>
        <div className="rounded-[16px] border border-emerald-400/20 bg-emerald-400/[.04] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[.12em] text-emerald-300/85">Paid Purchase</div>
          <div className="mt-1 font-spectral text-[21px] font-bold text-text-bright">{itemName(distributionPurchase.item_id)}</div>
          <div className="mt-1 text-[13px] text-text-dim">Buyer: <span className="font-semibold text-text-bright">{memberName(distributionPurchase.buyer_id)}</span> · Qty {itemPackageQuantity(distributionPurchase.item_id)}×</div>
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[18px] font-bold text-gold-bright"><CoinIcon size={15} />{formatCoins(distributionPurchase.total_price)} coins</div>
        </div>
        <div className="mt-4"><Field label="Distribution Note" hint="Optional delivery or character/account note."><textarea className="mk-field min-h-[95px] w-full resize-y px-3 py-2.5 text-[14px]" maxLength={500} value={distributionNote} onChange={e => setDistributionNote(e.target.value)} placeholder="Delivered in-game…" /></Field></div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button type="button" disabled={busy} onClick={() => setDistributionPurchase(null)} className="mk-btn">Cancel</button>
          <button type="button" disabled={busy} onClick={distribute} className="mk-btn mk-btn-green-solid">{busy ? 'Updating…' : 'Mark as Distributed'}</button>
        </div>
      </Modal>}
    </div>
    </>
  )
}

const MK_STYLES = `
  .mk-root { --mk-gold: #d4af37; --mk-gold-hi: #f2d27a; --mk-ink: #1a1206; }

  /* Surfaces: only the hero + tab bar use real glass; everything repeated is solid (fast on phones) */
  .mk-root .mk-glass {
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
    .mk-root .mk-glass { backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); }
  }
  .mk-root .mk-hero::before {
    content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
    background: radial-gradient(60% 120% at 100% 0%, rgba(212,175,55,.13) 0%, transparent 60%);
  }
  .mk-root .mk-hero::after {
    content: ''; position: absolute; left: 6%; right: 6%; top: 0; height: 1px; pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(242,210,122,.55), transparent);
  }
  .mk-root .mk-solid {
    background:
      radial-gradient(120% 70% at 0% 0%, rgba(255,255,255,.05) 0%, transparent 50%),
      linear-gradient(160deg, rgba(28,23,18,.94) 0%, rgba(12,10,8,.96) 100%);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 20px 50px -30px rgba(0,0,0,.9);
  }
  .mk-root .mk-inset { background: rgba(0,0,0,.24); border: 1px solid rgba(255,255,255,.07); }
  .mk-root .mk-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #b8964a; }

  /* Header balance + CTA */
  .mk-root .mk-balance {
    border: 1px solid rgba(212,175,55,.22);
    background: linear-gradient(160deg, rgba(212,175,55,.12) 0%, rgba(212,175,55,.03) 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
  }
  .mk-root .mk-cta {
    border: 1px solid rgba(212,175,55,.3);
    background: linear-gradient(160deg, rgba(212,175,55,.1) 0%, rgba(0,0,0,.2) 100%);
    transition: border-color .2s ease, background .2s ease, transform .2s ease;
  }
  .mk-root .mk-cta:hover { border-color: rgba(242,210,122,.55); background: linear-gradient(160deg, rgba(212,175,55,.16) 0%, rgba(0,0,0,.18) 100%); }
  .mk-root .mk-cta:active { transform: scale(.985); }

  .mk-root .mk-coin {
    display: inline-block; flex-shrink: 0; border-radius: 999px;
    background: radial-gradient(circle at 35% 30%, #fff2b8 0%, #f2d27a 28%, #d4af37 62%, #8a6a1c 100%);
    box-shadow: inset 0 0 0 1.5px rgba(122,90,20,.55), 0 1px 3px rgba(0,0,0,.5);
  }

  /* Tabs */
  .mk-root .mk-scroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .mk-root .mk-scroll::-webkit-scrollbar { display: none; }
  @media (max-width: 767px) {
    .mk-root .mk-scroll { -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); padding-right: 22px; }
  }
  .mk-root .mk-seg-btn {
    display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; white-space: nowrap;
    min-height: 40px; padding: 0 14px; border-radius: 11px;
    font-size: 13px; font-weight: 700; color: #a79c8a;
    transition: background .2s ease, color .2s ease, box-shadow .2s ease;
  }
  .mk-root .mk-seg-btn:hover { color: #f4ebd9; background: rgba(255,255,255,.035); }
  .mk-root .mk-seg-btn[aria-selected="true"] {
    color: var(--mk-ink);
    background: linear-gradient(180deg, #f2d27a 0%, #d4af37 55%, #b38d2a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 6px 18px -8px rgba(212,175,55,.6);
  }
  .mk-root .mk-count {
    min-width: 20px; padding: 2px 6px; border-radius: 999px; text-align: center;
    font-size: 11px; font-weight: 800; line-height: 1.2;
    background: rgba(255,255,255,.08); color: #e9dfcc;
  }
  .mk-root .mk-seg-btn[aria-selected="true"] .mk-count { background: rgba(26,18,6,.18); color: var(--mk-ink); }

  /* Buttons */
  .mk-root .mk-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 40px; padding: 0 16px; border-radius: 11px;
    border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035);
    font-size: 13px; font-weight: 700; color: #cfc4b1; white-space: nowrap;
    transition: border-color .2s ease, color .2s ease, background .2s ease, transform .12s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .mk-root .mk-btn:hover:not(:disabled) { border-color: rgba(212,175,55,.32); color: #f4ebd9; }
  .mk-root .mk-btn:active:not(:disabled) { transform: scale(.97); }
  .mk-root .mk-btn:disabled { opacity: .4; cursor: not-allowed; }
  .mk-root .mk-btn-sm { min-height: 34px; padding: 0 12px; font-size: 12.5px; border-radius: 10px; }
  .mk-root .mk-btn-gold { border-color: rgba(212,175,55,.32); background: rgba(212,175,55,.09); color: #e7c873; }
  .mk-root .mk-btn-gold:hover:not(:disabled) { background: rgba(212,175,55,.15); color: #f2cc60; }
  .mk-root .mk-btn-primary {
    border-color: rgba(242,210,122,.6); color: var(--mk-ink);
    background: linear-gradient(180deg, #f2d27a 0%, #d4af37 55%, #b38d2a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 8px 20px -10px rgba(212,175,55,.7);
  }
  .mk-root .mk-btn-primary:hover:not(:disabled) { color: var(--mk-ink); border-color: #f6dc8f; filter: brightness(1.06); }
  .mk-root .mk-btn-primary:disabled { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.07); color: rgba(167,156,138,.7); box-shadow: none; opacity: 1; }
  .mk-root .mk-btn-red { border-color: rgba(248,113,113,.25); background: rgba(248,113,113,.06); color: #fca5a5; }
  .mk-root .mk-btn-red:hover:not(:disabled) { border-color: rgba(248,113,113,.45); background: rgba(248,113,113,.11); color: #fecaca; }
  .mk-root .mk-btn-red-outline { border-color: rgba(248,113,113,.35); background: transparent; color: #fecaca; }
  .mk-root .mk-btn-red-outline:hover:not(:disabled) { background: rgba(248,113,113,.1); color: #fff; border-color: rgba(248,113,113,.55); }
  .mk-root .mk-btn-green { border-color: rgba(52,211,153,.28); background: rgba(52,211,153,.07); color: #6ee7b7; }
  .mk-root .mk-btn-green:hover:not(:disabled) { border-color: rgba(52,211,153,.45); background: rgba(52,211,153,.12); color: #a7f3d0; }
  .mk-root .mk-btn-green-solid {
    border-color: rgba(110,231,183,.5); color: #04140d;
    background: linear-gradient(180deg, #6ee7b7 0%, #34d399 60%, #10b981 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 8px 20px -10px rgba(52,211,153,.6);
  }
  .mk-root .mk-btn-green-solid:hover:not(:disabled) { color: #04140d; border-color: #a7f3d0; filter: brightness(1.05); }
  .mk-root .mk-icon-btn {
    display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03);
    font-size: 20px; line-height: 1; color: #a79c8a; transition: all .2s ease;
  }
  .mk-root .mk-icon-btn:hover { border-color: rgba(212,175,55,.3); color: #e7c873; }
  @keyframes mk-spin { to { transform: rotate(360deg); } }
  .mk-root .mk-spin { display: inline-block; animation: mk-spin .9s linear infinite; }

  /* Fields & chips */
  .mk-root .mk-field {
    border-radius: 12px; border: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.32);
    color: #f4ebd9; outline: none; transition: border-color .2s ease, box-shadow .2s ease;
  }
  .mk-root .mk-field::placeholder { color: rgba(167,156,138,.55); }
  .mk-root .mk-field:focus, .mk-root .mk-field:focus-within { border-color: rgba(212,175,55,.45); box-shadow: 0 0 0 3px rgba(212,175,55,.1); }
  .mk-root .mk-select { background-color: #0f0c0a; cursor: pointer; }
  .mk-root .mk-select option { background: #0f0c0a; color: #f4ebd9; }
  .mk-root .mk-chip {
    display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; white-space: nowrap;
    min-height: 34px; padding: 0 13px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,.09); background: rgba(255,255,255,.025);
    font-size: 12.5px; font-weight: 600; color: #a79c8a; transition: all .2s ease;
  }
  .mk-root .mk-chip:hover { color: #f4ebd9; border-color: rgba(255,255,255,.18); }
  .mk-root .mk-chip[aria-checked="true"] { color: #f2d27a; border-color: rgba(212,175,55,.45); background: rgba(212,175,55,.1); }
  .mk-root .mk-check { width: 18px; height: 18px; flex-shrink: 0; accent-color: #d4af37; cursor: pointer; }
  .mk-root .mk-check:disabled { opacity: .25; cursor: not-allowed; }

  /* Item cards */
  .mk-root .mk-card {
    position: relative; overflow: hidden; border-radius: 18px;
    background: linear-gradient(170deg, rgba(30,25,19,.96) 0%, rgba(11,9,8,.98) 100%);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 16px 40px -28px rgba(0,0,0,.95);
    transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
  }
  .mk-root .mk-card[data-rarity="legendary"] { border-color: rgba(252,211,77,.22); }
  .mk-root .mk-card[data-rarity="epic"] { border-color: rgba(248,113,113,.18); }
  .mk-root .mk-card[data-rarity="rare"] { border-color: rgba(96,165,250,.18); }
  .mk-root .mk-card[data-rarity="uncommon"] { border-color: rgba(52,211,153,.16); }
  @media (hover: hover) {
    .mk-root .mk-card:hover { transform: translateY(-3px); border-color: rgba(212,175,55,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 22px 46px -24px rgba(0,0,0,.95); }
    .mk-root .mk-card:hover .mk-art-img { transform: scale(1.04); }
  }
  .mk-root .mk-art { background: #070605; }
  .mk-root .mk-art-img { transition: transform .35s ease; }
  .mk-root .mk-card-sold .mk-art { filter: saturate(.55) brightness(.8); }
  .mk-root .mk-pill-dark { background-color: rgba(8,7,6,.82) !important; }
  .mk-root .mk-qty {
    display: inline-flex; align-items: center; height: 24px; padding: 0 8px; border-radius: 999px;
    background: rgba(8,7,6,.82); border: 1px solid rgba(255,255,255,.12);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 800; color: #f4ebd9;
  }
  .mk-root .mk-sold-stamp {
    padding: 5px 12px; border-radius: 8px; white-space: nowrap;
    border: 1px solid rgba(255,255,255,.22); background: rgba(8,7,6,.86);
    font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #e9dfcc;
  }
  .mk-root .mk-thumb { background: #070605; border: 1px solid rgba(255,255,255,.09); }
  .mk-root .mk-thumb[data-rarity="legendary"] { border-color: rgba(252,211,77,.45); background: radial-gradient(circle, rgba(255,190,40,.2), #070605 70%); }
  .mk-root .mk-thumb[data-rarity="epic"] { border-color: rgba(248,113,113,.45); background: radial-gradient(circle, rgba(240,50,70,.2), #070605 70%); }
  .mk-root .mk-thumb[data-rarity="rare"] { border-color: rgba(96,165,250,.45); background: radial-gradient(circle, rgba(60,140,255,.2), #070605 70%); }
  .mk-root .mk-thumb[data-rarity="uncommon"] { border-color: rgba(52,211,153,.4); background: radial-gradient(circle, rgba(40,210,130,.18), #070605 70%); }

  /* Tables */
  .mk-root .mk-table { overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.18); }
  .mk-root .mk-th {
    align-items: center; gap: 12px; padding: 11px 20px;
    border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.03);
    font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #b8964a;
  }
  .mk-root .mk-table .mk-th { padding: 11px 16px; }
  .mk-root .mk-table > .mk-row + .mk-row, .mk-root .mk-table > .mk-th + .mk-row { border-top: 1px solid rgba(255,255,255,.06); }
  .mk-root .mk-row { position: relative; transition: background .15s ease; }
  .mk-root .mk-row:hover { background: rgba(255,255,255,.022); }
  .mk-root .mk-row-sel { background: rgba(212,175,55,.06) !important; }
  .mk-root .mk-row-sel::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #d4af37; }
  .mk-root .mk-kv { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
  .mk-root .mk-kv-label { font-size: 11.5px; font-weight: 600; color: rgba(167,156,138,.85); flex-shrink: 0; }
  .mk-root .mk-status {
    display: inline-flex; align-items: center; white-space: nowrap; border-radius: 999px; border-width: 1px;
    padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: .04em; line-height: 1.2; text-transform: capitalize;
  }
  .mk-root .mk-selbar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 16px; font-size: 12.5px;
    border-bottom: 1px solid rgba(212,175,55,.15); background: rgba(212,175,55,.05);
  }
  .mk-root .mk-stat { border-radius: 12px; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.025); padding: 10px 12px; }
  .mk-root .mk-empty-icon {
    display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 18px;
    border: 1px solid rgba(212,175,55,.22); background: rgba(0,0,0,.3);
    box-shadow: inset 0 0 0 6px rgba(212,175,55,.04);
    font-family: Georgia, serif; font-size: 26px; color: rgba(231,200,115,.7);
  }
  @keyframes mk-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .mk-root .mk-skel {
    border: 1px solid rgba(255,255,255,.06);
    background: linear-gradient(100deg, rgba(255,255,255,.025) 30%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.025) 70%) 0 0 / 200% 100%;
    animation: mk-shimmer 1.6s ease-in-out infinite;
  }

  @media (min-width: 1024px) {
    .mk-root .mk-g-orders { grid-template-columns: minmax(0,1fr) 160px 200px 220px; gap: 12px; }
    .mk-root .mk-g-history { grid-template-columns: minmax(0,1fr) 150px 70px 150px 140px 210px; gap: 12px; }
  }

  /* Image library delete button: hover on desktop, always visible on touch */
  .mk-root .mk-img-del { opacity: 0; }
  .mk-root .group:hover .mk-img-del, .mk-root .mk-img-del:focus-visible { opacity: 1; }
  @media (hover: none) { .mk-root .mk-img-del { opacity: 1; } }

  /* Modal */
  .mk-scrim { background: rgba(0,0,0,.72); }
  @media (min-width: 768px) {
    .mk-scrim { background: rgba(0,0,0,.62); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
  }
  .mk-root .mk-modal {
    background: linear-gradient(170deg, #1a1511 0%, #0c0a08 100%);
    border: 1px solid rgba(212,175,55,.2);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 30px 90px rgba(0,0,0,.85);
    overscroll-behavior: contain;
    animation: mk-sheet .24s cubic-bezier(.2,.8,.2,1) both;
  }
  .mk-root .mk-modal-head { background: rgba(22,18,14,.97); border-bottom: 1px solid rgba(255,255,255,.07); }
  .mk-root .mk-grabber { position: absolute; left: 50%; top: 6px; width: 38px; height: 4px; margin-left: -19px; border-radius: 999px; background: rgba(255,255,255,.16); }
  @keyframes mk-sheet { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @media (max-width: 639px) {
    .mk-root .mk-modal { border-bottom: 0; padding-bottom: env(safe-area-inset-bottom); }
    .mk-root .mk-form-actions .mk-btn { width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-root .mk-modal, .mk-root .mk-skel, .mk-root .mk-spin { animation: none; }
    .mk-root .mk-card, .mk-root .mk-art-img { transition: none; }
  }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .mk-root .mk-glass { background: rgba(16,13,11,.96); }
  }
`

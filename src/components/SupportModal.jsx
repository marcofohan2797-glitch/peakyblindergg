import React, { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────────────────────────────
   PeakyBlinder · Support the developer (WEMIX / BTC donation window)
   Opened from "Support the developer" in Layout.jsx.
   No network requests: the QR codes and logos are built in.

   Each QR below was generated from its address and checked to scan back
   to that exact address. If you ever change an address, its QR must be
   regenerated too.
   ───────────────────────────────────────────────────────────────────── */

const WEMIX_LOGO = 'data:image/webp;base64,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'

function BtcLogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#f7931a" />
      <text x="32" y="44.5" textAnchor="middle" fontSize="36" fontWeight="700" fill="#fff" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" transform="rotate(14 32 32)">₿</text>
    </svg>
  )
}

const WALLETS = [
  {
    id: 'wemix',
    tab: 'WEMIX',
    title: 'WEMIX',
    network: 'WEMIX3.0 Mainnet',
    address: '0x21cf51f264bfafb3208675a191a6145e9abb1830',
    qrSize: 29,
    qrPath: 'M0 0h7v1h-7zM9 0h1v1h-1zM16 0h1v1h-1zM19 0h1v1h-1zM22 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM12 1h2v1h-2zM15 1h3v1h-3zM22 1h1v1h-1zM28 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h1v1h-1zM10 2h1v1h-1zM15 2h1v1h-1zM19 2h2v1h-2zM22 2h1v1h-1zM24 2h3v1h-3zM28 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h2v1h-2zM12 3h4v1h-4zM17 3h2v1h-2zM20 3h1v1h-1zM22 3h1v1h-1zM24 3h3v1h-3zM28 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h2v1h-2zM11 4h2v1h-2zM16 4h1v1h-1zM19 4h1v1h-1zM22 4h1v1h-1zM24 4h3v1h-3zM28 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h2v1h-2zM12 5h2v1h-2zM15 5h2v1h-2zM22 5h1v1h-1zM28 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h7v1h-7zM8 7h2v1h-2zM11 7h1v1h-1zM15 7h1v1h-1zM0 8h1v1h-1zM2 8h5v1h-5zM10 8h1v1h-1zM13 8h1v1h-1zM16 8h2v1h-2zM19 8h2v1h-2zM22 8h5v1h-5zM2 9h1v1h-1zM4 9h1v1h-1zM7 9h1v1h-1zM10 9h3v1h-3zM14 9h1v1h-1zM18 9h2v1h-2zM21 9h4v1h-4zM28 9h1v1h-1zM0 10h2v1h-2zM4 10h1v1h-1zM6 10h2v1h-2zM11 10h2v1h-2zM15 10h2v1h-2zM18 10h1v1h-1zM21 10h1v1h-1zM24 10h2v1h-2zM27 10h1v1h-1zM1 11h1v1h-1zM4 11h1v1h-1zM7 11h2v1h-2zM11 11h1v1h-1zM14 11h3v1h-3zM21 11h5v1h-5zM27 11h2v1h-2zM0 12h1v1h-1zM3 12h6v1h-6zM13 12h1v1h-1zM15 12h1v1h-1zM17 12h2v1h-2zM20 12h1v1h-1zM23 12h1v1h-1zM26 12h2v1h-2zM0 13h1v1h-1zM3 13h1v1h-1zM5 13h1v1h-1zM13 13h2v1h-2zM16 13h1v1h-1zM19 13h1v1h-1zM21 13h2v1h-2zM24 13h1v1h-1zM28 13h1v1h-1zM0 14h2v1h-2zM4 14h6v1h-6zM15 14h2v1h-2zM18 14h1v1h-1zM25 14h3v1h-3zM4 15h1v1h-1zM9 15h2v1h-2zM15 15h2v1h-2zM19 15h1v1h-1zM21 15h5v1h-5zM27 15h1v1h-1zM0 16h1v1h-1zM3 16h5v1h-5zM9 16h1v1h-1zM12 16h2v1h-2zM15 16h4v1h-4zM20 16h1v1h-1zM23 16h1v1h-1zM26 16h3v1h-3zM0 17h2v1h-2zM3 17h1v1h-1zM5 17h1v1h-1zM12 17h1v1h-1zM14 17h1v1h-1zM17 17h1v1h-1zM19 17h1v1h-1zM21 17h2v1h-2zM24 17h2v1h-2zM28 17h1v1h-1zM0 18h1v1h-1zM2 18h2v1h-2zM5 18h2v1h-2zM8 18h1v1h-1zM11 18h1v1h-1zM13 18h1v1h-1zM15 18h1v1h-1zM18 18h1v1h-1zM20 18h2v1h-2zM26 18h1v1h-1zM0 19h1v1h-1zM3 19h1v1h-1zM5 19h1v1h-1zM7 19h1v1h-1zM9 19h3v1h-3zM14 19h3v1h-3zM19 19h1v1h-1zM24 19h1v1h-1zM27 19h1v1h-1zM0 20h1v1h-1zM2 20h1v1h-1zM5 20h2v1h-2zM12 20h2v1h-2zM15 20h4v1h-4zM20 20h8v1h-8zM8 21h1v1h-1zM11 21h2v1h-2zM14 21h1v1h-1zM19 21h2v1h-2zM24 21h2v1h-2zM28 21h1v1h-1zM0 22h7v1h-7zM10 22h1v1h-1zM15 22h2v1h-2zM18 22h3v1h-3zM22 22h1v1h-1zM24 22h2v1h-2zM27 22h1v1h-1zM0 23h1v1h-1zM6 23h1v1h-1zM8 23h2v1h-2zM11 23h1v1h-1zM15 23h1v1h-1zM20 23h1v1h-1zM24 23h1v1h-1zM27 23h2v1h-2zM0 24h1v1h-1zM2 24h3v1h-3zM6 24h1v1h-1zM8 24h1v1h-1zM11 24h1v1h-1zM15 24h3v1h-3zM20 24h9v1h-9zM0 25h1v1h-1zM2 25h3v1h-3zM6 25h1v1h-1zM8 25h1v1h-1zM12 25h1v1h-1zM18 25h1v1h-1zM20 25h1v1h-1zM23 25h1v1h-1zM27 25h2v1h-2zM0 26h1v1h-1zM2 26h3v1h-3zM6 26h1v1h-1zM8 26h1v1h-1zM10 26h2v1h-2zM15 26h1v1h-1zM18 26h1v1h-1zM21 26h2v1h-2zM24 26h2v1h-2zM27 26h1v1h-1zM0 27h1v1h-1zM6 27h1v1h-1zM9 27h1v1h-1zM12 27h1v1h-1zM14 27h1v1h-1zM16 27h1v1h-1zM20 27h1v1h-1zM25 27h1v1h-1zM27 27h1v1h-1zM0 28h7v1h-7zM8 28h1v1h-1zM10 28h2v1h-2zM13 28h7v1h-7zM21 28h4v1h-4zM26 28h1v1h-1z',
    logo: size => <img src={WEMIX_LOGO} alt="" width={size} height={size} style={{ width: size, height: size }} />,
    scanHint: 'Scan with WEMIX PLAY or any WEMIX wallet',
    warning: 'Send only WEMIX on WEMIX3.0 Mainnet. Tokens sent from other networks may be lost.',
  },
  {
    id: 'btc',
    tab: 'Bitcoin (BTC)',
    title: 'Bitcoin',
    network: 'Bitcoin network',
    address: '1Czfc9BGAaddhU52SXV8ToCPKFPxX9DSDt',
    qrSize: 29,
    qrPath: 'M0 0h7v1h-7zM9 0h3v1h-3zM13 0h1v1h-1zM16 0h1v1h-1zM18 0h1v1h-1zM22 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h5v1h-5zM14 1h3v1h-3zM19 1h2v1h-2zM22 1h1v1h-1zM28 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM9 2h1v1h-1zM11 2h4v1h-4zM16 2h1v1h-1zM19 2h1v1h-1zM22 2h1v1h-1zM24 2h3v1h-3zM28 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM9 3h2v1h-2zM13 3h3v1h-3zM17 3h2v1h-2zM22 3h1v1h-1zM24 3h3v1h-3zM28 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h2v1h-2zM12 4h1v1h-1zM14 4h1v1h-1zM19 4h1v1h-1zM22 4h1v1h-1zM24 4h3v1h-3zM28 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h1v1h-1zM12 5h2v1h-2zM17 5h1v1h-1zM19 5h1v1h-1zM22 5h1v1h-1zM28 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h7v1h-7zM12 7h3v1h-3zM16 7h2v1h-2zM19 7h2v1h-2zM0 8h1v1h-1zM2 8h1v1h-1zM4 8h1v1h-1zM6 8h1v1h-1zM10 8h1v1h-1zM12 8h1v1h-1zM14 8h3v1h-3zM24 8h1v1h-1zM27 8h1v1h-1zM1 9h1v1h-1zM8 9h1v1h-1zM11 9h2v1h-2zM14 9h2v1h-2zM19 9h4v1h-4zM27 9h2v1h-2zM2 10h2v1h-2zM5 10h2v1h-2zM9 10h1v1h-1zM11 10h1v1h-1zM13 10h1v1h-1zM16 10h3v1h-3zM20 10h1v1h-1zM24 10h1v1h-1zM27 10h2v1h-2zM0 11h2v1h-2zM3 11h3v1h-3zM7 11h1v1h-1zM9 11h1v1h-1zM15 11h5v1h-5zM21 11h1v1h-1zM27 11h2v1h-2zM0 12h1v1h-1zM4 12h1v1h-1zM6 12h1v1h-1zM11 12h1v1h-1zM19 12h1v1h-1zM21 12h2v1h-2zM0 13h1v1h-1zM3 13h2v1h-2zM8 13h1v1h-1zM10 13h1v1h-1zM13 13h1v1h-1zM16 13h2v1h-2zM25 13h1v1h-1zM28 13h1v1h-1zM0 14h3v1h-3zM6 14h2v1h-2zM9 14h2v1h-2zM12 14h1v1h-1zM14 14h1v1h-1zM16 14h2v1h-2zM20 14h3v1h-3zM24 14h2v1h-2zM27 14h2v1h-2zM0 15h1v1h-1zM2 15h4v1h-4zM7 15h4v1h-4zM13 15h5v1h-5zM20 15h1v1h-1zM25 15h1v1h-1zM28 15h1v1h-1zM1 16h2v1h-2zM4 16h4v1h-4zM9 16h1v1h-1zM11 16h1v1h-1zM14 16h1v1h-1zM16 16h1v1h-1zM22 16h1v1h-1zM25 16h1v1h-1zM28 16h1v1h-1zM1 17h1v1h-1zM3 17h1v1h-1zM5 17h1v1h-1zM7 17h2v1h-2zM10 17h1v1h-1zM12 17h1v1h-1zM14 17h7v1h-7zM22 17h1v1h-1zM25 17h3v1h-3zM0 18h1v1h-1zM3 18h1v1h-1zM5 18h3v1h-3zM9 18h2v1h-2zM13 18h1v1h-1zM18 18h1v1h-1zM20 18h9v1h-9zM1 19h5v1h-5zM7 19h1v1h-1zM10 19h1v1h-1zM12 19h1v1h-1zM17 19h1v1h-1zM19 19h1v1h-1zM23 19h1v1h-1zM0 20h1v1h-1zM2 20h2v1h-2zM6 20h4v1h-4zM11 20h2v1h-2zM17 20h1v1h-1zM19 20h6v1h-6zM26 20h1v1h-1zM28 20h1v1h-1zM8 21h1v1h-1zM11 21h3v1h-3zM15 21h2v1h-2zM18 21h1v1h-1zM20 21h1v1h-1zM24 21h2v1h-2zM28 21h1v1h-1zM0 22h7v1h-7zM9 22h2v1h-2zM14 22h1v1h-1zM16 22h1v1h-1zM18 22h1v1h-1zM20 22h1v1h-1zM22 22h1v1h-1zM24 22h1v1h-1zM28 22h1v1h-1zM0 23h1v1h-1zM6 23h1v1h-1zM11 23h7v1h-7zM20 23h1v1h-1zM24 23h1v1h-1zM27 23h2v1h-2zM0 24h1v1h-1zM2 24h3v1h-3zM6 24h1v1h-1zM8 24h2v1h-2zM11 24h1v1h-1zM14 24h1v1h-1zM16 24h1v1h-1zM20 24h5v1h-5zM26 24h1v1h-1zM28 24h1v1h-1zM0 25h1v1h-1zM2 25h3v1h-3zM6 25h1v1h-1zM10 25h1v1h-1zM14 25h3v1h-3zM18 25h1v1h-1zM20 25h2v1h-2zM23 25h2v1h-2zM27 25h2v1h-2zM0 26h1v1h-1zM2 26h3v1h-3zM6 26h1v1h-1zM8 26h2v1h-2zM12 26h1v1h-1zM14 26h1v1h-1zM18 26h1v1h-1zM20 26h2v1h-2zM23 26h3v1h-3zM28 26h1v1h-1zM0 27h1v1h-1zM6 27h1v1h-1zM10 27h3v1h-3zM15 27h1v1h-1zM17 27h1v1h-1zM21 27h1v1h-1zM27 27h1v1h-1zM0 28h7v1h-7zM8 28h3v1h-3zM13 28h1v1h-1zM15 28h1v1h-1zM17 28h4v1h-4zM24 28h1v1h-1zM26 28h3v1h-3z',
    logo: size => <BtcLogo size={size} />,
    scanHint: 'Scan with any Bitcoin wallet app',
    warning: 'Send only Bitcoin (BTC) on the Bitcoin network. Other coins or networks (e.g. BEP20, Lightning) may be lost.',
  },
]

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* fall back below */ }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

export default function SupportModal({ onClose, discordUrl }) {
  const [walletId, setWalletId] = useState(WALLETS[0].id)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const addressRef = useRef(null)
  const timerRef = useRef(null)
  const wallet = WALLETS.find(w => w.id === walletId) || WALLETS[0]

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(timerRef.current)
    }
  }, [onClose])

  const pick = id => {
    setWalletId(id)
    setCopied(false)
    setCopyFailed(false)
  }

  const copy = async () => {
    const ok = await copyText(wallet.address)
    setCopied(ok)
    setCopyFailed(!ok)
    if (!ok && addressRef.current) {
      // Copy blocked: select the address so it can be copied by hand.
      const range = document.createRange()
      range.selectNodeContents(addressRef.current)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="sp-root sp-scrim fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-5" onMouseDown={onClose} role="presentation">
      <style>{SP_STYLES}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-title"
        data-wallet={wallet.id}
        className="sp-card relative max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] px-5 pb-5 pt-6 sm:max-w-[420px] sm:rounded-[24px] sm:px-6"
        onMouseDown={e => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="sp-close absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-xl text-[20px] leading-none">×</button>

        <div className="flex flex-col items-center text-center">
          <div className="sp-logo flex h-16 w-16 items-center justify-center rounded-[20px]">
            {wallet.logo(44)}
          </div>
          <h2 id="sp-title" className="mt-3.5 font-spectral text-[1.55rem] font-bold leading-tight text-text-bright">Support the Developer</h2>
          <p className="sp-dim mt-1.5 text-[13px] leading-5">
            Help keep the PeakyBlinder portal running. Support is always appreciated, never expected. 💛
          </p>
        </div>

        {/* Coin tabs */}
        <div className="sp-tabs mt-4 grid grid-cols-2 gap-1 rounded-2xl p-1" role="tablist" aria-label="Choose a coin">
          {WALLETS.map(w => (
            <button
              key={w.id}
              type="button"
              role="tab"
              aria-selected={walletId === w.id}
              data-coin={w.id}
              onClick={() => pick(w.id)}
              className="sp-tab flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-bold"
            >
              <span className="sp-tab-icon flex h-6 w-6 items-center justify-center rounded-full">{w.logo(18)}</span>
              {w.tab}
            </button>
          ))}
        </div>

        <div key={wallet.id} className="sp-panel" role="tabpanel">
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="sp-qr rounded-[20px] bg-white p-3.5">
              <svg viewBox={`-1 -1 ${wallet.qrSize + 2} ${wallet.qrSize + 2}`} width="176" height="176" shapeRendering="crispEdges" role="img" aria-label={`QR code for ${wallet.title} address ${wallet.address}`} className="block h-[176px] w-[176px]">
                <rect x="-1" y="-1" width={wallet.qrSize + 2} height={wallet.qrSize + 2} fill="#fff" />
                <path d={wallet.qrPath} fill="#000" />
              </svg>
            </div>
            <p className="sp-dim mt-2 text-[12.5px]">{wallet.scanHint}</p>
          </div>

          <div className="sp-box mt-4 rounded-[18px] p-3">
            <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-text-bright">
                <span className="sp-dot h-2 w-2 rounded-full" aria-hidden="true" />
                {wallet.title} Address
              </span>
              <span className="sp-dim text-[11.5px] font-semibold">{wallet.network}</span>
            </div>
            <div ref={addressRef} className="sp-addr select-all break-all rounded-xl px-2.5 py-2.5 text-center font-mono text-[11.5px] leading-5 text-text-bright min-[400px]:text-[12px] sm:text-[12.5px]">
              {wallet.address}
            </div>
            <button type="button" onClick={copy} className={`sp-copy mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold ${copied ? 'is-copied' : ''}`}>
              {copied ? (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                  Copy {wallet.id === 'btc' ? 'Bitcoin' : 'WEMIX'} Address
                </>
              )}
            </button>
            {copyFailed && (
              <p className="mt-2 text-center text-[12px] text-amber-200">Copy was blocked by the browser. The address is selected; copy it manually.</p>
            )}
          </div>

          <p className="sp-warn mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12.5px] leading-5">
            <svg className="mt-[3px] shrink-0 text-amber-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" /><path d="M12 8v5M12 16h.01" /></svg>
            <span>{wallet.warning}</span>
          </p>
        </div>

        {discordUrl && (
          <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-[12px] font-semibold text-gold-light underline decoration-gold/30 underline-offset-2 hover:text-gold-bright">
            Prefer to chat? Message me on Discord
          </a>
        )}
      </div>
    </div>
  )
}

const SP_STYLES = `
  .sp-scrim { background: rgba(0,0,0,.72); }
  @media (min-width: 640px) { .sp-scrim { background: rgba(0,0,0,.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); } }

  /* Colours per coin: WEMIX = pink → purple → blue, BTC = orange */
  .sp-root .sp-card {
    --sp-a: #ff2d6f; --sp-b: #b44dff; --sp-c: #4f5bff; --sp-glow: 180,77,255;
    background:
      radial-gradient(90% 55% at 50% 0%, rgba(var(--sp-glow),.16) 0%, transparent 60%),
      linear-gradient(170deg, #17121a 0%, #0b0a0c 100%);
    border: 1px solid rgba(var(--sp-glow),.3);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 30px 90px rgba(0,0,0,.85);
    overscroll-behavior: contain;
    transition: border-color .3s ease, background .3s ease;
    animation: sp-in .24s cubic-bezier(.2,.8,.2,1) both;
  }
  .sp-root .sp-card[data-wallet="btc"] {
    --sp-a: #ffb347; --sp-b: #f7931a; --sp-c: #e2761b; --sp-glow: 247,147,26;
    background:
      radial-gradient(90% 55% at 50% 0%, rgba(247,147,26,.15) 0%, transparent 60%),
      linear-gradient(170deg, #19140e 0%, #0b0a09 100%);
  }
  @media (max-width: 639px) { .sp-root .sp-card { border-bottom: 0; padding-bottom: max(20px, env(safe-area-inset-bottom)); } }
  @keyframes sp-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  .sp-root .sp-panel { animation: sp-fade .22s ease both; }
  @keyframes sp-fade { from { opacity: .35; } to { opacity: 1; } }

  .sp-root .sp-close { border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); color: #c9bda8; transition: all .2s ease; }
  .sp-root .sp-close:hover { color: #f4ebd9; border-color: rgba(255,255,255,.22); }
  .sp-root .sp-logo {
    background: linear-gradient(160deg, #1e1a20 0%, #0f0c10 100%);
    box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 10px 30px -8px rgba(var(--sp-glow),.55), 0 0 26px -6px var(--sp-a);
  }

  /* Tabs */
  .sp-root .sp-tabs { background: rgba(0,0,0,.32); border: 1px solid rgba(255,255,255,.08); }
  .sp-root .sp-tab { color: #d3c7b3; border: 1px solid transparent; transition: background .2s ease, color .2s ease, box-shadow .2s ease; }
  .sp-root .sp-tab:hover { color: #fff; background: rgba(255,255,255,.04); }
  .sp-root .sp-tab[aria-selected="true"][data-coin="wemix"] {
    color: #fff; background: linear-gradient(90deg, #ff2d6f 0%, #b44dff 52%, #4f5bff 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 8px 20px -10px rgba(180,77,255,.8);
  }
  .sp-root .sp-tab[aria-selected="true"][data-coin="btc"] {
    color: #1a0f02; background: linear-gradient(180deg, #ffb347 0%, #f7931a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px -10px rgba(247,147,26,.8);
  }

  .sp-root .sp-tab-icon { background: #0f0c10; box-shadow: 0 0 0 1px rgba(255,255,255,.12); }
  .sp-root .sp-qr { box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 18px 40px -18px rgba(var(--sp-glow),.6); }
  /* Fixed colours, so the text stays readable whatever the site's dim grey is */
  .sp-root .sp-dim { color: #d3c7b3; }
  .sp-root .sp-warn { color: #fde6b0; background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.28); text-align: left; }
  .sp-root .sp-box { background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.08); }
  .sp-root .sp-dot { background: linear-gradient(135deg, var(--sp-a), var(--sp-b) 55%, var(--sp-c)); box-shadow: 0 0 8px rgba(var(--sp-glow),.7); }
  .sp-root .sp-addr { background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.07); letter-spacing: 0; }
  .sp-root .sp-copy {
    color: #fff; border: 1px solid rgba(255,255,255,.18);
    background: linear-gradient(90deg, var(--sp-a) 0%, var(--sp-b) 52%, var(--sp-c) 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 10px 26px -12px rgba(var(--sp-glow),.8);
    transition: filter .2s ease, transform .12s ease;
  }
  .sp-root .sp-card[data-wallet="btc"] .sp-copy { color: #1a0f02; }
  .sp-root .sp-copy:hover { filter: brightness(1.08); }
  .sp-root .sp-copy:active { transform: scale(.98); }
  .sp-root .sp-copy.is-copied { color: #fff; background: linear-gradient(90deg, #10b981, #34d399); }
  .sp-root button:focus-visible, .sp-root a:focus-visible { outline: 2px solid rgba(var(--sp-glow),.85); outline-offset: 2px; }
`

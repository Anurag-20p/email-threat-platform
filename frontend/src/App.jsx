import { useState, useRef } from 'react'
import jsPDF from 'jspdf'

function Logo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#00E5C7" />
          <stop offset="100%" stopColor="#39FF88" />
        </linearGradient>
      </defs>
      <rect x="4" y="9" width="32" height="22" rx="4" stroke="url(#logoGrad)" strokeWidth="2" />
      <path d="M5 12L20 23L35 12" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="27" r="7" fill="#05080D" stroke="url(#logoGrad)" strokeWidth="2" />
      <path d="M31 24.5V27L32.5 28.5" stroke="url(#logoGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function EnvelopeIcon({ className = 'w-4 h-4 text-accent' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 6.5L12 13L20 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent">
      <circle cx="5" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="19" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 8v4a4 4 0 004 4h6" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent">
      <path d="M6 3h8l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function HeroGraphic() {
  return (
    <svg viewBox="0 0 320 220" fill="none" className="w-full max-w-sm mx-auto">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="320" y2="220">
          <stop offset="0%" stopColor="#00E5C7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00E5C7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M30 190 L100 130 L160 150 L220 70 L290 40" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="290" cy="40" r="5" fill="#FF4655" />
      <circle cx="290" cy="40" r="10" stroke="#FF4655" strokeOpacity="0.4" />
      <circle cx="220" cy="70" r="4" fill="#00E5C7" />
      <circle cx="160" cy="150" r="4" fill="#00E5C7" />
      <circle cx="100" cy="130" r="4" fill="#00E5C7" />
      <circle cx="30" cy="190" r="6" fill="#39FF88" />
      <circle cx="30" cy="190" r="11" stroke="#39FF88" strokeOpacity="0.4" />
      <text x="290" y="28" fill="#7C8B99" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">origin</text>
      <text x="30" y="208" fill="#7C8B99" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">inbox</text>
    </svg>
  )
}

function FeatureStrip() {
  const features = [
    { icon: <ShieldIcon />, label: 'SPF · DKIM · DMARC checks' },
    { icon: <RouteIcon />, label: 'AI phishing detection' },
    { icon: <PinIcon />, label: 'IP geolocation tracing' },
    { icon: <FileIcon />, label: 'Forensic report export' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
      {features.map((f, i) => (
        <div key={i} className="glass border border-line rounded-xl px-3 py-3 flex flex-col items-center text-center gap-2">
          {f.icon}
          <span className="text-[11px] text-muted leading-tight">{f.label}</span>
        </div>
      ))}
    </div>
  )
}

function extractAuthResult(text, key) {
  if (!text) return null
  const match = text.match(new RegExp(`${key}=(pass|fail|none|neutral|softfail)`, 'i'))
  return match ? match[1] : null
}

function AuthChip({ label, value }) {
  const v = (value || '').toLowerCase()
  const status = v.includes('pass') ? 'pass' : v.includes('fail') ? 'fail' : 'unknown'
  const styles = {
    pass: 'border-safe/40 text-safe',
    fail: 'border-danger/40 text-danger',
    unknown: 'border-line text-muted',
  }
  const icon = { pass: '✓', fail: '✕', unknown: '–' }

  return (
    <div className={`flex items-center justify-between border rounded-md px-3 py-2 ${styles[status]}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-mono text-sm">{icon[status]} {status}</span>
    </div>
  )
}

function VerdictBanner({ prediction, fraudScore }) {
  const isHigh = fraudScore.risk_level === 'High'
  const isMedium = fraudScore.risk_level === 'Medium'
  const color = isHigh ? 'border-danger/50' : isMedium ? 'border-warn/50' : 'border-safe/50'
  const textColor = isHigh ? 'text-danger' : isMedium ? 'text-warn' : 'text-safe'
  const barColor = isHigh ? 'bg-danger' : isMedium ? 'bg-warn' : 'bg-safe'
  const glow = isHigh ? 'shadow-[0_0_40px_rgba(255,70,85,0.12)]' : isMedium ? 'shadow-[0_0_40px_rgba(242,183,5,0.1)]' : 'shadow-[0_0_40px_rgba(63,224,165,0.12)]'

  return (
    <div className={`glass border rounded-2xl p-7 fade-in-up ${color} ${glow}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-sm mb-1">Verdict</p>
          <h2 className={`font-display text-4xl font-medium ${textColor}`}>{prediction.classification}</h2>
        </div>
        <div className="text-right">
          <p className="text-muted text-sm mb-1">Risk level</p>
          <p className={`font-display text-2xl font-medium ${textColor}`}>{fraudScore.risk_level}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Fraud score</span>
            <span className="font-mono">{fraudScore.score}/100</span>
          </div>
          <div className="h-1.5 bg-line rounded-full overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${fraudScore.score}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>ML confidence</span>
            <span className="font-mono">{prediction.confidence}%</span>
          </div>
          <div className="h-1.5 bg-line rounded-full overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${prediction.confidence}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, children, delay = 0 }) {
  return (
    <div className="glass glow-border border border-line rounded-2xl p-5 fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-display text-lg">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function OriginTrace({ path, delay }) {
  const steps = [...path].reverse()
  return (
    <Section icon={<RouteIcon />} title="Send path (origin → inbox)" delay={delay}>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
              {i < steps.length - 1 && <div className="w-px flex-1 bg-line" />}
            </div>
            <p className="font-mono text-xs text-muted pb-4 break-all">{step}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function GeoOrigin({ geo, delay }) {
  if (!geo) {
    return (
      <Section icon={<PinIcon />} title="Origin location" delay={delay}>
        <p className="text-muted text-sm">Public origin IP could not be determined.</p>
      </Section>
    )
  }
  return (
    <Section icon={<PinIcon />} title="Origin location" delay={delay}>
      <div className="space-y-2 text-sm">
        <p><span className="text-muted">IP:</span> <span className="font-mono text-accent">{geo.ip}</span></p>
        <p><span className="text-muted">Location:</span> {geo.city}, {geo.region}, {geo.country}</p>
        <p><span className="text-muted">ISP:</span> {geo.isp}</p>
      </div>

      {geo.is_hosting_or_vpn && (
        <div className="mt-4 border border-warn/40 bg-warn/10 text-warn text-xs rounded-lg px-3 py-2">
          ⚠️ Hosting/VPN infrastructure detected — sender's real location is likely hidden
        </div>
      )}

      <p className="text-muted text-xs mt-4 pt-4 border-t border-line">
        Approximate location based on IP registration records, not the sender's exact physical address.
      </p>
    </Section>
  )
}

function RawHeaders({ headers, delay }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass border border-line rounded-2xl fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-3 text-left text-sm text-muted hover:text-accent transition-colors"
      >
        <span>Raw headers</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2 font-mono text-xs text-muted border-t border-line pt-4">
          {Object.entries(headers).map(([key, value]) => (
            <div key={key} className="break-all">
              <span className="text-text">{key}:</span> {value || '—'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadZone({ onFile, loading }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0])
      }}
      onClick={() => inputRef.current?.click()}
      className={`glass border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
        dragOver ? 'border-accent shadow-[0_0_40px_rgba(0,229,199,0.15)] scale-[1.01]' : 'border-line hover:border-accent/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".eml"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      <EnvelopeIcon className="w-6 h-6 text-accent mx-auto" />
      <p className="font-display text-xl text-text mt-3 mb-1">
        {loading ? 'Analyzing…' : 'Drop an .eml file here'}
      </p>
      <p className="text-muted text-sm">or click to browse</p>
    </div>
  )
}

function generatePDF(result) {
  const doc = new jsPDF()
  let y = 20

  doc.setFontSize(18)
  doc.text('Email Forensic Report', 14, y)
  y += 10

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y)
  y += 12

  doc.setTextColor(0)
  doc.setFontSize(13)
  doc.text('Verdict', 14, y)
  y += 7
  doc.setFontSize(11)
  doc.text(`Classification: ${result.ml_prediction.classification}`, 14, y)
  y += 6
  doc.text(`Confidence: ${result.ml_prediction.confidence}%`, 14, y)
  y += 6
  doc.text(`Fraud score: ${result.fraud_score.score}/100 (${result.fraud_score.risk_level} risk)`, 14, y)
  y += 12

  doc.setFontSize(13)
  doc.text('Message Details', 14, y)
  y += 7
  doc.setFontSize(10)
  const fields = ['From', 'To', 'Subject', 'Return-Path', 'Message-ID']
  fields.forEach((f) => {
    const text = doc.splitTextToSize(`${f}: ${result.headers[f] || 'N/A'}`, 180)
    doc.text(text, 14, y)
    y += text.length * 5 + 2
  })
  y += 6

  doc.setFontSize(13)
  doc.text('Origin', 14, y)
  y += 7
  doc.setFontSize(10)
  if (result.geolocation) {
    doc.text(`IP: ${result.geolocation.ip}`, 14, y); y += 6
    doc.text(`Location: ${result.geolocation.city}, ${result.geolocation.region}, ${result.geolocation.country}`, 14, y); y += 6
    doc.text(`ISP: ${result.geolocation.isp}`, 14, y); y += 6
  } else {
    doc.text('Public origin IP could not be determined.', 14, y); y += 6
  }

  doc.save(`forensic-report-${Date.now()}.pdf`)
}

function downloadJSON(result) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `email-analysis-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async (file) => {
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch('http://127.0.0.1:8000/parse-email', { method: 'POST', body: formData })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Backend se connect nahi ho paya. Check karein backend chal raha hai.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen text-text relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-danger/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="font-display text-xl italic font-medium tracking-tight">Threat Trace</h1>
              <p className="text-muted text-xs">Email authenticity, origin &amp; fraud analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 glass border border-line rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safe pulse-dot" />
            <span className="text-xs text-muted">Model online</span>
          </div>
        </header>

        {!result && (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 glass border border-accent/30 rounded-full px-4 py-1.5 mb-6">
                <ShieldIcon />
                <span className="text-xs text-accent">AI-powered forensic analysis</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight mb-3">
                Where did this email<br />actually come from?
              </h2>
              <p className="text-muted max-w-md mx-auto text-sm">
                Upload a raw <span className="font-mono">.eml</span> file to check its authentication,
                trace its origin, and get a fraud risk verdict.
              </p>
            </div>

            <HeroGraphic />

            <div className="mt-6">
              <FeatureStrip />
            </div>
          </>
        )}

        <UploadZone onFile={analyze} loading={loading} />

        {error && (
          <div className="mt-4 glass border border-danger/40 text-danger text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-5">
            <VerdictBanner prediction={result.ml_prediction} fraudScore={result.fraud_score} />

            <div className="flex gap-3 fade-in-up" style={{ animationDelay: '80ms' }}>
              <button
                onClick={() => generatePDF(result)}
                className="glass border border-accent/40 text-accent text-sm px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors"
              >
                Download PDF Report
              </button>
              <button
                onClick={() => downloadJSON(result)}
                className="glass border border-line text-muted text-sm px-4 py-2 rounded-lg hover:text-text transition-colors"
              >
                Download JSON
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Section icon={<ShieldIcon />} title="Authentication" delay={120}>
                <div className="space-y-2">
                  <AuthChip label="SPF" value={result.headers.SPF} />
                  <AuthChip label="DKIM" value={extractAuthResult(result.headers['Authentication-Results'], 'dkim')} />
                  <AuthChip label="DMARC" value={extractAuthResult(result.headers['Authentication-Results'], 'dmarc')} />
                </div>
              </Section>

              <Section icon={<EnvelopeIcon />} title="Message" delay={160}>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted">From:</span> {result.headers.From}</p>
                  <p><span className="text-muted">To:</span> {result.headers.To}</p>
                  <p><span className="text-muted">Subject:</span> {result.headers.Subject}</p>
                </div>
              </Section>
            </div>

            <OriginTrace path={result.received_path} delay={200} />
            <GeoOrigin geo={result.geolocation} delay={240} />

            {result.body_preview && (
              <Section icon={<EnvelopeIcon />} title="Body preview" delay={280}>
                <p className="text-sm text-muted whitespace-pre-line">{result.body_preview}</p>
              </Section>
            )}

            <RawHeaders headers={result.headers} delay={320} />
          </div>
        )}

        <footer className="text-center text-muted text-xs mt-16 pb-6">
          SIH 2026 · Problem Statement 26106 · AI-Powered Email Threat Detection Platform
        </footer>
      </div>
    </div>
  )
}

export default App
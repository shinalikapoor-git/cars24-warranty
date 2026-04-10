import { useState, useEffect, useRef, useCallback } from 'react'

// ── Scroll-driven progress for a section ────────────────────
function useSectionProgress(ref, startOffset = 0, endOffset = 1) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const totalTravel = rect.height + vh
      const traveled = vh - rect.top
      const raw = traveled / totalTravel
      const clamped = Math.max(0, Math.min(1, (raw - startOffset) / (endOffset - startOffset)))
      setProgress(clamped)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [ref, startOffset, endOffset])
  return progress
}

// ── Scroll reveal ───────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0
          setTimeout(() => entry.target.classList.add('visible'), Number(delay))
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  })
}

// ── Counter animation ───────────────────────────────────────
function useCounter(target, duration = 1200, trigger = true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const p = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, trigger])
  return val
}

// ── Ripple ──────────────────────────────────────────────────
function useRipple() {
  return useCallback((e) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = (e.clientX - rect.left) + 'px'
    ripple.style.top = (e.clientY - rect.top) + 'px'
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }, [])
}

// ── 3D Car SVG (side-view with part zones) ──────────────────
function Car3D({ rotation = 0, activePartIndex = -1, glow = false }) {
  const perspectiveStyle = {
    transform: `perspective(1200px) rotateY(${rotation}deg) rotateX(${Math.sin(rotation * 0.02) * 3}deg)`,
    transition: 'transform 0.1s linear',
    transformStyle: 'preserve-3d',
  }

  const parts = [
    { id: 'engine', path: 'M 118,38 L 148,34 L 152,46 L 148,56 L 118,56 Z', color: '#4736FE' },
    { id: 'transmission', path: 'M 70,50 L 118,50 L 118,70 L 70,70 Z', color: '#7c5cfc' },
    { id: 'electronics', path: 'M 80,20 L 120,18 L 130,34 L 75,34 Z', color: '#06b6d4' },
    { id: 'brakes-f', path: 'M 120,60 A 14 14 0 1 1 120,88 A 14 14 0 1 1 120,60', color: '#ef4444' },
    { id: 'brakes-r', path: 'M 38,60 A 14 14 0 1 1 38,88 A 14 14 0 1 1 38,60', color: '#ef4444' },
    { id: 'ac', path: 'M 90,22 L 110,20 L 112,32 L 88,32 Z', color: '#22c55e' },
    { id: 'steering', path: 'M 120,28 L 135,26 L 138,36 L 120,36 Z', color: '#f59e0b' },
    { id: 'drivetrain', path: 'M 42,72 L 120,72 L 120,78 L 42,78 Z', color: '#a855f7' },
  ]

  return (
    <div className="car-3d-wrapper" style={perspectiveStyle}>
      <svg viewBox="0 0 160 100" className="car-3d-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="carGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="partGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b"/>
            <stop offset="50%" stopColor="#334155"/>
            <stop offset="100%" stopColor="#1e293b"/>
          </linearGradient>
          <linearGradient id="bodySheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)"/>
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>
          <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </linearGradient>
          <radialGradient id="headlightGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fef9c3"/>
            <stop offset="100%" stopColor="#fbbf24"/>
          </radialGradient>
        </defs>

        {/* Part highlight zones */}
        {parts.map((part, i) => (
          <path
            key={part.id}
            d={part.path}
            fill={activePartIndex === i ? part.color : 'transparent'}
            opacity={activePartIndex === i ? 0.3 : 0}
            filter={activePartIndex === i ? 'url(#partGlow)' : undefined}
            className={activePartIndex === i ? 'part-active' : ''}
          />
        ))}

        {/* Car body - lower */}
        <rect x="8" y="42" width="148" height="32" rx="6" fill="url(#bodyGrad)" filter={glow ? 'url(#carGlow)' : undefined}/>
        <rect x="8" y="42" width="148" height="32" rx="6" fill="url(#bodySheen)"/>

        {/* Car body - roof */}
        <path d="M 32,42 Q 42,16 65,14 L 110,14 Q 132,16 140,42 Z" fill="url(#bodyGrad)"/>
        <path d="M 32,42 Q 42,16 65,14 L 110,14 Q 132,16 140,42 Z" fill="url(#bodySheen)"/>

        {/* Windows */}
        <path d="M 48,40 Q 52,22 68,18 L 106,18 Q 120,20 126,40 Z" fill="url(#windowGrad)" opacity="0.7"/>
        <line x1="86" y1="18" x2="86" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>

        {/* Chrome trim */}
        <line x1="10" y1="55" x2="152" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>

        {/* Front bumper */}
        <path d="M 148,44 Q 158,46 158,54 Q 158,62 148,64 L 148,44 Z" fill="#1e293b"/>
        <rect x="154" y="46" width="4" height="4" rx="1" fill="url(#headlightGrad)"/>
        <rect x="154" y="58" width="4" height="3" rx="1" fill="#ef4444" opacity="0.6"/>

        {/* Rear */}
        <path d="M 12,44 Q 4,46 4,54 Q 4,62 12,64 L 12,44 Z" fill="#1e293b"/>
        <rect x="2" y="46" width="4" height="4" rx="1" fill="#ef4444" opacity="0.8"/>
        <rect x="2" y="58" width="4" height="3" rx="1" fill="#ef4444" opacity="0.6"/>

        {/* Front wheel */}
        <circle cx="125" cy="74" r="14" fill="#0f172a"/>
        <circle cx="125" cy="74" r="12" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
        <circle cx="125" cy="74" r="8" fill="#334155"/>
        <circle cx="125" cy="74" r="3" fill="#64748b"/>
        {/* Wheel spokes */}
        {[0,60,120,180,240,300].map(a => (
          <line key={a} x1={125+Math.cos(a*Math.PI/180)*4} y1={74+Math.sin(a*Math.PI/180)*4}
            x2={125+Math.cos(a*Math.PI/180)*10} y2={74+Math.sin(a*Math.PI/180)*10}
            stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
        {/* Brake disc glow */}
        {activePartIndex === 3 && <circle cx="125" cy="74" r="10" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6" className="part-active"/>}

        {/* Rear wheel */}
        <circle cx="38" cy="74" r="14" fill="#0f172a"/>
        <circle cx="38" cy="74" r="12" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
        <circle cx="38" cy="74" r="8" fill="#334155"/>
        <circle cx="38" cy="74" r="3" fill="#64748b"/>
        {[0,60,120,180,240,300].map(a => (
          <line key={a} x1={38+Math.cos(a*Math.PI/180)*4} y1={74+Math.sin(a*Math.PI/180)*4}
            x2={38+Math.cos(a*Math.PI/180)*10} y2={74+Math.sin(a*Math.PI/180)*10}
            stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
        {activePartIndex === 4 && <circle cx="38" cy="74" r="10" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6" className="part-active"/>}

        {/* CARS24 badge */}
        <rect x="72" y="48" width="32" height="10" rx="2" fill="rgba(71,54,254,0.2)" stroke="rgba(71,54,254,0.4)" strokeWidth="0.5"/>
        <text x="88" y="55.5" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#818cf8" fontFamily="DM Sans, sans-serif">CARS24</text>
      </svg>
    </div>
  )
}

// ── Floating Parts (antigravity) ────────────────────────────
function FloatingParts({ progress }) {
  const orbitParts = [
    { emoji: '⚙️', label: 'Engine', angle: 0 },
    { emoji: '🔧', label: 'Gearbox', angle: 60 },
    { emoji: '❄️', label: 'A/C', angle: 120 },
    { emoji: '🛞', label: 'Brakes', angle: 180 },
    { emoji: '⚡', label: 'Electronics', angle: 240 },
    { emoji: '🔩', label: 'Drivetrain', angle: 300 },
  ]

  return (
    <div className="floating-parts">
      {orbitParts.map((part, i) => {
        const baseAngle = part.angle + progress * 360
        const rad = (baseAngle * Math.PI) / 180
        const rx = 42, ry = 18
        const x = Math.cos(rad) * rx
        const y = Math.sin(rad) * ry
        const scale = 0.6 + (Math.sin(rad) + 1) * 0.25
        const opacity = 0.4 + (Math.sin(rad) + 1) * 0.3

        return (
          <div
            key={i}
            className="orbit-part"
            style={{
              transform: `translate(${x}%, ${y}%) scale(${scale})`,
              opacity,
              zIndex: Math.sin(rad) > 0 ? 2 : 0,
            }}
          >
            <span className="orbit-emoji">{part.emoji}</span>
            <span className="orbit-label">{part.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Coverage showcase items ─────────────────────────────────
const coverageItems = [
  { title: 'Engine', desc: 'Complete engine block, pistons, valves, timing chain & head gasket', icon: '⚙️', partIndex: 0, stat: '$12,000+', statLabel: 'avg repair cost' },
  { title: 'Transmission', desc: 'Gearbox, torque converter, shift solenoids & valve body', icon: '🔧', partIndex: 1, stat: '$8,500+', statLabel: 'avg repair cost' },
  { title: 'Electronics & Computing', desc: 'ECU, TCU, sensors, wiring harness & control modules', icon: '⚡', partIndex: 2, stat: '$4,200+', statLabel: 'avg repair cost' },
  { title: 'Braking System', desc: 'ABS module, calipers, master cylinder & brake booster', icon: '🛞', partIndex: 3, stat: '$3,800+', statLabel: 'avg repair cost' },
  { title: 'Air Conditioning', desc: 'Compressor, condenser, evaporator & expansion valve', icon: '❄️', partIndex: 5, stat: '$2,500+', statLabel: 'avg repair cost' },
  { title: 'Steering System', desc: 'Power steering pump, rack & pinion, tie rods', icon: '🎯', partIndex: 6, stat: '$3,200+', statLabel: 'avg repair cost' },
  { title: 'Drivetrain', desc: 'Driveshaft, CV joints, differential & transfer case', icon: '🔩', partIndex: 7, stat: '$5,600+', statLabel: 'avg repair cost' },
]

// ── Plan Card ───────────────────────────────────────────────
function PlanCard({ title, price, unit, validity, selected, onSelect, onRemove }) {
  const ripple = useRipple()
  return (
    <div
      className={`plan-card ripple-container ${selected ? 'selected' : ''}`}
      onClick={(e) => { ripple(e); onSelect() }}
    >
      <div className="plan-card-top">
        <div className="plan-radio"><div className="plan-radio-inner"/></div>
        <div className="plan-card-info">
          <div className="plan-card-title">{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="plan-card-price">{price}</span>
            <span className="plan-card-price-unit">{unit}</span>
          </div>
          <div className="plan-card-validity">
            <span className="validity-badge">✓ Active</span>{validity}
          </div>
          {selected && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div className="plan-card-selected-badge"><span>✓</span> Added to plan</div>
              <button className="plan-remove" onClick={(e) => { e.stopPropagation(); onRemove() }}>Remove</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────
export default function App() {
  useScrollReveal()

  const heroRef = useRef(null)
  const showcaseRef = useRef(null)
  const statsRef = useRef(null)

  const heroProgress = useSectionProgress(heroRef, 0, 0.5)
  const showcaseProgress = useSectionProgress(showcaseRef, 0.05, 0.95)

  const [statVisible, setStatVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('loan')
  const [selectedPlan, setSelectedPlan] = useState(1)
  const ripple = useRipple()

  const stat1 = useCounter(25000, 1400, statVisible)
  const stat2 = useCounter(2000, 1200, statVisible)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  // Map showcase scroll to active coverage item
  const activeShowcaseIndex = Math.min(
    coverageItems.length - 1,
    Math.max(0, Math.floor(showcaseProgress * coverageItems.length))
  )
  const activeItem = coverageItems[activeShowcaseIndex] || coverageItems[0]

  // Hero car animation
  const carFlyX = Math.max(0, (1 - heroProgress * 2.5)) * 120
  const carFlyScale = 0.3 + Math.min(1, heroProgress * 2) * 0.7
  const carFlyOpacity = Math.min(1, heroProgress * 3)

  // Showcase car rotation
  const showcaseRotation = showcaseProgress * 45 - 15

  const plans = [
    { id: 0, title: 'Up to 12 months cover', price: '$38', unit: '/week', months: 12, validity: 'Warranty & RSA till Oct 2025' },
    { id: 1, title: 'Up to 12 months cover', price: '$38', unit: '/week', months: 12, validity: 'Warranty & RSA till Oct 2026' },
  ]

  return (
    <>
      {/* Scroll progress */}
      <div className="scroll-progress-track">
        <div className="scroll-progress-bar" id="scrollBar"/>
      </div>

      <div className="app-shell">

        {/* ── HEADER ── */}
        <header className="header">
          <div className="header-bar">
            <button className="back-btn" aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="#4736FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div>
              <div className="header-car-name">2016 Range Rover Sport</div>
              <div className="header-car-sub">Vehicle warranty options</div>
            </div>
          </div>
          <div className="stepper">
            {['CARS24 Cover', 'Payment', 'Checkout'].map((s, i) => (
              <div key={i} className={`stepper-pill ${i === 0 ? 'active' : ''}`}>{s}</div>
            ))}
          </div>
        </header>

        {/* ── CINEMATIC HERO ── */}
        <section className="hero-cinema" ref={heroRef}>
          <div className="hero-bg">
            <div className="hero-grid"/>
            <div className="hero-glow"/>
            <div className="hero-glow-2"/>
          </div>

          <div className="hero-content">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line"/>
              EXTENDED WARRANTY
              <div className="hero-eyebrow-line"/>
            </div>
            <h1 className="hero-title">
              <span className="hero-title-brand">CARS24</span>
              <br/>Platinum Cover
            </h1>
            <p className="hero-subtitle">
              Ultimate protection for your Range Rover.<br/>
              Over <strong>5,000+ parts</strong> covered.
            </p>

            {/* Car flies in */}
            <div
              className="hero-car-stage"
              style={{
                transform: `translateX(${carFlyX}%) scale(${carFlyScale})`,
                opacity: carFlyOpacity,
              }}
            >
              <Car3D rotation={heroProgress * 20 - 10} glow={heroProgress > 0.3}/>
              <div className="hero-car-reflection"/>
              <div className="hero-car-shadow"/>
            </div>

            <FloatingParts progress={heroProgress}/>

            {/* Stamp badge */}
            <div className="stamp-badge">
              <div className="stamp-inner">
                <span className="stamp-upto">UPTO</span>
                <span className="stamp-months">36</span>
                <span className="stamp-label">months</span>
                <span className="stamp-protection">PROTECTION</span>
              </div>
            </div>
          </div>

          <div className="hero-scroll-hint">
            <div className="scroll-mouse">
              <div className="scroll-dot"/>
            </div>
            <span>Scroll to explore</span>
          </div>
        </section>

        {/* ── 3D CAR SHOWCASE — SCROLL PINNED ── */}
        <section className="showcase-section" ref={showcaseRef}>
          <div className="showcase-sticky">
            <div className="showcase-bg-grid"/>

            <div className="showcase-header reveal">
              <div className="showcase-eyebrow">What's covered</div>
              <h2 className="showcase-title">Manufacturer-level<br/>protection</h2>
            </div>

            {/* 3D Car with active part */}
            <div className="showcase-car-container">
              <Car3D
                rotation={showcaseRotation}
                activePartIndex={activeItem.partIndex}
                glow
              />
              <div className="showcase-car-shadow"/>

              {/* Scan line */}
              <div
                className="scan-line"
                style={{ top: `${20 + showcaseProgress * 60}%` }}
              />
            </div>

            {/* Active part info */}
            <div className="showcase-part-info" key={activeShowcaseIndex}>
              <div className="part-icon">{activeItem.icon}</div>
              <div className="part-details">
                <div className="part-number">{String(activeShowcaseIndex + 1).padStart(2, '0')} / {String(coverageItems.length).padStart(2, '0')}</div>
                <h3 className="part-title">{activeItem.title}</h3>
                <p className="part-desc">{activeItem.desc}</p>
                <div className="part-stat">
                  <span className="part-stat-value">{activeItem.stat}</span>
                  <span className="part-stat-label">{activeItem.statLabel}</span>
                </div>
              </div>
            </div>

            {/* Progress dots */}
            <div className="showcase-dots">
              {coverageItems.map((_, i) => (
                <div key={i} className={`showcase-dot ${i === activeShowcaseIndex ? 'active' : ''} ${i < activeShowcaseIndex ? 'done' : ''}`}/>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section className="proof-section">
          <div className="reveal">
            <div className="proof-eyebrow">Trusted by thousands</div>
            <h2 className="proof-title">The best warranty<br/>in Australia.</h2>
          </div>

          <div className="proof-cards">
            {[
              { stat: '99%', label: 'Claim approval rate', desc: 'We honour all genuine claims.', icon: '✅' },
              { stat: '∞', label: 'No kilometre limit', desc: 'Drive as much as you please.', icon: '🛣️' },
              { stat: '100%', label: 'No claim limit', desc: 'Claim up to the value of the car.', icon: '💎' },
            ].map((card, i) => (
              <div key={i} className="proof-card reveal" data-delay={i * 150}>
                <div className="proof-card-icon">{card.icon}</div>
                <div className="proof-card-stat">{card.stat}</div>
                <div className="proof-card-label">{card.label}</div>
                <div className="proof-card-desc">{card.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DID YOU KNOW ── */}
        <section className="dyk-section reveal">
          <div className="dyk-glow"/>
          <div className="dyk-icon">💡</div>
          <h3 className="dyk-title">Did you know?</h3>
          <p className="dyk-body">
            Engine repairs cost upwards of <strong className="dyk-highlight">$10,000</strong> in Australia.
            Get years of protection for a fraction of the cost.
          </p>
        </section>

        {/* ── STATS ── */}
        <section className="stats-section reveal" ref={statsRef}>
          <div className="stat-card">
            <div className="stat-value">${stat1.toLocaleString()}</div>
            <div className="stat-label">Total repair costs paid out<br/>for Range Rover Sport</div>
          </div>
          <div className="stat-divider"/>
          <div className="stat-card">
            <div className="stat-value">{stat2.toLocaleString()}+</div>
            <div className="stat-label">Claims processed<br/>by CARS24</div>
          </div>
        </section>

        {/* ── PLAN SELECTION ── */}
        <section className="plan-section">
          <div className="reveal">
            <div className="plan-section-title">Choose your plan</div>
          </div>

          <div className="plan-tabs">
            {[
              { id: 'loan', label: 'Add to loan' },
              { id: 'outright', label: 'Pay outright' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`plan-tab ripple-container ${activeTab === tab.id ? 'active' : ''}`}
                onClick={(e) => { ripple(e); setActiveTab(tab.id) }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="plan-cards">
            {plans.map((plan) => (
              <div key={plan.id} className="reveal" data-delay={plan.id * 120}>
                <PlanCard
                  {...plan}
                  selected={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                  onRemove={() => setSelectedPlan(null)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── EXPERT ── */}
        <section className="expert-section reveal">
          <div className="expert-card">
            <div className="expert-avatar">👨‍🔧</div>
            <div className="expert-info">
              <div className="expert-name">Scott Travis</div>
              <div className="expert-role">Lead Mechanic</div>
              <p className="expert-bio">Scott personally reviews every claim, ensuring world-class warranty experience.</p>
            </div>
          </div>
        </section>

        {/* ── DISCLAIMER ── */}
        <div className="disclaimer">
          *All warranty plans subject to terms and conditions. Coverage excludes pre-existing conditions. See full terms at cars24.com.au/warranty-terms.
          <br/><br/>
          CARS24 Services Pty Ltd | ABN 98 621 301 005 | Australian Credit Licence 430428.
        </div>

        {/* ── FOOTER CTA ── */}
        <footer className="footer-cta">
          <div>
            <div className="footer-price">$36,786</div>
            <div className="footer-label">Drive away price</div>
          </div>
          <button className="btn-primary ripple-container" onClick={ripple}>
            Proceed
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
              <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </footer>
      </div>

      <ScrollProgressTracker/>
      <ParticleField/>
    </>
  )
}

// ── Scroll progress bar tracker ─────────────────────────────
function ScrollProgressTracker() {
  useEffect(() => {
    const bar = document.getElementById('scrollBar')
    if (!bar) return
    const onScroll = () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      bar.style.width = pct + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}

// ── Ambient particle field ──────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    const particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        color: ['#4736FE', '#7c5cfc', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas"/>
}

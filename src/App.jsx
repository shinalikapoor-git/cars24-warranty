import { useState, useEffect, useRef, useCallback } from 'react'

/* ============================================================
   CARS24 WARRANTY PAGE
   Brand: Cars24 | Design Source: Figma WARRANTY-2025
   Features: Antigravity cursor, parallax, magnetic buttons,
             scroll reveals, ripple effects, counter animations
   ============================================================ */

// ── Hooks ──────────────────────────────────────────────────

function useCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      if (dotRef.current) {
        dotRef.current.style.left = pos.current.x + 'px'
        dotRef.current.style.top = pos.current.y + 'px'
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px'
        ringRef.current.style.top = ring.current.y + 'px'
      }
      raf.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return { dotRef, ringRef }
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0
          setTimeout(() => entry.target.classList.add('visible'), Number(delay))
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  })
}

function useScrollProgress() {
  const barRef = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? (scrolled / total) * 100 : 0
      if (barRef.current) barRef.current.style.width = pct + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return barRef
}

function useParallax() {
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3
        el.style.transform = `translateY(${y * speed}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

function useMagnetic(ref, strength = 0.4) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`
    }

    const onLeave = () => {
      el.style.transform = 'translate(0,0) scale(1)'
      el.style.transition = 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mouseenter', () => { el.style.transition = 'transform 80ms linear' })

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])
}

function useCounter(target, duration = 1200, trigger = true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, trigger])
  return val
}

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

// ── Sub-components ──────────────────────────────────────────

function CarDiagram() {
  const labels = [
    { text: 'Electronics', style: { top: '8%', left: '14%' }, className: 'left' },
    { text: 'Steering', style: { top: '22%', left: '12%' }, className: 'left' },
    { text: 'Engine', style: { top: '38%', left: '10%' }, className: 'left' },
    { text: 'Gearbox', style: { top: '54%', left: '10%' }, className: 'left' },
    { text: 'Air conditioning', style: { top: '8%', right: '8%' } },
    { text: 'Fuel system', style: { top: '22%', right: '4%' } },
    { text: 'Transmission', style: { top: '62%', right: '4%' } },
    { text: 'Drivetrain', style: { top: '76%', right: '14%' } },
    { text: 'Driveshaft', style: { bottom: '8%', right: '20%' } },
    { text: 'Computers', style: { bottom: '8%', left: '16%' } },
    { text: 'Clutch', style: { bottom: '2%', left: '28%' } },
    { text: 'Brakes', style: { top: '56%', right: '14%' } },
  ]

  return (
    <div className="car-diagram" style={{ height: 200, position: 'relative' }}>
      {/* Car SVG */}
      <div data-parallax="-0.04" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        <svg width="160" height="80" viewBox="0 0 160 80" className="car-svg" aria-hidden="true">
          {/* Car body */}
          <rect x="8" y="38" width="144" height="30" rx="6" fill="#b8d4f0" />
          <path d="M 30 38 Q 38 18 58 16 L 102 16 Q 122 18 130 38 Z" fill="#9bbde0" />
          {/* Windows */}
          <path d="M 46 36 Q 50 22 62 20 L 98 20 Q 110 22 114 36 Z" fill="#ddeef8" opacity="0.8"/>
          <line x1="80" y1="20" x2="80" y2="36" stroke="#b8d4f0" strokeWidth="1.5"/>
          {/* Wheels */}
          <circle cx="38" cy="68" r="12" fill="#2d3748"/>
          <circle cx="38" cy="68" r="7" fill="#4a5568"/>
          <circle cx="38" cy="68" r="3" fill="#e2e8f0"/>
          <circle cx="122" cy="68" r="12" fill="#2d3748"/>
          <circle cx="122" cy="68" r="7" fill="#4a5568"/>
          <circle cx="122" cy="68" r="3" fill="#e2e8f0"/>
          {/* Headlights */}
          <rect x="145" y="42" width="8" height="6" rx="2" fill="#fef9c3"/>
          <rect x="7" y="42" width="8" height="6" rx="2" fill="#fef3c7" opacity="0.7"/>
          {/* Grille */}
          <rect x="148" y="50" width="6" height="3" rx="1" fill="#94a3b8"/>
          {/* CARS24 text */}
          <text x="80" y="30" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#4736FE" fontFamily="DM Sans, sans-serif">CARS24</text>
          {/* Antenna dots */}
          <circle cx="52" cy="40" r="2.5" fill="#4736FE" opacity="0.7"/>
          <circle cx="68" cy="42" r="2.5" fill="#4736FE" opacity="0.7"/>
          <circle cx="80" cy="42" r="2.5" fill="#4736FE" opacity="0.7"/>
          <circle cx="92" cy="42" r="2.5" fill="#4736FE" opacity="0.7"/>
          <circle cx="108" cy="40" r="2.5" fill="#4736FE" opacity="0.7"/>
        </svg>
      </div>

      {/* Labels */}
      {labels.map((l, i) => (
        <span
          key={i}
          className={`car-label${l.className ? ' ' + l.className : ''}`}
          style={{ ...l.style, animationDelay: `${i * 0.1}s` }}
        >
          {l.text}
        </span>
      ))}

      {/* Connector dots */}
      {[
        { top: '42%', left: '26%' }, { top: '52%', left: '38%' },
        { top: '48%', left: '50%' }, { top: '45%', left: '62%' },
        { top: '42%', left: '74%' },
      ].map((pos, i) => (
        <div key={i} className="car-dot" style={{ ...pos, animationDelay: `${i * 0.3}s` }} />
      ))}
    </div>
  )
}

function RiskGraph({ visible }) {
  const path1 = "M 10,80 Q 40,78 80,60 T 270,30"
  const path2 = "M 80,60 Q 120,50 160,25 T 270,10"

  return (
    <div className="risk-chart-area">
      <svg className="risk-svg" viewBox="0 0 280 90" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mfgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a0c4ff"/>
            <stop offset="100%" stopColor="#c4d9ff"/>
          </linearGradient>
          <linearGradient id="platGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4736FE"/>
            <stop offset="100%" stopColor="#7c5cfc"/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[20, 40, 60].map(y => (
          <line key={y} x1="10" y1={y} x2="270" y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4,4"/>
        ))}

        {/* Manufacturer warranty zone */}
        <path d={`M 10,80 Q 40,78 80,60 T 270,30 L 270,90 L 10,90 Z`}
          fill="url(#mfgGrad)" opacity="0.25"/>
        <path d={path1} fill="none" stroke="url(#mfgGrad)" strokeWidth="2"/>

        {/* Platinum cover extends */}
        <path d={`M 80,60 Q 120,50 160,25 T 270,10 L 270,90 L 80,90 Z`}
          fill="url(#platGrad)" opacity="0.12"/>
        <path d={path2} fill="none" stroke="url(#platGrad)" strokeWidth="2.5"
          strokeDasharray={visible ? '300' : '300'}
          strokeDashoffset={visible ? '0' : '300'}
          style={{ transition: 'stroke-dashoffset 1.5s ease 0.3s' }}/>

        {/* Vertical divider: end of mfg warranty */}
        <line x1="80" y1="10" x2="80" y2="85" stroke="#a0c4ff" strokeWidth="1" strokeDasharray="3,3"/>

        {/* Labels */}
        <text x="30" y="88" fontSize="7" fill="#64748b" fontFamily="DM Sans">Mfg warranty</text>
        <text x="90" y="88" fontSize="7" fill="#4736FE" fontFamily="DM Sans">Platinum cover</text>
        <text x="258" y="25" fontSize="6" fill="#ef4444" fontFamily="DM Sans" writingMode="vertical-lr">Risk</text>
      </svg>
    </div>
  )
}

function FeatureCard({ icon, stat, desc, delay = 0 }) {
  const ref = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 12
      const y = ((e.clientY - r.top) / r.height - 0.5) * 8
      el.style.transform = `translateX(${4 + x * 0.3}px) translateY(${-2 + y * 0.3}px) perspective(400px) rotateX(${-y * 0.5}deg) rotateY(${x * 0.5}deg)`
    }
    const onLeave = () => {
      el.style.transform = ''
      el.style.transition = 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mouseenter', () => { el.style.transition = 'transform 80ms linear' })
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="feature-card reveal" ref={ref} data-delay={delay} style={{ transformOrigin: 'center' }}>
      <div className="feature-card-text">
        <div className="feature-card-stat">{stat}</div>
        <div className="feature-card-desc">{desc}</div>
      </div>
      <div className="feature-card-visual">{icon}</div>
    </div>
  )
}

function PlanCard({ title, price, unit, months, validity, selected, onSelect, onRemove }) {
  const ripple = useRipple()
  return (
    <div
      className={`plan-card ripple-container ${selected ? 'selected' : ''}`}
      onClick={(e) => { ripple(e); onSelect() }}
    >
      <div className="plan-card-top">
        <div className="plan-radio">
          <div className="plan-radio-inner"/>
        </div>
        <div className="plan-card-info">
          <div className="plan-card-title">{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="plan-card-price">{price}</span>
            <span className="plan-card-price-unit">{unit}</span>
          </div>
          <div className="plan-card-validity">
            <span className="validity-badge">✓ Active</span>
            {validity}
          </div>
          {selected && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div className="plan-card-selected-badge">
                <span>✓</span> Added to plan
              </div>
              <button className="plan-remove" onClick={(e) => { e.stopPropagation(); onRemove() }}>
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────

export default function App() {
  const { dotRef, ringRef } = useCursor()
  const scrollBarRef = useScrollProgress()
  useScrollReveal()
  useParallax()

  const proceedRef = useRef(null)
  const skipRef = useRef(null)
  useMagnetic(proceedRef, 0.35)
  useMagnetic(skipRef, 0.25)

  const [activeTab, setActiveTab] = useState('loan')
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [statVisible, setStatVisible] = useState(false)
  const [graphVisible, setGraphVisible] = useState(false)
  const statsRef = useRef(null)
  const graphRef = useRef(null)
  const ripple = useRipple()

  const stat1 = useCounter(25000, 1400, statVisible)
  const stat2 = useCounter(2000, 1200, statVisible)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatVisible(true) },
      { threshold: 0.4 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setGraphVisible(true) },
      { threshold: 0.3 }
    )
    if (graphRef.current) obs.observe(graphRef.current)
    return () => obs.disconnect()
  }, [])

  const plans = [
    { id: 0, title: 'Up to 12 months cover', price: '$38', unit: '/week', months: 12, validity: 'Warranty & RSA till Oct 2025' },
    { id: 1, title: 'Up to 12 months cover', price: '$38', unit: '/week', months: 12, validity: 'Warranty & RSA till Oct 2026', premium: true },
  ]

  return (
    <>
      {/* Cursor */}
      <div className="cursor-dot" ref={dotRef}/>
      <div className="cursor-ring" ref={ringRef}/>

      {/* Scroll progress bar */}
      <div className="scroll-progress" ref={scrollBarRef}/>

      <div className="app-shell" data-brand="cars24">

        {/* ── HEADER ── */}
        <header className="header" style={{ animation: 'floatUp 500ms ease both' }}>
          <div className="header-bar">
            <button className="back-btn" aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="#4736FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div>
              <div className="header-car-name">2016 Landrover Rangerover</div>
              <div className="header-car-year">Vehicle warranty options</div>
            </div>
          </div>

          {/* Progress stepper */}
          <div className="stepper">
            <div className="stepper-pills">
              {[
                { label: 'CARS24 Cover', state: 'active' },
                { label: 'Payment options', state: 'inactive' },
                { label: 'Checkout', state: 'inactive' },
              ].map((s, i) => (
                <div key={i} className={`stepper-pill ${s.state}`}>
                  {s.state === 'active' && <div className="stepper-dot"/>}
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* DAP */}
          <div className="dap-bar">
            <span className="dap-label">Drive away price</span>
            <span className="dap-price">$51,487</span>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="hero" style={{ animation: 'floatUp 600ms ease 100ms both' }}>
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-eyebrow">Extend your warranty</div>
              <div className="hero-title">
                <span className="brand-blue">CARS24</span><br/>
                Platinum cover
              </div>
              <div className="hero-subtitle">
                Save big on unexpected repair costs with ultimate protection.
              </div>
            </div>

            <div className="stamp-badge" data-parallax="-0.06">
              <div className="stamp-inner">
                <div className="stamp-upto">Upto</div>
                <div className="stamp-months">36</div>
                <div style={{ fontSize: 10, color: 'white', fontWeight: 700, transform: 'rotate(-15deg)', lineHeight: 1 }}>months</div>
                <div className="stamp-protection">Protection</div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-gap"/>

        {/* ── COVERAGE CARD ── */}
        <div className="reveal" data-delay="100">
          <div className="coverage-card">
            <div className="coverage-header">
              <div className="coverage-header-title">Manufacturer level coverage</div>
              <div className="coverage-header-sub">
                Over <span className="highlight">5000</span> parts & labour cost covered
              </div>
            </div>

            <div className="coverage-diagram">
              <CarDiagram/>
            </div>

            <div
              className="coverage-footer ripple-container"
              onClick={ripple}
              role="button"
              tabIndex={0}
            >
              <span className="coverage-footer-text">See what's covered</span>
              <div className="coverage-footer-arrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6h6M7 4l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="section-gap"/>

        {/* ── SOCIAL PROOF ── */}
        <section className="social-proof">
          <div className="reveal">
            <div className="section-title">The best in Australia.</div>
            <div className="section-subtitle">Choice of 5,000+ users.</div>
          </div>

          <div className="feature-cards">
            <FeatureCard
              icon="✅"
              stat="99% approval rate*"
              desc="We honour all genuine claims."
              delay={100}
            />
            <FeatureCard
              icon="🚗"
              stat="Warranty with no km limit*"
              desc="Drive as much as you please."
              delay={200}
            />
            <FeatureCard
              icon="♾️"
              stat="No claim limit"
              desc="Claim upto the value of the car."
              delay={300}
            />
          </div>

          <div
            className="why-best-link reveal"
            data-delay="400"
            role="button"
            tabIndex={0}
          >
            Why we're the best in the market?
            <div className="why-best-arrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 6h6M7 4l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        <div className="section-gap"/>

        {/* ── DID YOU KNOW ── */}
        <div className="did-you-know reveal" data-delay="0">
          <div className="dyk-text">
            <div className="dyk-title">Did you know?</div>
            <div className="dyk-body">
              Engine repairs cost upwards of{' '}
              <span className="highlight">$10,000</span>
              {' '}in Australia. Get years of protection for a fraction of the cost with an extended warranty.
            </div>
          </div>
          <div className="dyk-visual" data-parallax="-0.05">🚗</div>
        </div>

        <div className="section-gap"/>

        {/* ── WARRANTY STATUS ── */}
        <section className="warranty-status" ref={graphRef}>
          <div className="reveal">
            <div className="warranty-status-title">Your Landrover Rangerover's manufacturer warranty is active till 23 Aug 2026.</div>
            <div className="warranty-status-sub">Stay protected with CARS24 Platinum cover.</div>
          </div>

          <div className="risk-graph reveal" data-delay="150">
            <div className="risk-graph-header">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lego-color-text-primary)' }}>
                Breakdown risk over time
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="risk-legend">
                  <div className="risk-legend-dot mfg"/>Mfg warranty
                </div>
                <div className="risk-legend">
                  <div className="risk-legend-dot platinum"/>Platinum
                </div>
              </div>
            </div>

            <RiskGraph visible={graphVisible}/>

            <div className="risk-chart-labels">
              <span>Today</span>
              <span>12 months</span>
              <span>24 months</span>
              <span>36 months</span>
            </div>
          </div>
        </section>

        <div className="section-gap"/>

        {/* ── PLAN SELECTION ── */}
        <div className="plan-tabs">
          <div className="plan-tabs-inner">
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
          <div className="plan-tab-note">
            Price of plan will be added to your {activeTab === 'loan' ? 'loan repayments' : 'upfront payment'}.
          </div>
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

        <div className="section-gap"/>

        {/* ── STATS ── */}
        <div ref={statsRef}>
          <div className="stats-section reveal">
            <div className="stat-item">
              <div className="stat-value">
                ${stat1.toLocaleString()}
              </div>
              <div className="stat-label">Total repair cost paid out for Toyota Corolla.</div>
            </div>
            <div className="stat-divider"/>
            <div className="stat-item">
              <div className="stat-value">{stat2.toLocaleString()}+</div>
              <div className="stat-label">Total claims processed by CARS24</div>
            </div>
          </div>
          <div className="stat-source">(Source: 2022–2024 CARS24 claim approvals)</div>
        </div>

        <div className="section-gap"/>

        {/* ── EXPERT CARD ── */}
        <div className="expert-card reveal" data-delay="100">
          <div className="expert-card-inner">
            <div className="expert-avatar">👨‍🔧</div>
            <div className="expert-info">
              <div className="expert-name">Scott Travis</div>
              <div className="expert-role">Lead mechanic</div>
              <div className="expert-bio">
                Scott personally reviews every claim, ensuring his team completes all necessary repairs for a world-class warranty experience.
              </div>
            </div>
          </div>
          <div className="expert-card-cta">
            <button
              ref={skipRef}
              className="btn-secondary ripple-container"
              onClick={ripple}
            >
              Skip, I don't want to protect my car
            </button>
          </div>
        </div>

        <div className="section-gap"/>

        {/* ── DISCLAIMER ── */}
        <div className="disclaimer reveal">
          <div style={{ marginBottom: 8 }}>
            *Lorem ipsum: Disclaimer for value props. All warranty plans are subject to terms and conditions. Coverage excludes pre-existing conditions. See full terms at cars24.com.au/warranty-terms.
          </div>
          <div>
            CARS24 Services Pty Ltd | ABN 98 621 301 005 | Australian Credit Licence 430428. All financial products are subject to credit assessment, eligibility criteria, fees and charges apply.
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <footer className="footer-cta">
          <div className="footer-cta-price">
            <div className="footer-cta-amount">$36,786</div>
            <div className="footer-cta-label">Drive away price</div>
          </div>
          <button
            ref={proceedRef}
            className="btn-primary ripple-container"
            onClick={ripple}
          >
            Proceed →
          </button>
        </footer>

      </div>

      {/* Floating particles on click */}
      <ParticleSystem/>
    </>
  )
}

// ── Particle System ─────────────────────────────────────────

function ParticleSystem() {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const raf = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onClick = (e) => {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const speed = 1.5 + Math.random() * 3
        particles.current.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          decay: 0.025 + Math.random() * 0.02,
          size: 3 + Math.random() * 4,
          color: ['#4736FE', '#7c5cfc', '#a78bfa', '#2ea12f'][Math.floor(Math.random() * 4)],
        })
      }
    }
    window.addEventListener('click', onClick)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter(p => p.life > 0)
      particles.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.vx *= 0.97
        p.life -= p.decay
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      raf.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas"/>
}

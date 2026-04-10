import { useState, useEffect, useRef, useCallback } from 'react'
import Car3D from './Car3D'

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const delay = Number(entry.target.dataset.delay || 0)
          setTimeout(() => entry.target.classList.add('visible'), delay)
          obs.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function useCounter(target, duration = 1200, trigger = true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, trigger])
  return val
}

function useRipple() {
  return useCallback((e) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = `${e.clientX - rect.left}px`
    ripple.style.top = `${e.clientY - rect.top}px`
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }, [])
}

const coverageItems = [
  { title: 'Engine', desc: 'Complete engine block, pistons, timing chain and head gasket', partIndex: 0, stat: '$12,000+' },
  { title: 'Transmission', desc: 'Gearbox, torque converter and shift control components', partIndex: 1, stat: '$8,500+' },
  { title: 'Electronics & Computing', desc: 'ECU, control modules, wiring harness and sensors', partIndex: 2, stat: '$4,200+' },
  { title: 'Braking System', desc: 'ABS unit, calipers, master cylinder and brake booster', partIndex: 3, stat: '$3,800+' },
  { title: 'Air Conditioning', desc: 'Compressor, condenser, evaporator and expansion valve', partIndex: 5, stat: '$2,500+' },
  { title: 'Steering System', desc: 'Power steering pump, rack and tie rod assemblies', partIndex: 6, stat: '$3,200+' },
  { title: 'Drivetrain', desc: 'Driveshaft, CV joints, differential and transfer case', partIndex: 7, stat: '$5,600+' },
]

function PlanCard({ title, price, unit, validity, selected, onSelect, onRemove }) {
  const ripple = useRipple()
  return (
    <div className={`plan-card ripple-container ${selected ? 'selected' : ''}`} onClick={(e) => { ripple(e); onSelect() }}>
      <div className="plan-card-top">
        <div className="plan-radio"><div className="plan-radio-inner" /></div>
        <div className="plan-card-info">
          <div className="plan-card-title">{title}</div>
          <div className="plan-price-line"><span className="plan-card-price">{price}</span><span className="plan-card-price-unit">{unit}</span></div>
          <div className="plan-card-validity"><span className="validity-badge">✓ Active</span>{validity}</div>
          {selected && (
            <div className="plan-selected-row">
              <div className="plan-card-selected-badge">✓ Added to plan</div>
              <button className="plan-remove" onClick={(e) => { e.stopPropagation(); onRemove() }}>Remove</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  useScrollReveal()

  const [activePart, setActivePart] = useState(0)
  const [activeTab, setActiveTab] = useState('loan')
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const coverageRefs = useRef([])
  const ripple = useRipple()

  const stat1 = useCounter(25000, 1300, statsVisible)
  const stat2 = useCounter(2000, 1200, statsVisible)

  useEffect(() => {
    const bar = document.getElementById('scrollBar')
    const onScroll = () => {
      if (!bar) return
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0
      bar.style.width = `${pct}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true)
    }, { threshold: 0.35 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const nodes = coverageRefs.current.filter(Boolean)
    if (!nodes.length) return

    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (!visible.length) return
      const idx = Number(visible[0].target.getAttribute('data-index'))
      if (!Number.isNaN(idx)) setActivePart(idx)
    }, {
      threshold: [0.35, 0.55, 0.75],
      rootMargin: '-18% 0px -22% 0px',
    })

    nodes.forEach((n) => obs.observe(n))
    return () => obs.disconnect()
  }, [])

  const plans = [
    { id: 0, title: 'Up to 12 months cover', price: '$38', unit: '/week', validity: 'Warranty & RSA till Oct 2025' },
    { id: 1, title: 'Up to 12 months cover', price: '$38', unit: '/week', validity: 'Warranty & RSA till Oct 2026' },
  ]

  return (
    <>
      <div className="scroll-progress-track"><div className="scroll-progress-bar" id="scrollBar" /></div>

      <div className="app-shell">
        <header className="header">
          <div className="header-row">
            <div>
              <h1>2016 Range Rover Sport</h1>
              <p>Vehicle warranty options</p>
            </div>
            <div className="stepper">
              <span className="step active">CARS24 Cover</span>
              <span className="step">Payment</span>
              <span className="step">Checkout</span>
            </div>
          </div>
        </header>

        <section className="hero reveal">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Extend your warranty</p>
              <h2>CARS24 Platinum cover</h2>
              <p className="hero-copy">Save big on unexpected repair costs with manufacturer-level protection on over 5,000 parts.</p>
              <div className="hero-badges">
                <span>Up to 36 months</span>
                <span>No km limit</span>
                <span>No claim limit</span>
              </div>
            </div>
            <div className="hero-card">
              <Car3D activePartIndex={coverageItems[activePart].partIndex} />
              <p>Live part highlight changes as you scroll the coverage list.</p>
            </div>
          </div>
        </section>

        <section className="coverage-section">
          <div className="container coverage-layout">
            <aside className="coverage-sticky reveal">
              <h3>What your plan covers</h3>
              <Car3D activePartIndex={coverageItems[activePart].partIndex} />
              <div className="active-coverage-card">
                <div className="active-title">{coverageItems[activePart].title}</div>
                <div className="active-desc">{coverageItems[activePart].desc}</div>
                <div className="active-stat">{coverageItems[activePart].stat} average repair cost</div>
              </div>
            </aside>

            <div className="coverage-list">
              {coverageItems.map((item, i) => (
                <article
                  key={item.title}
                  className={`coverage-item reveal ${activePart === i ? 'active' : ''}`}
                  data-index={i}
                  ref={(el) => { coverageRefs.current[i] = el }}
                >
                  <div className="coverage-index">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <span>{item.stat} average repair cost</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-section">
          <div className="container">
            <h3 className="reveal">The best in Australia. Choice of 5,000+ users.</h3>
            <div className="proof-cards">
              <div className="proof-card reveal" data-delay="80"><strong>99% approval rate</strong><p>We honour all genuine claims.</p></div>
              <div className="proof-card reveal" data-delay="140"><strong>Warranty with no km limit</strong><p>Drive as much as you please.</p></div>
              <div className="proof-card reveal" data-delay="200"><strong>No claim limit</strong><p>Claim up to the value of the car.</p></div>
            </div>
          </div>
        </section>

        <section className="did-you-know reveal">
          <div className="container">
            <h3>Did you know?</h3>
            <p>Engine repairs cost upwards of <strong>$10,000</strong> in Australia. Get years of protection for a fraction of the cost.</p>
          </div>
        </section>

        <section className="stats-section container reveal" ref={statsRef}>
          <div className="stat">
            <div className="value">${stat1.toLocaleString()}</div>
            <div className="label">Total repair cost paid out for similar SUVs</div>
          </div>
          <div className="divider" />
          <div className="stat">
            <div className="value">{stat2.toLocaleString()}+</div>
            <div className="label">Total claims processed by CARS24</div>
          </div>
        </section>

        <section className="plan-section">
          <div className="container">
            <h3 className="reveal">Choose your plan</h3>
            <div className="plan-tabs reveal">
              <button className={`plan-tab ripple-container ${activeTab === 'loan' ? 'active' : ''}`} onClick={(e) => { ripple(e); setActiveTab('loan') }}>Add to loan</button>
              <button className={`plan-tab ripple-container ${activeTab === 'outright' ? 'active' : ''}`} onClick={(e) => { ripple(e); setActiveTab('outright') }}>Pay outright</button>
            </div>
            <div className="plan-cards">
              {plans.map((plan, i) => (
                <div key={plan.id} className="reveal" data-delay={i * 100}>
                  <PlanCard {...plan} selected={selectedPlan === plan.id} onSelect={() => setSelectedPlan(plan.id)} onRemove={() => setSelectedPlan(null)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="footer-cta">
          <div className="container footer-inner">
            <div><div className="footer-price">$36,786</div><div className="footer-label">Drive away price</div></div>
            <button className="btn-primary ripple-container" onClick={ripple}>Proceed</button>
          </div>
        </footer>
      </div>
    </>
  )
}

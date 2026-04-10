import React, { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Car3DCanvas from './Car3DCanvas'

// Data
const coverageItems = [
  { title: 'Engine', desc: 'Complete engine block, pistons, timing chain and head gasket', stat: '$12,000+' },
  { title: 'Transmission', desc: 'Gearbox, torque converter and shift control components', stat: '$8,500+' },
  { title: 'Electronics & Computing', desc: 'ECU, control modules, wiring harness and sensors', stat: '$4,200+' },
  { title: 'Braking System', desc: 'ABS unit, calipers, master cylinder and brake booster', stat: '$3,800+' },
  { title: 'Air Conditioning', desc: 'Compressor, condenser, evaporator and expansion valve', stat: '$2,500+' },
  { title: 'Steering System', desc: 'Power steering pump, rack and tie rod assemblies', stat: '$3,200+' },
  { title: 'Drivetrain', desc: 'Driveshaft, CV joints, differential and transfer case', stat: '$5,600+' },
]

const plans = [
  { id: 0, title: 'Upto 12 months cover', price: '$38', unit: '/week', validity: 'Warranty & RSA till Oct 2024', features: ['1 car service'], popular: false },
  { id: 1, title: 'Upto 24 months cover', price: '$45', unit: '/week', validity: 'Warranty & RSA till Oct 2025', features: ['2 car services'], popular: false },
  { id: 2, title: 'Upto 36 months cover', price: '$52', unit: '/week', validity: 'Warranty & RSA till Oct 2026', features: ['3 car services'], popular: true },
]

const FadeSection = ({ children, className, onViewportEnter }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ margin: "-20% 0px -20% 0px", amount: 0.4 }}
    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    onViewportEnter={onViewportEnter}
  >
    {children}
  </motion.div>
)

export default function App() {
  const { scrollYProgress } = useScroll()
  const [activePart, setActivePart] = useState(0)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [activeLayoutTab, setActiveLayoutTab] = useState('loan')

  return (
    <div className="apple-layout">
      {/* Interactive 3D Background */}
      <div className="cinematic-background">
        <Car3DCanvas scrollYProgress={scrollYProgress} activePart={activePart} />
        <div className="vignette-overlay"></div>
      </div>

      <div className="scroll-content">
        
        {/* Header Overlay */}
        <header className="blur-header">
          <div className="header-inner">
            <span className="brand-logo">CARS24 <span className="light">Platinum</span></span>
            <div className="header-links">
              <span>Overview</span>
              <span className="active">Coverage</span>
              <span>Pricing</span>
            </div>
          </div>
        </header>

        {/* Hero Area */}
        <section className="scene hero-scene">
          <motion.div className="hero-layout" style={{ opacity: heroOpacity }}>
            <motion.h1 
              className="epic-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              Absolute protection.<br />Beautifully simple.
            </motion.h1>
            <motion.p 
              className="epic-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              Stay protected and ensure regular maintenance with CARS24 Platinum cover.
            </motion.p>
          </motion.div>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </section>

        {/* The Journey through the components */}
        <div className="coverage-journey">
          {coverageItems.map((item, i) => (
            <section key={i} className="scene component-scene">
              <FadeSection 
                className={`part-card glassmorphism ${i % 2 !== 0 ? 'align-right' : 'align-left'}`}
                onViewportEnter={() => setActivePart(i)}
              >
                <div className="part-eyebrow">System 0{i + 1}</div>
                <h2 className="part-title">{item.title}</h2>
                <p className="part-desc">{item.desc}</p>
                <div className="part-stat-line">
                  <strong>{item.stat}</strong>
                  <span>avg. repair covered</span>
                </div>
              </FadeSection>
            </section>
          ))}
        </div>

        {/* Comprehensive Service Checks */}
        <section className="scene service-scene">
          <FadeSection className="service-card glassmorphism">
            <h2>Comprehensive service checks</h2>
            <div className="service-icons">
              <div className="service-icon-box">
                <span className="icon">👨‍🔧</span>
                <p>Engine oil filter replacement</p>
              </div>
              <div className="service-icon-box">
                <span className="icon">📋</span>
                <p>Full vehicle inspection</p>
              </div>
              <div className="service-icon-box">
                <span className="icon">🔋</span>
                <p>Test battery condition</p>
                <span className="badge">& much more</span>
              </div>
            </div>
            <ul className="service-checklist">
              <li>✓ CARS24 servicing maintains warranty integrity.*</li>
              <li>✓ Handled by expert mechanics.</li>
            </ul>
            <a href="#" className="link-more">More about CARS24 Servicing &rarr;</a>
          </FadeSection>
        </section>

        {/* Did You Know / Proof transition */}
        <section className="scene proof-scene">
          <FadeSection className="proof-grid glassmorphism">
            <h2 className="did-you-know-title">Did you know?</h2>
            <p className="did-you-know-text">Engine repairs cost upwards of <strong style={{color: '#ff9f0a'}}>$10,000</strong> in Australia. Get years of protection for a fraction of the cost with an extended warranty.</p>
            <div className="proof-stats-row">
              <div className="proof-stat">
                <span className="huge-number">99%+</span>
                <span className="huge-label">claim approval rate. The best in Australia.</span>
              </div>
              <div className="proof-stat">
                <span className="huge-number">∞</span>
                <span className="huge-label">Unlimited claims. No Km limit warranty.</span>
              </div>
            </div>
            <a href="#" className="link-more">More about CARS24 warranty &rarr;</a>
          </FadeSection>
        </section>

        {/* Final Selection / Pay */}
        <section className="scene checkout-scene">
          <FadeSection className="checkout-card glassmorphism">
            <div className="checkout-header">
              <h2>Choose your plan</h2>
              <p>Your Landrover Rangerover's manufacturer warranty is active till <strong>23 Aug 2026</strong>. Stay protected and ensure regular maintenance with CARS24 Platinum cover.</p>
            </div>
            
            {/* Chart mock */}
            <div className="chart-mock">
              <div className="chart-line">
                 <div className="chart-blue-box" />
              </div>
              <div className="chart-labels">
                <span>Today</span>
                <span>12 months</span>
                <span>24 months</span>
                <span>36 months</span>
              </div>
            </div>

            <ul className="service-checklist">
              <li><span style={{color:'#2997ff'}}>✓</span> FREE Roadside assistance(RSA) with all plans</li>
              <li><span style={{color:'#2997ff'}}>✓</span> CARS24 servicing upholds warranty integrity.</li>
            </ul>
            
            <div className="plan-tabs-container">
              <div className="plan-tabs">
                <button className={activeLayoutTab === 'loan' ? 'active' : ''} onClick={()=>setActiveLayoutTab('loan')}>Add to loan</button>
                <button className={activeLayoutTab === 'outright' ? 'active' : ''} onClick={()=>setActiveLayoutTab('outright')}>Pay outright</button>
              </div>
            </div>
            <p className="tab-subtext">Price of plan will be added to your loan repayments.</p>

            <div className="plan-options">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`plan-item ${selectedPlan === plan.id ? 'active' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <div className="best-value-badge">Best value</div>}
                  
                  <div className="plan-radio-col">
                    <div className="plan-radio">
                      <div className="radio-inner" />
                    </div>
                  </div>

                  <div className="plan-details">
                    <h3>{plan.title}</h3>
                    <div className="price-val">{plan.price}<span className="price-unit">{plan.unit}</span></div>
                    <ul className="plan-features">
                      <li>• {plan.validity}</li>
                      {plan.features.map(f => <li key={f}>• {f}</li>)}
                    </ul>
                  </div>

                  {selectedPlan === plan.id && (
                     <div className="plan-action-col">
                        <button className="remove-btn" onClick={(e) => { e.stopPropagation(); setSelectedPlan(null) }}>Remove</button>
                     </div>
                  )}
                </div>
              ))}
            </div>

            <div className="checkout-footer">
              <div className="total-display">
                <span className="drive-away-label">Drive away price</span>
                <span className="drive-away-val">$36,786</span>
              </div>
              <button className="apple-btn">Add Cover</button>
            </div>
            <p className="customize-text"><strong>Want to customize your cover?</strong><br />Choose the terms that work the best for you.</p>
          </FadeSection>
        </section>
        
        {/* Footer */}
        <footer className="apple-footer">
          <p>Copyright © 2026 CARS24 Australia. All rights reserved.</p>
        </footer>

      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

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
  { id: 0, title: 'Up to 12 months cover', price: '$38', unit: '/week', validity: 'Warranty & RSA till Oct 2025' },
  { id: 1, title: 'Up to 36 months cover', price: '$65', unit: '/week', validity: 'Warranty & RSA till Oct 2027' },
]

const FadeSection = ({ children, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ margin: "-10% 0px -20% 0px" }}
    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
)

export default function App() {
  const { scrollYProgress } = useScroll()
  
  // Cinematic transforms driven by scroll position
  const carScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const carY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const carOpacity = useTransform(scrollYProgress, [0.8, 0.95], [1, 0.1])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  const [selectedPlan, setSelectedPlan] = useState(1)

  return (
    <div className="apple-layout">
      {/* Sticky Cinematic Background */}
      <div className="cinematic-background">
        <motion.div 
          className="car-image-wrapper"
          style={{ scale: carScale, y: carY, opacity: carOpacity }}
        >
          <img src="/range-rover.png" alt="Range Rover Sport" className="car-image" />
        </motion.div>
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
              CARS24 Platinum extends your manufacturer-level coverage.
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
              <FadeSection className={`part-card glassmorphism ${i % 2 !== 0 ? 'align-right' : 'align-left'}`}>
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

        {/* Proof transition */}
        <section className="scene proof-scene">
          <FadeSection className="proof-grid">
            <div className="proof-stat">
              <span className="huge-number">99%</span>
              <span className="huge-label">Approval rate on genuine claims</span>
            </div>
            <div className="proof-stat">
              <span className="huge-number">∞</span>
              <span className="huge-label">No kilometer limit restrictions</span>
            </div>
            <div className="proof-stat">
              <span className="huge-number">2k+</span>
              <span className="huge-label">Platinum claims smoothly processed</span>
            </div>
          </FadeSection>
        </section>

        {/* Final Selection / Pay */}
        <section className="scene checkout-scene">
          <FadeSection className="checkout-card glassmorphism">
            <div className="checkout-header">
              <h2>Select your coverage</h2>
              <p>Opt for the ultimate peace of mind.</p>
            </div>
            
            <div className="plan-options">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`plan-item ${selectedPlan === plan.id ? 'active' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="plan-radio">
                    <div className="radio-inner" />
                  </div>
                  <div className="plan-details">
                    <h3>{plan.title}</h3>
                    <span className="plan-validity">{plan.validity}</span>
                  </div>
                  <div className="plan-price">
                    <span className="price-val">{plan.price}</span>
                    <span className="price-unit">{plan.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-footer">
              <div className="total-display">
                <span className="drive-away-label">Drive away price</span>
                <span className="drive-away-val">$36,786</span>
              </div>
              <button className="apple-btn">Continue to Payment</button>
            </div>
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

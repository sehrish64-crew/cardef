'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Sparkles, Zap, Crown, Shield, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCountry } from '@/contexts/CountryContext'
import { useTranslations } from '@/lib/translations'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import GetReportForm from '@/components/GetReportForm'
import { PRICING_MAP, CURRENCY_SYMBOLS, formatCurrency } from '@/lib/prices'

const PRIMARY = "#780000"
const SECONDARY = "#1a3a6e"

const basePricingPlans = [
  {
    name: 'Basic',
    badge: 'MOST POPULAR',
    priceKey: 'basic' as const,
    icon: Zap,
    popular: true,
    checkoutUrl: 'https://checkout.freemius.com/product/30450/plan/50029/',
    features: [
      'Accident Records',
      'Theft Records',
      'Salvage Records',
      'Open Recalls',
      'Lease Records',
    ],
    buttonText: 'Buy Basic',
  },
  {
    name: 'Standard',
    badge: 'COMPREHENSIVE',
    priceKey: 'standard' as const,
    icon: Sparkles,
    popular: false,
    checkoutUrl: 'https://checkout.freemius.com/product/30562/plan/50188/',
    features: [
      'Accident Records',
      'Theft Records',
      'Salvage Records',
      'Open Recalls',
      'Odometer Readings',
      'Loan Details',
      'Market Value',
    ],
    buttonText: 'Buy Standard',
  },
  {
    name: 'Premium',
    badge: 'BEST VALUE',
    priceKey: 'premium' as const,
    icon: Crown,
    popular: false,
    checkoutUrl: 'https://checkout.freemius.com/product/30563/plan/50189/',
    features: [
      'All Premium Features',
      'Accident Records',
      'Theft Records',
      'Salvage Records',
      'Open Recalls',
      'Odometer Readings',
      'Loan Details',
      'Market Value',
      'Specifications',
    ],
    buttonText: 'Buy Premium',
  },
]

export default function PricingClient() {
  const { selectedCountry } = useCountry()
  const { t } = useTranslations()
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const sectionRef = useRef<HTMLDivElement>(null)

  const currencySymbol = CURRENCY_SYMBOLS[selectedCountry.currency] || '$'
  const pricing = PRICING_MAP[selectedCountry.currency] || PRICING_MAP['USD']

  const pricingPlans = basePricingPlans.map(plan => ({
    ...plan,
    price: formatCurrency(pricing[plan.priceKey], selectedCountry.currency, `${selectedCountry.language}-${selectedCountry.code}`),
    currency: currencySymbol,
  }))

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  const handleSelectPlan = (planKey: string) => {
    setSelectedPlan(planKey)
    setIsFormOpen(true)
  }

  return (
    <>
      <div
        ref={sectionRef}
        className="relative min-h-screen font-sans overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ambient glows */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #780000 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1a4a8a 0%, transparent 70%)' }}
        />

        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 md:py-28 max-w-7xl">

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase mb-6"
              style={{ borderColor: 'rgba(120,0,0,0.5)', background: 'rgba(120,0,0,0.12)', color: '#f87171' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simple & Transparent Pricing
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight text-white">
              Choose Your Plan
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(186,220,255,0.6)' }}>
              Get instant vehicle history reports with trusted data sources and secure checkout.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-14">

            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative rounded-2xl border transition-all duration-300 overflow-hidden
                ${hoveredPlan === i ? 'scale-105 shadow-2xl' : 'shadow-lg'}
                ${plan.popular ? 'md:scale-105' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `2px solid ${plan.popular ? 'rgba(42,90,170,0.6)' : 'rgba(120,0,0,0.3)'}`,
                  backdropFilter: 'blur(20px)',
                }}
              >

                {/* Badge */}
                {plan.badge && (
                  <div
                    className={`absolute top-0 left-0 px-4 py-1.5 text-xs font-bold text-white`}
                    style={{
                      background: plan.popular
                        ? 'linear-gradient(135deg, #2a5aaa, #1a3a6e)'
                        : 'linear-gradient(135deg, #780000, #9b1111)'
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="p-5 sm:p-7 text-center">

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl flex items-center justify-center mb-5`}
                    style={{
                      background: plan.popular
                        ? 'rgba(42,90,170,0.15)'
                        : 'rgba(120,0,0,0.15)'
                    }}
                  >
                    <plan.icon
                      className="w-6 h-6 sm:w-8 sm:h-8"
                      style={{
                        color: plan.popular ? '#60a5fa' : '#f87171'
                      }}
                    />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white">{plan.name}</h3>

                  <div className="mt-5">
                    <span className="text-xl sm:text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{plan.currency}</span>
                    <span className="text-5xl sm:text-6xl font-black text-white ml-1">{plan.price}</span>
                  </div>

                  <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>One-time payment</p>

                  {/* Features */}
                  <div className="mt-7 space-y-2 text-left mb-8">
                    {plan.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: plan.popular
                              ? 'rgba(42,90,170,0.2)'
                              : 'rgba(120,0,0,0.2)'
                          }}
                        >
                          <Check
                            className="w-3.5 h-3.5"
                            style={{
                              color: plan.popular ? '#60a5fa' : '#f87171'
                            }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.priceKey)}
                    className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200`}
                    style={{
                      background: plan.popular
                        ? 'linear-gradient(135deg, #2a5aaa, #1a3a6e)'
                        : 'linear-gradient(135deg, #780000, #9b1111)',
                      color: '#fff',
                      boxShadow: plan.popular
                        ? '0 8px 30px rgba(42,90,170,0.4)'
                        : '0 8px 30px rgba(120,0,0,0.4)'
                    }}
                  >
                    {plan.buttonText}
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              </div>
            ))}

          </div>

          {/* Features comparison note */}
          <div
            className="rounded-2xl p-8 text-center max-w-2xl mx-auto"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="space-y-3">
              {/* <p className="text-white font-semibold">Why Choose Premium?</p> */}
              <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm flex justify-center items-start gap-2">
                ✔ One-time payment only — no subscriptions<br />

                ✔ Bank-level encryption & secure checkout <br />
                ✔ 14-day money-back guarantee<br />
                ✔ Instant digital delivery

              </p>
            </div>
          </div>

        </div>
      </div>

      <GetReportForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        preselectedPackage={selectedPlan}
      />
    </>
  )
}
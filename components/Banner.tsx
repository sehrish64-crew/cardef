"use client"

import { useState, useEffect } from 'react'
import { Car, Truck, Bus, Ship, Bike, CheckCircle2, Key, Hash, ChevronRight, Shield, Clock, Star } from 'lucide-react'
import GetReportForm from './GetReportForm'
import { useTranslations } from '@/lib/translations'

export default function Banner() {
  const [tab, setTab] = useState<'vin' | 'plate'>('vin')
  const [vin, setVin] = useState('')
  const [plate, setPlate] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium' | ''>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const { t } = useTranslations()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const value = tab === 'vin' ? vin : plate
  const canSubmit = isHydrated && value.trim().length > 0

  const handleSubmit = () => {
    if (!value.trim()) return
    setIsFormOpen(true)
  }

  const checks = [
    t('banner_checks_damage'),
    t('banner_checks_market_value'),
    t('banner_checks_mileage'),
    t('banner_checks_more'),
    t('banner_checks_specs'),
    t('banner_checks_title_check'),
    t('banner_checks_safety_ratings'),
    t('banner_checks_natural_disaster'),
  ]

  return (
    <section
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
        {/* Top badge */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase"
            style={{ borderColor: 'rgba(120,0,0,0.5)', background: 'rgba(120,0,0,0.12)', color: '#f87171' }}
          >
            <Shield className="w-3.5 h-3.5" />
            Trusted by 2M+ buyers worldwide
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left column ── */}
          <div className="space-y-8 sm:space-y-10">
            {/* Headline */}
            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight text-white">
                {t('banner_title')}
              </h1>
              <p className="text-base sm:text-lg leading-relaxed max-w-md" style={{ color: 'rgba(186,220,255,0.6)' }}>
                {t('banner_subtitle')}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 sm:gap-8">
              {[
                { val: '50+', label: 'Data Sources' },
                { val: '2M+', label: 'Reports Generated' },
                { val: '99%', label: 'Accuracy Rate' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl sm:text-2xl font-black text-white">{s.val}</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: 'rgba(147,197,253,0.5)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Input card */}
            <div
              className="rounded-2xl p-[1.5px]"
              style={{
                background: 'linear-gradient(135deg, rgba(120,0,0,0.4) 0%, rgba(20,50,100,0.4) 100%)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="rounded-[14px] p-5 sm:p-6 space-y-4 sm:space-y-5"
                style={{ background: 'rgba(6,12,24,0.9)', backdropFilter: 'blur(20px)' }}
              >
                {/* VIN / Plate tabs */}
                <div className="flex gap-2" suppressHydrationWarning>
                  <button
                    type="button"
                    onClick={() => setTab('vin')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={
                      isHydrated && tab === 'vin'
                        ? { background: 'linear-gradient(135deg, #780000, #9b1111)', color: '#fff', boxShadow: '0 4px 16px rgba(120,0,0,0.4)' }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.35)' }
                    }
                    suppressHydrationWarning
                  >
                    <Key className="w-4 h-4" />
                    By VIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('plate')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={
                      isHydrated && tab === 'plate'
                        ? { background: 'linear-gradient(135deg, #1a3a6e, #2a5aaa)', color: '#fff', boxShadow: '0 4px 16px rgba(42,90,170,0.4)' }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.35)' }
                    }
                    suppressHydrationWarning
                  >
                    <Hash className="w-4 h-4" />
                    By Plate
                  </button>
                </div>

                {/* Input */}
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={tab === 'vin' ? vin : plate}
                      onChange={(e) =>
                        tab === 'vin'
                          ? setVin(e.target.value.toUpperCase())
                          : setPlate(e.target.value.toUpperCase())
                      }
                      placeholder={
                        tab === 'vin'
                          ? t('banner_input_placeholder')
                          : 'Enter license plate number'
                      }
                      className="w-full h-12 sm:h-14 px-5 pr-14 rounded-xl text-sm font-mono text-white placeholder:text-white/20 outline-none transition-all border"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderColor: canSubmit ? 'rgba(120,0,0,0.6)' : 'rgba(255,255,255,0.08)',
                      }}
                      suppressHydrationWarning
                    />
                    {canSubmit && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#c0392b' }} />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-12 sm:h-14 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #780000 0%, #a01515 100%)'
                        : 'rgba(255,255,255,0.06)',
                      color: canSubmit ? '#fff' : 'rgba(255,255,255,0.2)',
                      boxShadow: canSubmit ? '0 8px 30px rgba(120,0,0,0.4)' : 'none',
                    }}
                    suppressHydrationWarning
                  >
                    {t('banner_get_report')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Instant results · No account required · 256-bit encrypted
                </p>
              </div>
            </div>

            {/* Vehicle types */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('banner_we_check')}
              </span>
              <div className="flex items-center gap-2">
                {[Car, Truck, Bus, Ship, Bike].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Report preview card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Card header */}
              <div
                className="px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>
                    {t('banner_report_title')}
                  </p>
                  <p className="text-white font-semibold mt-0.5 text-sm sm:text-base">
                    {t('banner_report_subtitle')}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#f59e0b' }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>4.9</span>
                </div>
              </div>

              {/* Checks grid */}
              <div className="p-5 sm:p-6 grid grid-cols-2 gap-2.5 sm:gap-3">
                {checks.map((check) => (
                  <div key={check} className="flex items-center gap-2 sm:gap-2.5">
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(120,0,0,0.2)' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#c0392b' }} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {check}
                    </span>
                  </div>
                ))}
              </div>

              {/* Risk score strip */}
              <div
                className="mx-5 sm:mx-6 mb-5 sm:mb-6 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Vehicle Risk Score
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                  >
                    Low Risk
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-2 rounded-full w-4/5"
                    style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>High Risk</span>
                  <span className="text-xs font-bold" style={{ color: '#4ade80' }}>84 / 100</span>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Shield, label: 'Secure & Private', sub: 'Bank-level encryption' },
                { icon: Clock, label: 'Instant Results', sub: 'Under 30 seconds' },
                { icon: Star, label: 'Satisfaction', sub: 'Money-back guarantee' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 sm:p-4 text-center space-y-1.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg mx-auto flex items-center justify-center"
                    style={{ background: 'rgba(120,0,0,0.15)' }}
                  >
                    <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" style={{ color: '#c0392b' }} />
                  </div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GetReportForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        preselectedPackage={selectedPackage || undefined}
        prefilledIdentType={tab}
        prefilledIdentValue={tab === 'vin' ? vin : plate}
      />
    </section>
  )
}
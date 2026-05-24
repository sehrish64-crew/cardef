"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, TrendingUp, FileText, AlertTriangle, Zap, Shield } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

export default function FeaturesGrid() {
  const { t } = useTranslations()
  const [activeTab, setActiveTab] = useState('odometer')
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const tabs = [
    { id: 'odometer', label: 'Odometer Check' },
    { id: 'ownership', label: 'Ownership History' },
    { id: 'photos', label: 'Photos on Sale' },
    { id: 'damage', label: 'Damage Check' },
    { id: 'technical', label: 'Technical Data' },
    { id: 'stolen', label: 'Stolen VIN Check' },
  ]

  // Auto-cycle through tabs
  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setActiveTab((prevTab) => {
        const currentIndex = tabs.findIndex((tab) => tab.id === prevTab)
        const nextIndex = (currentIndex + 1) % tabs.length
        return tabs[nextIndex].id
      })
    }, 5000) // Change tab every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlay, tabs])

  return (
    <section
      className="relative py-12 sm:py-16 md:py-24 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(120,0,0,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(42,90,170,0.18), transparent 40%), linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_bottom_right,_rgba(10,142,255,0.08),_transparent_45%)]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 animate-fade-in px-2 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-[1.2]">
            Make Smarter Car Decisions with Verified History Reports
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed">
            Instantly uncover hidden issues, ownership records, mileage accuracy, and accident history with Carreaders.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 sm:gap-4 md:gap-8 border-b border-white/10 animate-fade-in-up">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative min-w-max">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm md:text-base font-semibold pb-3 px-3 transition ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
                {activeTab === tab.id && (
                  <div className="h-full bg-gradient-to-r from-[#780000] to-[#f87171] w-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mt-10 space-y-10">

          {/* ODOMETER */}
          {activeTab === 'odometer' && (
            <div className="grid md:grid-cols-2 gap-10 items-start">

              <div className="relative w-full h-80 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <Image src="/odometer-check-en@1x.webp" alt="" fill className="object-contain" />
              </div>

              <div className="space-y-5">
                <div className="w-14 h-14 bg-[#780000]/15 flex items-center justify-center rounded-xl border border-white/10">
                  <TrendingUp className="text-[#f87171]" />
                </div>

                <h3 className="text-3xl font-bold text-white">Past Odometer Readings</h3>
                <p className="text-white/70">
                  Detect mileage fraud by analyzing historical odometer records across multiple sources.
                </p>

                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#780000] to-[#9b111e] px-6 py-3 text-white shadow-lg shadow-[#780000]/20 transition hover:opacity-95">
                  Check Your Car <ChevronRight />
                </Link>
              </div>
            </div>
          )}

          {/* OWNERSHIP */}
          {activeTab === 'ownership' && (
            <div className="grid md:grid-cols-2 gap-10 items-start">

              <div className="relative w-full h-80 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <Image src="/ownership.webp" alt="" fill className="object-contain" />
              </div>

              <div className="space-y-5">
                <div className="w-14 h-14 bg-[#780000]/15 flex items-center justify-center rounded-xl border border-white/10">
                  <FileText className="text-[#f87171]" />
                </div>

                <h3 className="text-3xl font-bold text-white">Ownership History</h3>
                <p className="text-white/70">
                  Track previous owners, usage type, and complete ownership timeline.
                </p>

                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#780000] to-[#9b111e] px-6 py-3 text-white shadow-lg shadow-[#780000]/20 transition hover:opacity-95">
                  Check Ownership <ChevronRight />
                </Link>
              </div>
            </div>
          )}

          {/* PHOTOS */}
          {activeTab === 'photos' && (
            <div className="grid md:grid-cols-2 gap-10 items-start">

              <div className="relative w-full h-80 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <Image src="/photos-sale.webp" alt="" fill className="object-contain" />
              </div>

              <div className="space-y-5">
                <div className="w-14 h-14 bg-[#780000]/15 flex items-center justify-center rounded-xl border border-white/10">
                  <Zap className="text-[#f87171]" />
                </div>

                <h3 className="text-3xl font-bold text-white">Photos on Sale</h3>
                <p className="text-white/70">
                  Compare vehicle images over time and identify possible damage.
                </p>

                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#780000] to-[#9b111e] px-6 py-3 text-white shadow-lg shadow-[#780000]/20 transition hover:opacity-95">
                  View Photos <ChevronRight />
                </Link>
              </div>
            </div>
          )}

          {/* DAMAGE */}
          {activeTab === 'damage' && (
            <div className="grid md:grid-cols-2 gap-10 items-start">

              <div className="relative w-full h-80 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <Image src="/damage.webp" alt="" fill className="object-contain" />
              </div>

              <div className="space-y-5">
                <div className="w-14 h-14 bg-[#780000]/15 flex items-center justify-center rounded-xl border border-white/10">
                  <AlertTriangle className="text-[#f87171]" />
                </div>

                <h3 className="text-3xl font-bold text-white">Damage Check</h3>
                <p className="text-white/70">
                  Discover accident, flood, fire, and insurance-reported damages.
                </p>

                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#780000] to-[#9b111e] px-6 py-3 text-white shadow-lg shadow-[#780000]/20 transition hover:opacity-95">
                  Check Damage <ChevronRight />
                </Link>
              </div>
            </div>
          )}

          {/* TECHNICAL */}
          {activeTab === 'technical' && (
            <div className="grid md:grid-cols-2 gap-10 items-start">

              <div className="relative w-full h-80 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <Image src="/specification.webp" alt="" fill className="object-contain" />
              </div>

              <div className="space-y-5">
                <div className="w-14 h-14 bg-[#780000]/15 flex items-center justify-center rounded-xl border border-white/10">
                  <Zap className="text-[#f87171]" />
                </div>

                <h3 className="text-3xl font-bold text-white">Technical Data</h3>
                <p className="text-white/70">
                  Full specifications including engine, transmission, and features.
                </p>

                <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#780000] to-[#9b111e] px-6 py-3 text-white shadow-lg shadow-[#780000]/20 transition hover:opacity-95">
                  View Specs <ChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* STOLEN */}
          {activeTab === 'stolen' && (
            <div className="grid md:grid-cols-2 gap-10 items-start">

              <div className="relative w-full h-80 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <Image src="/stolen.webp" alt="" fill className="object-contain" />
              </div>

              <div className="space-y-5">
                <div className="w-14 h-14 bg-[#780000]/15 flex items-center justify-center rounded-xl border border-white/10">
                  <Shield className="text-[#f87171]" />
                </div>

                <h3 className="text-3xl font-bold text-white">Stolen VIN Check</h3>
                <p className="text-white/70">
                  Verify if a vehicle is reported stolen or flagged.
                </p>

                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#780000] to-[#9b111e] px-6 py-3 text-white shadow-lg shadow-[#780000]/20 transition hover:opacity-95">
                  Verify Status <ChevronRight />
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Badge */}
        <div className="mt-16 p-6 rounded-xl border border-white/10 bg-white/5 flex gap-4">
          <div className="w-12 h-12 bg-[#780000]/20 rounded-full flex items-center justify-center text-white">
            ✓
          </div>
          <div>
            <h4 className="font-bold text-white">Official NMVTIS Source</h4>
            <p className="text-white/70 text-sm">
              Carreaders is an approved NMVTIS provider helping prevent fraud and unsafe vehicle purchases.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

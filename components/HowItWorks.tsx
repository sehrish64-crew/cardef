"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

export default function HowItWorks() {
  const { t } = useTranslations()
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      number: '1',
      titleKey: 'howitworks_step1_title',
      descKey: 'howitworks_step1_desc',
      linkKey: 'howitworks_step1_link',
    },
    {
      number: '2',
      titleKey: 'howitworks_step2_title',
      descKey: 'howitworks_step2_desc',
      linkKey: 'howitworks_step2_link',
    },
    {
      number: '3',
      titleKey: 'howitworks_step3_title',
      descKey: 'howitworks_step3_desc',
      linkKey: 'howitworks_step3_link',
    },
    {
      number: '4',
      titleKey: 'howitworks_step4_title',
      descKey: 'howitworks_step4_desc',
      linkKey: 'howitworks_step4_link',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          steps.forEach((_, index) => {
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, index])
            }, index * 150)
          })
          observer.disconnect()
        }
      })
    }, { threshold: 0.1 })

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-16 md:py-24 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(120,0,0,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(10,142,255,0.16), transparent 36%), linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* HEADER */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            {t('howitworks_title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/70">
            {t('howitworks_subtitle')}
          </p>
        </div>

        {/* STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {steps.map((step, index) => {
            const isVisible = visibleSteps.includes(index)

            return (
              <div
                key={index}
                className={`rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)] transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >

                <div className="flex gap-5 items-start">

                  {/* NUMBER BADGE */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#780000]/20 blur-3xl rounded-2xl" />

                    <div className="relative w-16 h-16 bg-[#780000]/15 rounded-2xl flex items-center justify-center border border-white/10">
                      <span className="text-white text-2xl font-bold">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {t(step.titleKey)}
                    </h3>

                    <p className="text-white/70 text-sm mb-3 leading-relaxed">
                      {t(step.descKey)}
                    </p>

                    <a
                      href="#"
                      className="inline-flex items-center gap-2 text-[#f87171] font-semibold hover:text-[#ffb3b3]"
                    >
                      {t(step.linkKey)}
                      <ArrowRight className="w-4 h-4" />
                    </a>

                  </div>

                </div>

              </div>
            )
          })}

        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#780000] to-[#9b111e] text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-[#780000]/20 transition hover:scale-105"
          >
            {t('howitworks_cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
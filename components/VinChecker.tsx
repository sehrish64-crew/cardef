"use client"

import { useState, useEffect, useRef } from 'react'
import { Info, CheckCircle, Key, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GetReportForm from './GetReportForm'
import { useTranslations } from '@/lib/translations'

const trustLogos = [
  { name: 'AutoBild', width: 'w-20' },
  { name: 'TopGear', width: 'w-20' },
  { name: 'Forbes', width: 'w-20' },
  { name: 'REUTERS', width: 'w-20' },
]

export default function VinChecker() {
  const [vin, setVin] = useState('')
  const [vinError, setVinError] = useState('')
  const [vehicleIdType, setVehicleIdType] = useState<'vin' | 'plate'>('vin')
  const [plate, setPlate] = useState('')
  const [plateError, setPlateError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslations()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(120,0,0,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(42,90,170,0.16), transparent 40%), linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_right,_rgba(10,142,255,0.08),_transparent_50%)]" />

      <div className="max-w-6xl mx-auto relative z-10 px-4">

        <div
          className={`relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-1000 border border-white/10 bg-white/5 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >

          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#780000]/35 via-transparent to-black/25"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#780000]/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1a3a6e]/20 rounded-full blur-3xl" />

          <div className="relative px-6 md:px-12 lg:px-16 py-12 md:py-16 grid lg:grid-cols-2 gap-8 items-center">

            {/* LEFT SIDE */}
            <div className="space-y-6 text-white">

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                AutoRevealed Vehicle Intelligence
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-white/80">
                Instantly uncover accident history, mileage records, ownership changes, and hidden issues before buying any car.
              </p>

              <div className="flex items-center space-x-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-[#f87171]" />
                <span className="text-sm md:text-base">
                  Trusted by 4.5M+ users across 35+ countries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {trustLogos.map((logo, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
                  >
                    <span className="text-white text-xs md:text-sm font-semibold">
                      {logo.name}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="bg-[#0f1628] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8">

              {/* Toggle */}
              <div className="flex items-center justify-between mb-4 bg-white/5 p-1 rounded-full border border-white/10">
                <button
                  onClick={() => setVehicleIdType('vin')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    vehicleIdType === 'vin'
                      ? 'bg-[#780000] text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  By VIN
                </button>

                <button
                  onClick={() => setVehicleIdType('plate')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    vehicleIdType === 'plate'
                      ? 'bg-[#780000] text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Plate
                </button>
              </div>

              {/* INPUT */}
              {vehicleIdType === 'vin' ? (
                <Input
                  placeholder="Enter VIN Number"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="text-lg py-6 bg-white/10 border border-white/20 text-white placeholder:text-white/50"
                />
              ) : (
                <Input
                  placeholder="Enter Plate Number"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="text-lg py-6 bg-white/10 border border-white/20 text-white placeholder:text-white/50"
                />
              )}

              {/* BUTTON */}
              <Button
                onClick={() => setIsFormOpen(true)}
                className="w-full mt-4 bg-gradient-to-r from-[#780000] to-[#9b111e] text-white font-bold py-3 shadow-lg shadow-[#780000]/20"
              >
                Get Free Report
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Powered by AutoRevealed Data Engine
              </p>

            </div>

          </div>

          {/* bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

        </div>
      </div>

      <GetReportForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </section>
  )
}
'use client'

import { useState, useEffect } from 'react'
import {
  Shield, Users, Globe2, CheckCircle2, Database, Clock,
  Award, Heart, Zap, Eye
} from 'lucide-react'
import Image from 'next/image'

const stats = [
  { value: 900, suffix: '+', label: 'Data Sources Worldwide', icon: Database },
  { value: 5, suffix: 'M+', label: 'Vehicle Reports Delivered', icon: CheckCircle2 },
  { value: 50, suffix: '+', label: 'Countries Supported', icon: Globe2 },
  { value: 24, suffix: '/7', label: 'Customer Support', icon: Clock }
]

const values = [
  {
    icon: Shield,
    title: 'Verified & Trusted Data',
    description:
      'We collect and analyze vehicle data from trusted global databases to ensure every report is accurate, reliable, and up to date.'
  },
  {
    icon: Users,
    title: 'Built for Buyers & Sellers',
    description:
      'Our platform helps both buyers and sellers make confident decisions with complete transparency and reduced risk.'
  },
  {
    icon: Eye,
    title: 'Full Vehicle Transparency',
    description:
      'From accident history to mileage checks, we reveal the complete truth behind every vehicle before you buy.'
  },
  {
    icon: Zap,
    title: 'Fast Digital Reports',
    description:
      'Instant online reports powered by advanced technology so you can make decisions without delays.'
  }
]

export default function AboutUsClient() {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState([0, 0, 0, 0])

  useEffect(() => {
    setIsVisible(true)

    const duration = 1800
    const steps = 60
    const interval = duration / steps

    stats.forEach((stat, index) => {
      let current = 0
      const inc = stat.value / steps

      const timer = setInterval(() => {
        current += inc
        if (current >= stat.value) {
          current = stat.value
          clearInterval(timer)
        }

        setCounters(prev => {
          const updated = [...prev]
          updated[index] = Math.floor(current)
          return updated
        })
      }, interval)
    })
  }, [])

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)' }} className="min-h-screen">

      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #780000 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1a4a8a 0%, transparent 70%)' }}
      />

      {/* HERO */}
      <div className="relative overflow-hidden">

        <div className="container mx-auto px-4 py-20 text-center max-w-4xl relative z-10">

          <span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold border"
            style={{ borderColor: 'rgba(120,0,0,0.5)', background: 'rgba(120,0,0,0.12)', color: '#f87171' }}
          >
            <Shield size={16} /> About Carreaders
          </span>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black mt-6 leading-tight text-white">
            Driving <span style={{ color: '#f87171' }}>Trust</span> Through Vehicle Data
          </h1>

          <p className="mt-5 text-lg" style={{ color: 'rgba(186,220,255,0.6)' }}>
            Carreaders is a digital vehicle history platform built to help people make safer,
            smarter, and more transparent car buying decisions.
          </p>

        </div>
      </div>

      {/* STATS */}
      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          {stats.map((s, i) => (
            <div
              key={i}
              className="group rounded-2xl p-6 text-center border transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(120,0,0,0.3)',
              }}
            >
              <div 
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center group-hover:scale-110 transition"
                style={{ background: 'rgba(120,0,0,0.15)' }}
              >
                <s.icon style={{ color: '#f87171' }} />
              </div>

              <h2 className="text-3xl font-bold mt-3 text-white">
                {counters[i]}{s.suffix}
              </h2>

              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STORY */}
      <div className="py-16 relative z-10">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">

          <div className="space-y-5">

            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Why We Built <span style={{ color: '#f87171' }}>Carreaders</span>
            </h2>

            <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Buying a used car can be risky. Hidden accidents, mileage fraud, and incomplete history
              often lead to financial loss. We created Carreaders to solve this problem.
            </p>

            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              Our platform gives you instant access to verified vehicle history reports so you can
              avoid scams and make confident decisions before buying any vehicle.
            </p>

            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 text-white">
                <Award style={{ color: '#f87171' }} /> Trusted Reports
              </div>
              <div className="flex items-center gap-2 text-white">
                <Heart style={{ color: '#f87171' }} /> User Focused
              </div>
            </div>

          </div>

          <div className="relative">
            <div 
              className="absolute -inset-4 rounded-3xl blur-2xl"
              style={{ background: 'rgba(120,0,0,0.2)' }}
            ></div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: 'rgba(120,0,0,0.3)' }}>
              <Image
                src="/about-car.jpg"
                alt="About"
                width={800}
                height={500}
                className="object-cover"
              />

              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 p-6 text-white">
                <h3 className="text-xl font-bold">Global Vehicle Intelligence</h3>
                <p className="text-sm text-white/80">
                  Accurate data • Real-time reports • Trusted insights
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* VALUES */}
      <div className="container mx-auto px-4 py-20 relative z-10">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">
            Our <span style={{ color: '#f87171' }}>Core Values</span>
          </h2>
          <p className="mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            The principles that define how we build trust and deliver value
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {values.map((v, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(120,0,0,0.3)',
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(120,0,0,0.15)' }}
              >
                <v.icon style={{ color: '#f87171' }} />
              </div>

              <h3 className="text-xl font-bold text-white">{v.title}</h3>
              <p className="mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{v.description}</p>
            </div>
          ))}

        </div>
      </div>

      {/* CTA */}
      <div 
        className="py-16 text-center text-white relative z-10"
        style={{ background: 'linear-gradient(135deg, #780000, #9b1111)' }}
      >

        <h2 className="text-4xl md:text-5xl font-bold">
          Start Your Vehicle Check Today
        </h2>

        <p className="mt-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Get instant reports and protect yourself from risky car purchases
        </p>

        <button 
          className="mt-6 font-bold px-8 py-3 rounded-xl transition-all"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: '#fff',
          }}
        >
          Get Report Now
        </button>

      </div>

    </div>
  )
}
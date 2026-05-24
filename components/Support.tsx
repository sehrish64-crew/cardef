"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Megaphone, Clock, Mail } from 'lucide-react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SwiperCore from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
SwiperCore.use([Navigation, Autoplay]);

const supportStats = [
  {
    icon: Megaphone,
    value: '97%',
    label: 'satisfaction rate',
    color: 'from-[#780000] to-[#580000]',   // 🔴 changed
    iconColor: 'text-[#780000]',           // 🔴 changed
    bgColor: 'bg-[#f3e6e6]',               // 🔴 light red bg
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'always available',
    color: 'from-[#780000] to-[#3a0000]',  // 🔴 changed
    iconColor: 'text-[#780000]',
    bgColor: 'bg-[#f3e6e6]',
  },
  {
    icon: Mail,
    value: '12-24h',
    label: 'avg. response time',
    color: 'from-[#780000] to-[#8b0000]',  // 🔴 changed
    iconColor: 'text-[#780000]',
    bgColor: 'bg-[#f3e6e6]',
  },
]

const avatarImages = [
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200',
]

export default function Support() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

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
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(120,0,0,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(42,90,170,0.16), transparent 38%), linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)',
      }}
    >
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#780000]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#1a4a8a]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05),_transparent_40%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        <div className="flex items-center -space-x-3 justify-center mb-10">
          {avatarImages.map((image, index) => (
            <img
              key={index}
              src={image}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/10 shadow-lg"
            />
          ))}
        </div>

        <h2 className="text-4xl font-bold text-white text-center">
          Got questions?
          <br />
          <span className="text-[#f87171]">
            We’re here to help 24/7
          </span>
        </h2>

        <div className="hidden md:grid grid-cols-3 gap-6 mt-10">
          {supportStats.map((stat, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
              <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>

              <p className="text-white/70 mt-3">{stat.label}</p>

              <stat.icon className={`w-8 h-8 mt-6 ${stat.iconColor}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

const footerLinks = [
  { key: 'footer_privacy', href: '/privacy' },
  { key: 'footer_terms', href: '/terms' },
  { key: 'footer_refund', href: '/refund-policy' },
]

const socialLinks = [
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export default function Footer() {
  const { t } = useTranslations()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)

  return (
    <footer 
      className="relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)' }}
    >

      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #780000 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1a4a8a 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12">

        {/* TEXT */}
        <div className="border-b border-white/10 pb-6 text-center">
          <p className="text-[11px] sm:text-xs md:text-sm" style={{ color: 'rgba(255,255,255,0.6)' }} >

            <span className="block mb-2">
              Allied Timber VIN Reports. All Rights Reserved. {new Date().getFullYear()} © AutoRevealed. Use of this Website constitutes acceptance of{' '}
            </span>

            <Link href="/terms" className="transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
             <u> Terms & Conditions</u>
            </Link>
            {' , '}
            <Link href="/privacy" className="transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
             <u> Privacy Policy</u>
            </Link>
            {' , '}
            <Link href="/refund-policy" className="transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
             <u> Refund Policy</u>
            </Link>

            <span className="block mt-2">
              This site is owned and operated by Allied Timber - an approved NMVTIS data provider.
              <span className="text-white"> Email: Info@autorevealed.com</span>
            </span>

          </p>
        </div>

        {/* PAYMENT */}
        <div className="flex justify-center mt-6">
          <div 
            className="flex items-center gap-6 px-6 py-3 rounded-2xl backdrop-blur-md border"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >

            <img src="/paypal-icon.svg" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/master-card-icon.svg" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/visa-icon.svg" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/norton-extra-text-icon.svg" className="h-6 opacity-70 hover:opacity-100 transition" />

          </div>
        </div>

      </div>

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#780000] to-transparent" />
    </footer>
  )
}
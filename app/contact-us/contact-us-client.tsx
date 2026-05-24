'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail, Phone, MapPin, Send, Car, MessageCircle, Clock } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/translations'
import { parseJsonSafe } from '@/lib/utils'

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    details: ['info@AutoRevealed.com'],
    gradient: 'from-[#780000] to-red-900'
  },
  {
    icon: MapPin,
    title: 'Office',
    details: ['Office No 025-026 Naklath 286'],
    gradient: 'from-[#780000] to-black'
  }
]

export default function ContactUsClient() {
  const { t } = useTranslations()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [isVisible, setIsVisible] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await parseJsonSafe(res)

      if (!res.ok) throw new Error(data.error || 'Failed')

      setSubmitSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="relative overflow-hidden min-h-screen"
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

      <div ref={heroRef} className="relative container mx-auto px-4 py-16 z-10">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border font-semibold"
            style={{ borderColor: 'rgba(120,0,0,0.5)', background: 'rgba(120,0,0,0.12)', color: '#f87171' }}
          >
            <MessageCircle size={16} />
            Get in Touch
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black mt-6 text-white">
            Contact <span style={{ color: '#f87171' }}>AutoRevealed</span>
          </h1>

          <p className="mt-4 text-lg" style={{ color: 'rgba(186,220,255,0.6)' }}>
            We’re here to help you with vehicle history reports & support anytime.
          </p>
        </div>

        {/* CONTACT CARDS */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactInfo.map((item, i) => (
            <div
              key={i}
              className="group rounded-2xl p-6 border transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(120,0,0,0.3)',
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background: item.gradient
                }}
              >
                <item.icon />
              </div>

              <h3 className="text-xl font-bold mt-4 text-white">{item.title}</h3>

              {item.details.map((d, idx) => (
                <p key={idx} className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {d}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* FORM */}
        <div className="max-w-4xl mx-auto rounded-3xl shadow-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(120,0,0,0.3)' }}>

          <div 
            className="text-white p-6 md:p-10"
            style={{ background: 'linear-gradient(135deg, #780000, #9b1111)' }}
          >
            <h2 className="text-2xl md:text-3xl font-bold">
              Send us a message
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              We usually respond within 2–4 hours
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-5">

            <div className="grid md:grid-cols-2 gap-5">
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-[#780000]"
              />

              <Input
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />

            <Textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[140px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />

            {submitSuccess && (
              <p className="text-green-400 font-medium">Message sent successfully!</p>
            )}

            {submitError && (
              <p className="text-red-400">{submitError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white py-3 rounded-xl text-lg font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #780000, #9b1111)',
              }}
            >
              <Send className="mr-2" size={18} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { X, Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCountry, countries } from '@/contexts/CountryContext'
import { useTranslations } from '@/lib/translations'

export default function Header() {
  const { selectedCountry, setSelectedCountry } = useCountry()
  const { t } = useTranslations()
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country)
    setIsCountryDropdownOpen(false)
    setSearchQuery('')
  }

  const navLink =
    "relative text-white/80 hover:text-white transition-all font-semibold group"

  const activeLine =
    "absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#780000] to-[#f87171] group-hover:w-full transition-all duration-300"

  return (
    <>
      <header className="sticky top-0 z-[40]" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 100%)', backdropFilter: 'blur(20px)' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="AutoRevealed" className="h-9 sm:h-10 w-auto" />
            </Link>

            {/* NAV */}
            <nav className="hidden md:flex items-center space-x-10">
              <Link href="/" className={navLink}>
                {t('nav_home')}
                <span className={activeLine}></span>
              </Link>

              <Link href="/pricing" className={navLink}>
                {t('nav_pricing')}
                <span className={activeLine}></span>
              </Link>

              <Link href="/contact-us" className={navLink}>
                {t('nav_contact')}
                <span className={activeLine}></span>
              </Link>

              <Link href="/about-us" className={navLink}>
                {t('nav_about')}
                <span className={activeLine}></span>
              </Link>
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">

              {/* COUNTRY */}
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full border transition-all"
                style={{
                  borderColor: 'rgba(120,0,0,0.4)',
                  background: 'rgba(120,0,0,0.08)',
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${selectedCountry?.countryCode}.png`}
                  className="w-5 h-4 rounded"
                  alt=""
                />
                <span className="text-sm font-semibold text-white">
                  {selectedCountry?.code}
                </span>
              </button>

              {/* MOBILE MENU */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BORDER ACCENT */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#780000] to-transparent"></div>
      </header>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] p-6"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 100%)' }}
        >
          <div className="flex justify-between items-center mb-8">
            <img src="/logo.png" className="h-8" />
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="text-white" />
            </button>
          </div>

          <div className="space-y-4 text-lg font-semibold">
            <Link href="/" className="block text-white hover:text-[#f87171] transition">Home</Link>
            <Link href="/pricing" className="block text-white hover:text-[#f87171] transition">Pricing</Link>
            <Link href="/contact-us" className="block text-white hover:text-[#f87171] transition">Contact</Link>
            <Link href="/about-us" className="block text-white hover:text-[#f87171] transition">About</Link>
          </div>
        </div>
      )}

      {/* COUNTRY DROPDOWN */}
      {isCountryDropdownOpen && (
        <div className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div 
            className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl shadow-xl max-h-[80vh] flex flex-col"
            style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 100%)' }}
          >
            <Input
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto flex-1 pr-2">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="flex items-center gap-2 p-3 rounded-lg border transition"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(120,0,0,0.3)',
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w80/${country.countryCode}.png`}
                    className="w-6 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-white">{country.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCountryDropdownOpen(false)}
              className="mt-5 text-sm transition"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
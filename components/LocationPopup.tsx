"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCountry, countries } from '@/contexts/CountryContext'
import { X, Globe, Zap, Search } from 'lucide-react'

export default function LocationPopup() {
  const { selectedCountry, setSelectedCountry } = useCountry()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCountries, setFilteredCountries] = useState(countries)

  useEffect(() => {
    const forceShow = searchParams?.get('showLocationPopup') === 'true'

    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('locationPopupShown')

      if (!hasVisited || forceShow) {
        setIsOpen(true)
        if (!forceShow) {
          localStorage.setItem('locationPopupShown', 'true')
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries(countries)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredCountries(
        countries.filter(country =>
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query) ||
          country.currency.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery])

  const handleSelectCountry = (country) => {
    setSelectedCountry(country)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0B1424] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="relative p-8 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="md:text-3xl text-1xl font-bold text-white mb-1">
                Choose Your Region
              </h2>
             
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-[#0B1424] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              autoFocus
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto flex-1 bg-[#0B1424]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelectCountry(country)}
                className={`p-4 rounded-xl border transition text-left ${
                  selectedCountry.code === country.code
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-lg">{country.name}</div>
                <div className="text-sm text-white/70">{country.currency}</div>
                <div className="text-xs mt-2 text-white/50">
                  One Time Payment
                </div>
                <div className="text-xs mt-2 text-white/60">
                  {country.code}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/10 p-6 flex justify-between items-center bg-[#0B1424]">
          <div>
            <p className="text-xs text-white/50 uppercase">Selected</p>
            <p className="text-white font-semibold">
              {selectedCountry.name} ({selectedCountry.code})
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="px-8 py-3 bg-[#0B1424] border border-white/20 text-white rounded-xl hover:bg-white/10 transition flex items-center gap-2"
          >
            Continue
            <Zap className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  )
}
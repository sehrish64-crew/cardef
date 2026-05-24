'use client'

import { useState, useEffect } from 'react'
import { X, Key, Hash, HelpCircle, ChevronRight, Shield, Mail, Car, AlertCircle } from 'lucide-react'
import { useCountry } from '@/contexts/CountryContext'
import countriesList from '@/lib/countries'
import { useTranslations } from '@/lib/translations'
import { getPrice, formatCurrency, getPaddlePriceId } from '@/lib/prices'

interface GetReportFormProps {
  isOpen: boolean
  onClose: () => void
  preselectedPackage?: string
  prefilledIdentType?: 'vin' | 'plate'
  prefilledIdentValue?: string
}

const vehicleTypes = ['Car', 'Motorcycle', 'Truck', 'Boat', 'ATV', 'Campervan']
const packages = [
  { id: 'basic', name: 'Basic', desc: 'Core vehicle specs & title check' },
  { id: 'standard', name: 'Standard', desc: 'Full history + accident records' },
  { id: 'premium', name: 'Premium', desc: 'Everything + market value & theft' },
]

export default function GetReportForm({
  isOpen,
  onClose,
  preselectedPackage,
  prefilledIdentType,
  prefilledIdentValue,
}: GetReportFormProps) {
  const { selectedCountry, setSelectedCountry } = useCountry()
  const { t } = useTranslations()

  const [vehicleIdType, setVehicleIdType] = useState<'vin' | 'plate'>('vin')
  const [vehicleType, setVehicleType] = useState('')
  const [vinNumber, setVinNumber] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [selectedPackage, setSelectedPackage] = useState(preselectedPackage || '')
  const [selectedCountryCode, setSelectedCountryCode] = useState(selectedCountry?.code || 'US')
  const [countryFilter, setCountryFilter] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { if (preselectedPackage) setSelectedPackage(preselectedPackage) }, [preselectedPackage])
  useEffect(() => {
    if (prefilledIdentType && prefilledIdentValue) {
      setVehicleIdType(prefilledIdentType)
      prefilledIdentType === 'vin'
        ? setVinNumber(prefilledIdentValue.toUpperCase())
        : setPlateNumber(prefilledIdentValue.toUpperCase())
    }
  }, [prefilledIdentType, prefilledIdentValue])
  useEffect(() => {
    if (selectedCountry && selectedCountry.code !== selectedCountryCode)
      setSelectedCountryCode(selectedCountry.code)
  }, [selectedCountry])

  const validateForm = () => {
    setError('')
    if (!vehicleType) return setError('Select vehicle type'), false
    if (vehicleIdType === 'vin' && !vinNumber) return setError('Enter VIN'), false
    if (vehicleIdType === 'plate' && !plateNumber) return setError('Enter plate number'), false
    if (!customerEmail) return setError('Enter email'), false
    if (!selectedPackage) return setError('Select a package'), false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      const priceId = getPaddlePriceId(selectedPackage as any)
      if (!priceId) throw new Error('No Paddle price configured')

      const requestBody = {
        customer_email: customerEmail,
        vehicle_type: vehicleType,
        vin_number: vehicleIdType === 'vin' ? vinNumber : null,
        identification_type: vehicleIdType,
        identification_value: vehicleIdType === 'vin' ? vinNumber : plateNumber,
        package_type: selectedPackage,
        country_code: selectedCountryCode,
        currency: selectedCountry.currency,
        amount: getPrice(selectedPackage as any, selectedCountry.currency),
        paymentProvider: `paddle:${priceId}`,
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const data = await res.json()
      if (!res.ok || !data.orderId) throw new Error(data.error || 'Order creation failed')

      const w = window as any
      if (!w.Paddle?.Checkout?.open) throw new Error('Paddle SDK not ready. Please wait and try again.')

      w.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: customerEmail },
        customData: { orderId: String(data.orderId), orderNumber: String(data.orderNumber) },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: selectedCountry.language === 'it' ? 'it' : 'en',
        },
      })

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const filteredCountries = countriesList.filter(
    (c) =>
      c.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
      c.code.toLowerCase().includes(countryFilter.toLowerCase())
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #0d1b2e 0%, #0a0f1e 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 sm:px-7 py-4 sm:py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(120,0,0,0.2)', border: '1px solid rgba(120,0,0,0.3)' }}
            >
              <Car className="w-4 h-4" style={{ color: '#c0392b' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-none">Get Vehicle Report</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Complete the form to access the full report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-7 py-5 sm:py-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* VIN / Plate toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Search By
              </label>
              <div
                className="flex gap-2 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  type="button"
                  onClick={() => setVehicleIdType('vin')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={
                    vehicleIdType === 'vin'
                      ? { background: 'linear-gradient(135deg, #780000, #9b1111)', color: '#fff', boxShadow: '0 4px 16px rgba(120,0,0,0.35)' }
                      : { color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  <Key className="w-4 h-4" />
                  By VIN
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleIdType('plate')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={
                    vehicleIdType === 'plate'
                      ? { background: 'linear-gradient(135deg, #1a3a6e, #2a5aaa)', color: '#fff', boxShadow: '0 4px 16px rgba(42,90,170,0.35)' }
                      : { color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  <Hash className="w-4 h-4" />
                  By Plate
                </button>
              </div>
            </div>

            {/* VIN / Plate input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {vehicleIdType === 'vin' ? 'VIN Number' : 'Plate Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={vehicleIdType === 'vin' ? vinNumber : plateNumber}
                  onChange={(e) =>
                    vehicleIdType === 'vin'
                      ? setVinNumber(e.target.value.toUpperCase())
                      : setPlateNumber(e.target.value.toUpperCase())
                  }
                  placeholder={vehicleIdType === 'vin' ? 'Enter 17-character VIN' : 'Enter license plate number'}
                  maxLength={vehicleIdType === 'vin' ? 17 : undefined}
                  className="w-full h-12 px-4 pr-11 rounded-xl text-sm font-mono text-white placeholder:text-white/20 outline-none border transition-all focus:border-red-900/60"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}
                  required
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <HelpCircle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {vehicleIdType === 'vin' ? '17-character Vehicle Identification Number' : "Your vehicle's license plate number"}
              </p>
            </div>

            {/* Vehicle type + Country */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl text-sm outline-none border transition-all appearance-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.09)',
                    color: vehicleType ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <option value="" disabled style={{ background: '#0d1b2e' }}>Select type</option>
                  {vehicleTypes.map((t) => (
                    <option key={t} value={t} style={{ background: '#0d1b2e', color: '#fff' }}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Country
                </label>
                <select
                  value={selectedCountryCode}
                  onChange={(e) => {
                    setSelectedCountryCode(e.target.value)
                    const found = countriesList.find((c) => c.code === e.target.value)
                    if (found) setSelectedCountry(found)
                  }}
                  className="w-full h-12 px-4 rounded-xl text-sm text-white outline-none border transition-all appearance-none"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}
                >
                  {filteredCountries.map((c) => (
                    <option key={c.code} value={c.code} style={{ background: '#0d1b2e', color: '#fff' }}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-white placeholder:text-white/20 outline-none border transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}
                />
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Your report link will be delivered here</p>
            </div>

            {/* Package selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Select Package
              </label>
              <div className="grid grid-cols-3 gap-3">
                {packages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPackage(p.id)}
                    className="relative p-4 rounded-xl text-left transition-all"
                    style={
                      selectedPackage === p.id
                        ? { background: 'rgba(120,0,0,0.15)', border: '1.5px solid rgba(120,0,0,0.6)', boxShadow: '0 0 20px rgba(120,0,0,0.15)' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                    }
                  >
                    {selectedPackage === p.id && (
                      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ background: '#c0392b' }} />
                    )}
                    <div className="text-sm font-bold text-white mb-1">{p.name}</div>
                    <div
                      className="text-base font-black mb-1.5"
                      style={{ color: selectedPackage === p.id ? '#c0392b' : 'rgba(255,255,255,0.5)' }}
                    >
                      {formatCurrency(getPrice(p.id as any, selectedCountry.currency), selectedCountry.currency)}
                    </div>
                    <div className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 p-3.5 rounded-xl"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedPackage}
                className="flex-[2] h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #780000 0%, #a01515 100%)', color: '#fff', boxShadow: '0 8px 24px rgba(120,0,0,0.35)' }}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Continue to Payment
                    {selectedPackage && ` — ${formatCurrency(getPrice(selectedPackage as any, selectedCountry.currency), selectedCountry.currency)}`}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs pb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Secured by Paddle · 256-bit encryption · Instant delivery
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
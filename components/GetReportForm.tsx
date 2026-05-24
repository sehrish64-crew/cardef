'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, HelpCircle, Key, Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCountry } from '@/contexts/CountryContext'
import countriesList from '@/lib/countries'
import { Input as TextInput } from '@/components/ui/input'
import { useTranslations } from '@/lib/translations'
import { parseJsonSafe } from '@/lib/utils'
import { getPrice, formatCurrency, getExternalPriceId, getPaddlePriceId } from '@/lib/prices'

interface GetReportFormProps {
  isOpen: boolean
  onClose: () => void
  preselectedPackage?: string
  prefilledIdentType?: 'vin' | 'plate'
  prefilledIdentValue?: string
}

const vehicleTypes = ['Car', 'Motorcycle', 'Truck', 'Boat', 'ATV', 'Campervan']
const packages = [
  { id: 'basic', name: 'Basic Report' },
  { id: 'standard', name: 'Standard Report' },
  { id: 'premium', name: 'Premium Report' },
]

export default function GetReportForm({ isOpen, onClose, preselectedPackage, prefilledIdentType, prefilledIdentValue }: GetReportFormProps) {
  const { selectedCountry, setSelectedCountry } = useCountry()
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
  const [paddleReady, setPaddleReady] = useState(false)

  // Pre-fill package
  useEffect(() => { if (preselectedPackage) setSelectedPackage(preselectedPackage) }, [preselectedPackage])
  useEffect(() => { if (prefilledIdentType && prefilledIdentValue) { setVehicleIdType(prefilledIdentType); prefilledIdentType === 'vin' ? setVinNumber(prefilledIdentValue.toUpperCase()) : setPlateNumber(prefilledIdentValue.toUpperCase()) } }, [prefilledIdentType, prefilledIdentValue])
  useEffect(() => { if (selectedCountry && selectedCountry.code !== selectedCountryCode) setSelectedCountryCode(selectedCountry.code) }, [selectedCountry])

  // Check if Paddle is ready
  useEffect(() => {
    if (!isOpen) return
    
    const checkPaddle = () => {
      const w = window as any
      if (w.PADDLE_INITIALIZED && w.Paddle?.Checkout) {
        setPaddleReady(true)
      } else {
        setTimeout(checkPaddle, 500)
      }
    }
    
    checkPaddle()
  }, [isOpen])

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

      const res = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) })
      const data = await res.json()
      if (!res.ok || !data.orderId) throw new Error(data.error || 'Order creation failed')

      const w = window as any
      if (!w.Paddle?.Checkout?.open) {
        throw new Error('Paddle SDK not ready yet. Please wait a moment and try again.')
      }

      console.log('[Paddle] Opening checkout with:', { priceId, customerEmail })
      
      w.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: customerEmail
        },
        customData: { 
          orderId: String(data.orderId), 
          orderNumber: String(data.orderNumber) 
        },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: selectedCountry.language === 'it' ? 'it' : 'en',
        },
      })

      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process payment. Please try again.'
      setError(errorMessage)
      console.error('❌ Error in handleSubmit:', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background z-[9999] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Get Vehicle Report
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="block text-sm font-semibold text-foreground mb-2">
                Search By
              </Label>
              <div className="mb-2">
                <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setVehicleIdType('vin')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                      vehicleIdType === 'vin'
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span className="text-sm font-medium">By VIN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleIdType('plate')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                      vehicleIdType === 'plate'
                        ? 'bg-secondary text-secondary-foreground shadow'
                        : 'text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-medium">By Plate</span>
                  </button>
                </div>
              </div>
            </div>

            {vehicleIdType === 'vin' ? (
              <div>
                <Label htmlFor="vin" className="block text-sm font-semibold text-foreground mb-2">
                  VIN Number
                </Label>
                <div className="relative">
                  <Input
                    id="vin"
                    type="text"
                    value={vinNumber}
                    onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                    placeholder="Enter VIN number"
                    required
                    className="h-12 pr-10"
                    maxLength={17}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 17-character Vehicle Identification Number
                </p>
              </div>
            ) : (
              <div>
                <Label
                  htmlFor="plate"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Plate Number
                </Label>
                <Input
                  id="plate"
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="Enter Plate Number"
                  required
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your vehicle&apos;s license plate number
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="vehicleType" className="block text-sm font-semibold text-foreground mb-2">
                Vehicle Type
              </Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="h-12"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-foreground mb-2">Country</Label>
              <Select
                value={selectedCountryCode}
                onValueChange={(v) => {
                  setSelectedCountryCode(v)
                  const found = countriesList.find((c) => c.code === v)
                  if (found) setSelectedCountry(found)
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-60 overflow-auto">
                  <div className="p-2">
                    <TextInput
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      placeholder="Search countries"
                      className="mb-2 h-9"
                    />
                  </div>
                  {countriesList
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
                        c.code.toLowerCase().includes(countryFilter.toLowerCase())
                    )
                    .map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-semibold text-gray-900 mb-4">
                Select Your Package
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedPackage === pkg.id
                        ? 'bg-primary/10 border-primary shadow-lg'
                        : 'bg-background border-border hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    <div className="font-bold text-sm text-foreground">{pkg.name}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatCurrency(
                        getPrice(pkg.id as any, selectedCountry.currency),
                        selectedCountry.currency
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting || !selectedPackage}
              >
                {isSubmitting
                  ? 'Processing...'
                  : `Continue to Payment - ${
                      selectedPackage
                        ? formatCurrency(
                            getPrice(selectedPackage as any, selectedCountry.currency),
                            selectedCountry.currency
                          )
                        : '$0'
                    }`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
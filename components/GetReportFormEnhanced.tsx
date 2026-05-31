'use client'

import { useState, useEffect } from 'react'
import { X, Key, Hash, HelpCircle, ChevronRight, Shield, Mail, Car, AlertCircle, Check, Loader } from 'lucide-react'
import { useCountry } from '@/contexts/CountryContext'
import countriesList from '@/lib/countries'
import { useTranslations } from '@/lib/translations'
import { getPrice, formatCurrency } from '@/lib/prices'

interface GetReportFormProps {
    isOpen: boolean
    onClose: () => void
    preselectedPackage?: string
    prefilledIdentType?: 'vin' | 'plate'
    prefilledIdentValue?: string
}

type FormStep = 'form' | 'processing' | 'success'

const vehicleTypes = ['Car', 'Motorcycle', 'Truck', 'Boat', 'ATV', 'Campervan']
const packages = [
    {
        id: 'basic',
        name: 'Basic',
        desc: 'Core vehicle specs & title check',
        checkoutUrl: 'https://checkout.freemius.com/product/30450/plan/50029/',
    },
    {
        id: 'standard',
        name: 'Standard',
        desc: 'Full history + accident records',
        checkoutUrl: 'https://checkout.freemius.com/product/30560/plan/50400/',
    },
    {
        id: 'premium',
        name: 'Premium',
        desc: 'Everything + market value & theft',
        checkoutUrl: 'https://checkout.freemius.com/product/30563/plan/50189/',
    },
]

interface ProcessingState {
    step: string
    status: 'pending' | 'complete' | 'error'
    message: string
}

export default function GetReportForm({
    isOpen,
    onClose,
    preselectedPackage,
    prefilledIdentType,
    prefilledIdentValue,
}: GetReportFormProps) {
    const { selectedCountry, setSelectedCountry } = useCountry()
    const { t } = useTranslations()

    // Form state
    const [vehicleIdType, setVehicleIdType] = useState<'vin' | 'plate'>('vin')
    const [vehicleType, setVehicleType] = useState('')
    const [vinNumber, setVinNumber] = useState('')
    const [plateNumber, setPlateNumber] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [selectedPackage, setSelectedPackage] = useState(preselectedPackage || '')
    const [selectedCountryCode, setSelectedCountryCode] = useState(selectedCountry?.code || 'US')
    const [countryFilter, setCountryFilter] = useState('')

    // Status state
    const [error, setError] = useState('')
    const [step, setStep] = useState<FormStep>('form')
    const [processingSteps, setProcessingSteps] = useState<ProcessingState[]>([
        { step: 'Creating order', status: 'pending', message: 'Setting up your order...' },
        { step: 'Sending confirmation', status: 'pending', message: 'Sending confirmation email...' },
        { step: 'Redirecting to payment', status: 'pending', message: 'Preparing payment...' },
    ])
    const [successMessage, setSuccessMessage] = useState('')
    const [successData, setSuccessData] = useState<{
        orderNumber: string
        email: string
    } | null>(null)

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

    const updateProcessingStep = (stepIndex: number, status: 'pending' | 'complete' | 'error', message: string) => {
        setProcessingSteps((prev) => {
            const updated = [...prev]
            updated[stepIndex] = { ...updated[stepIndex], status, message }
            return updated
        })
    }

    const validateForm = () => {
        setError('')
        if (!vehicleType) return setError('Please select a vehicle type'), false
        if (vehicleIdType === 'vin' && !vinNumber) return setError('Please enter your VIN'), false
        if (vehicleIdType === 'plate' && !plateNumber) return setError('Please enter your plate number'), false
        if (!customerEmail) return setError('Please enter your email address'), false
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return setError('Please enter a valid email address'), false
        if (!selectedPackage) return setError('Please select a package'), false
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setStep('processing')
        setError('')
        setProcessingSteps([
            { step: 'Creating order', status: 'pending', message: 'Setting up your order...' },
            { step: 'Sending confirmation', status: 'pending', message: 'Sending confirmation email...' },
            { step: 'Redirecting to payment', status: 'pending', message: 'Preparing payment...' },
        ])

        try {
            // ===== STEP 1: Create Order =====
            updateProcessingStep(0, 'pending', 'Creating your order...')

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
                paymentProvider: null,
            }

            console.log('[ORDER CREATE] Sending payload', requestBody)
            const orderRes = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            // Safely parse JSON; if server returns HTML (e.g., error page), capture body for debug
            let orderData = null
            const orderText = await orderRes.text()
            console.log('[ORDER CREATE] Response status', orderRes.status, orderRes.statusText)
            console.log('[ORDER CREATE] Response text', orderText)
            try {
                const ct = orderRes.headers.get('content-type') || ''
                if (ct.includes('application/json')) {
                    orderData = JSON.parse(orderText)
                } else {
                    console.error('Expected JSON but got:', ct, orderText.slice(0,1000))
                }
            } catch (parseErr) {
                console.error('Failed to parse order response JSON:', parseErr, orderText.slice(0,1000))
            }
            if (!orderRes.ok || !orderData?.orderId) {
                throw new Error((orderData && orderData.error) ? orderData.error : `Failed to create order: ${orderText.slice(0,200)}`)
            }

            updateProcessingStep(0, 'complete', `Order created: ${orderData.orderNumber}`)
            setSuccessData({ orderNumber: orderData.orderNumber, email: customerEmail })

            // ===== STEP 2: Send Confirmation Email =====
            updateProcessingStep(1, 'pending', 'Sending confirmation email...')

            try {
                const emailRes = await fetch('/api/payments/success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'order',
                        orderNumber: orderData.orderNumber,
                        orderId: orderData.orderId,
                        customerName: customerEmail.split('@')[0],
                        customerEmail: customerEmail,
                        amount: getPrice(selectedPackage as any, selectedCountry.currency),
                        currency: selectedCountry.currency,
                        packageType: selectedPackage,
                        vehicleType: vehicleType,
                        vin: vehicleIdType === 'vin' ? vinNumber : plateNumber,
                    }),
                })

                if (emailRes.ok) {
                    updateProcessingStep(1, 'complete', 'Confirmation email sent successfully')
                } else {
                    console.warn('Failed to send confirmation email')
                    updateProcessingStep(1, 'complete', 'Order confirmed (email pending)')
                }
            } catch (emailError) {
                console.error('Email sending error:', emailError)
                updateProcessingStep(1, 'complete', 'Order confirmed (email pending)')
            }

            // ===== STEP 3: Redirect to Payment =====
            updateProcessingStep(2, 'pending', 'Preparing payment page...')

            const selectedPackageData = packages.find((p) => p.id === selectedPackage)
            let checkoutUrl = selectedPackageData?.checkoutUrl

            if (checkoutUrl) {
                // In non-production/dev, force Freemius sandbox mode
                try {
                    if (process.env.NODE_ENV !== 'production' && checkoutUrl.includes('checkout.freemius.com') && !/sandbox=true/.test(checkoutUrl)) {
                        checkoutUrl = checkoutUrl + (checkoutUrl.includes('?') ? '&' : '?') + 'sandbox=true'
                    }
                } catch (e) {
                    // ignore
                }

                updateProcessingStep(2, 'complete', 'Ready to redirect to payment')

                // Delay redirect slightly to show completion state
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Redirect to payment
                window.location.href = checkoutUrl
            } else {
                throw new Error('No payment method available')
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
            console.error('Form submission error:', err)

            // Mark the current step as errored
            const errorStepIndex = processingSteps.findIndex((s) => s.status === 'pending')
            if (errorStepIndex >= 0) {
                updateProcessingStep(errorStepIndex, 'error', errorMsg)
            }

            setError(errorMsg)
            setStep('form')
        }
    }

    const handleClose = () => {
        if (step !== 'processing') {
            setStep('form')
            setError('')
            setSuccessData(null)
            onClose()
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
                onClick={handleClose}
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
                            <h2 className="text-base sm:text-lg font-bold text-white leading-none">
                                {step === 'form' ? 'Get Vehicle Report' : step === 'processing' ? 'Processing Your Order' : 'Order Confirmed!'}
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {step === 'form'
                                    ? 'Complete the form to access the full report'
                                    : step === 'processing'
                                        ? 'Please wait while we set everything up...'
                                        : 'Your order is ready!'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={step === 'processing'}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 sm:px-7 py-5 sm:py-6 max-h-[80vh] overflow-y-auto">
                    {/* FORM STEP */}
                    {step === 'form' && (
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
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>We'll send a confirmation email and your report link here</p>
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
                                    onClick={handleClose}
                                    className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all hover:opacity-75"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedPackage}
                                    className="flex-[2] h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, #780000 0%, #a01515 100%)', color: '#fff', boxShadow: '0 8px 24px rgba(120,0,0,0.35)' }}
                                >
                                    <>
                                        <Shield className="w-4 h-4" />
                                        Continue To Payment
                                        {selectedPackage && ` ${formatCurrency(getPrice(selectedPackage as any, selectedCountry.currency), selectedCountry.currency)}`}
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                </button>
                            </div>

                            <p className="text-center text-xs pb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                🔒 Your information is secure and will only be used to send you your report
                            </p>
                        </form>
                    )}

                    {/* PROCESSING STEP */}
                    {step === 'processing' && (
                        <div className="space-y-4 py-8">
                            <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-6">
                                We're processing your order and setting everything up...
                            </p>

                            {processingSteps.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 rounded-lg"
                                    style={{
                                        background:
                                            item.status === 'complete'
                                                ? 'rgba(34,197,94,0.1)'
                                                : item.status === 'error'
                                                    ? 'rgba(239,68,68,0.1)'
                                                    : 'rgba(255,255,255,0.04)',
                                        border:
                                            item.status === 'complete'
                                                ? '1px solid rgba(34,197,94,0.3)'
                                                : item.status === 'error'
                                                    ? '1px solid rgba(239,68,68,0.3)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div className="flex-shrink-0">
                                        {item.status === 'pending' && (
                                            <div className="animate-spin">
                                                <Loader className="w-5 h-5" style={{ color: '#3b82f6' }} />
                                            </div>
                                        )}
                                        {item.status === 'complete' && (
                                            <Check className="w-5 h-5" style={{ color: '#22c55e' }} />
                                        )}
                                        {item.status === 'error' && (
                                            <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{item.step}</p>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color:
                                                    item.status === 'complete'
                                                        ? 'rgba(34,197,94,0.8)'
                                                        : item.status === 'error'
                                                            ? 'rgba(239,68,68,0.8)'
                                                            : 'rgba(255,255,255,0.5)',
                                            }}
                                        >
                                            {item.message}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <p className="text-center text-xs pt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                Please don't close this window
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

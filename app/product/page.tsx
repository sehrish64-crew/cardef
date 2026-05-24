import React from 'react'

const PRODUCT_NAME = 'CarReaders Product'

export default function Page() {
  return (
    <main
      className="min-h-screen relative overflow-hidden py-12 text-foreground"
      style={{
        backgroundColor: '#0a0f1e',
        backgroundImage: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="relative min-h-screen font-sans overflow-hidden mb-8">

          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
            <div className="flex justify-center mb-8 sm:mb-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase"
                style={{ borderColor: 'rgba(120,0,0,0.5)', background: 'rgba(120,0,0,0.12)', color: '#f87171' }}
              >
                Trusted by 2M+ buyers worldwide
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-4 sm:space-y-5">
                  <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight text-white">{PRODUCT_NAME}</h1>
                  <p className="text-base sm:text-lg leading-relaxed max-w-md" style={{ color: 'rgba(186,220,255,0.6)' }}>
                    Professional vehicle history and inspection insights — one clear report, one-time payment.
                  </p>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white">50+</div>
                    <div className="text-xs font-medium mt-0.5" style={{ color: 'rgba(147,197,253,0.5)' }}>Data Sources</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white">2M+</div>
                    <div className="text-xs font-medium mt-0.5" style={{ color: 'rgba(147,197,253,0.5)' }}>Reports Generated</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white">99%</div>
                    <div className="text-xs font-medium mt-0.5" style={{ color: 'rgba(147,197,253,0.5)' }}>Accuracy Rate</div>
                  </div>
                </div>

                <div className="mt-6">
                  <a href="/checkout?product=carreaders-premium" className="inline-flex items-center px-6 py-3" style={{ background: 'linear-gradient(135deg, #780000 0%, #9b1111 100%)', color: '#fff', borderRadius: '0.5rem' }}>Buy Report</a>
                  <a href="#packages" className="ml-4 text-sm text-blue-300 hover:underline">See packages & pricing</a>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>Comprehensive Report</p>
                      <p className="text-white font-semibold mt-0.5 text-sm sm:text-base">Complete vehicle history in seconds</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>4.9</span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,0,0,0.2)' }}>
                        <svg className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Damage</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,0,0,0.2)' }}>
                        <svg className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Mileage rollbacks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Product Overview */}
        <section id="overview" className="mb-8">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#780000]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f8fafc]">
                Product Overview
              </span>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Digital vehicle inspection reports built for fast confidence.
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-300">
                Our product delivers a complete vehicle history and inspection summary in a clean, easy-to-read report sourced from legitimate global automotive databases. Buyers receive verified insights on title history, mileage, ownership, and accident records, presented in a clear and structured format without unnecessary noise.                </p>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Everything is delivered digitally after a one-time payment so you can review a vehicle’s background quickly and make smarter purchase decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section id="features" className="mb-8">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#780000]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f8fafc]">
                Key Features
              </span>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Everything included in the report for trusted vehicle checks.
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  'Mileage verification across multiple independent sources',
                  'Title & registration checks across jurisdictions',
                  'Accident and salvage history summaries',
                  'Ownership timeline and previous owners',
                  'Downloadable PDF report for records and sharing',
                  'Fast delivery — report available within minutes of purchase',
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Target Users */}
        <section id="target-users" className="mb-8">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#780000]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f8fafc]">
                Who This Is For
              </span>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ideal for buyers, dealers, and inspectors who need trusted vehicle history.
              </h2>
              <ul className="mt-8 space-y-3 text-slate-300 list-disc list-inside">
                <li>Used car buyers seeking verified background data</li>
                <li>Dealers and brokers needing quick verification</li>
                <li>Inspectors and mechanics preparing condition reports</li>
                <li>Individuals preparing listings who want transparent history</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sample Report Preview */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(120,33,47,0.25),_transparent_45%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.8),_transparent_50%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto sm:px-6">
            <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-[0_40px_120px_rgba(15,23,42,0.32)]">
              <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr] items-center">
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#780000]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f8fafc]">
                    Sample Report Preview
                  </span>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                      View a sample vehicle inspection report designed in our theme.
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                      This report gives you a transparent preview of what you will receive in our detailed vehicle inspection report. It is designed using our brand colors and clean, trusted layout to help you understand the full inspection format before purchase.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="/sample-report.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#780000] to-[#c0392b] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#780000]/30 transition hover:-translate-y-0.5">
                      Open Sample Report
                    </a>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#111827] text-2xl">
                      📄
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Report Highlights</p>
                      <h3 className="text-lg font-semibold text-white">Full Vehicle History Snapshot</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl bg-slate-900/90 p-4">
                      <p className="text-sm text-slate-400">
                        The sample report includes accident history, title status, odometer checks, and ownership details — all in one place.
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {[
                        'Accident & damage history',
                        'Title & lien checks',
                        'Odometer verification',
                        'Ownership and transfer summary',
                        'Market value insight',
                      ].map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-slate-300">
                          <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#780000] text-white text-xs">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative py-20 overflow-hidden mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">How It Works</h2>
              <p className="text-sm sm:text-base md:text-lg text-white/70">
                A step-by-step process that explains how our vehicle history reports are created and delivered.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {[
                { number: '1', title: 'Enter VIN or plate', description: 'Start with the vehicle identifier so we can locate the history data.' },
                { number: '2', title: 'Collect verified records', description: 'We gather title, mileage, accident, and ownership details from trusted sources.' },
                { number: '3', title: 'Generate the report', description: 'A polished inspection report is created with the vehicle’s full background.' },
                { number: '4', title: 'Review instantly', description: 'Download and review your report immediately to make confident decisions.' },
              ].map((step) => (
                <div key={step.number} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
                  <div className="flex gap-5 items-start">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-[#780000]/20 blur-3xl rounded-2xl" />
                      <div className="relative w-16 h-16 bg-[#780000]/15 rounded-2xl flex items-center justify-center border border-white/10">
                        <span className="text-white text-2xl font-bold">{step.number}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a href="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#780000] to-[#9b111e] text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-[#780000]/20 transition hover:scale-105">
                See Pricing
                <span className="w-4 h-4">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Call to Action */}

      </div>


    </main>
  )
}

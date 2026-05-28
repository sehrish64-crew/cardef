import React from 'react'

const PRODUCT_NAME = 'CarReaders Product'

export default function Page() {
  return (
    <main className="min-h-screen relative overflow-hidden py-12 text-foreground">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: '60px 60px',
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 100%)',
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
                  <a href="/checkout?product=carreaders-premium" className="inline-flex items-center px-6 py-3" style={{ background: 'linear-gradient(135deg, #780000 0%, #9b1111 100%)', color: '#fff', borderRadius: '0.5rem' }}>Buy Premium — $29.99</a>
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
          <h2 className="text-2xl font-semibold mb-3">Product Overview</h2>
          <p className="text-muted-foreground">
            A web-based SaaS platform that provides digital vehicle inspection and vehicle history report services. Users can purchase and instantly access detailed vehicle reports that include inspection summaries, condition analysis, ownership insights, and available history data. <br />
          </p>
          <p>
            The platform is designed to help users evaluate used vehicles more confidently by delivering structured and easy-to-understand digital reports.
          </p><br />
          <p>
            All services are delivered digitally through a secure online dashboard with instant access after payment.
          </p>
        </section>

        {/* Pricing summary */}
        <section id="pricing" className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Pricing (One-Time)</h2>
          <p className="text-muted-foreground mb-4">Choose a single purchase — no recurring billing or subscriptions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground">Basic</div>
              <div className="text-2xl font-bold mt-2">$9.99</div>
              <p className="text-sm text-muted-foreground mt-2">Essential vehicle report — quick VIN checks and title status.</p>
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-md">
              <div className="text-sm text-muted-foreground">Standard</div>
              <div className="text-2xl font-bold mt-2">$19.99</div>
              <p className="text-sm text-muted-foreground mt-2">Detailed history with mileage validation and incident summary.</p>
            </div>
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground">Premium</div>
              <div className="text-2xl font-bold mt-2">$29.99</div>
              <p className="text-sm text-muted-foreground mt-2">Full comprehensive analysis including ownership timeline and downloadable PDF.</p>
            </div>
          </div>
        </section>

        {/* Packages comparison */}
        <section id="packages" className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic */}
            <div className="bg-card border rounded-lg p-6 flex flex-col">
              <div className="mb-4">
                <div className="text-lg font-semibold">Basic</div>
                <div className="text-3xl font-bold mt-2">$9.99</div>
                <div className="text-sm text-muted-foreground mt-1">Essential vehicle report</div>
              </div>
              <ul className="mb-6 list-disc list-inside text-muted-foreground flex-1">
                <li>VIN & title status</li>
                <li>Basic accident summary</li>
                <li>Quick mileage check</li>
              </ul>
              <a href="/checkout?product=carreaders-basic" className="mt-auto inline-block text-center px-4 py-2" style={{ background: 'linear-gradient(135deg, #780000 0%, #9b1111 100%)', color: '#fff', borderRadius: '0.375rem' }}>Buy Basic</a>
            </div>

            {/* Standard */}
            <div className="bg-card border-2 border-primary rounded-lg p-6 flex flex-col">
              <div className="mb-4">
                <div className="text-lg font-semibold">Standard</div>
                <div className="text-3xl font-bold mt-2">$19.99</div>
                <div className="text-sm text-muted-foreground mt-1">Detailed inspection + history insights</div>
              </div>
              <ul className="mb-6 list-disc list-inside text-muted-foreground flex-1">
                <li>All Basic features</li>
                <li>Enhanced mileage validation</li>
                <li>Incident chronology and notes</li>
              </ul>
              <a href="/checkout?product=carreaders-standard" className="mt-auto inline-block text-center px-4 py-2" style={{ background: 'linear-gradient(135deg, #780000 0%, #9b1111 100%)', color: '#fff', borderRadius: '0.375rem' }}>Buy Standard</a>
            </div>

            {/* Premium */}
            <div className="bg-card border rounded-lg p-6 flex flex-col">
              <div className="mb-4">
                <div className="text-lg font-semibold">Premium</div>
                <div className="text-3xl font-bold mt-2">$29.99</div>
                <div className="text-sm text-muted-foreground mt-1">Full comprehensive vehicle analysis</div>
              </div>
              <ul className="mb-6 list-disc list-inside text-muted-foreground flex-1">
                <li>All Standard features</li>
                <li>Ownership history and registration checks</li>
                <li>Downloadable PDF report and export</li>
              </ul>
              <a href="/checkout?product=carreaders-premium" className="mt-auto inline-block text-center px-4 py-2" style={{ background: 'linear-gradient(135deg, #780000 0%, #9b1111 100%)', color: '#fff', borderRadius: '0.375rem' }}>Buy Premium</a>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section id="features" className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Key Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground list-disc list-inside">
            <li>Mileage verification across multiple independent sources</li>
            <li>Title & registration checks across jurisdictions</li>
            <li>Accident and salvage history summaries</li>
            <li>Ownership timeline and previous owners</li>
            <li>Downloadable PDF report for records and sharing</li>
            <li>Fast delivery — report available within minutes of purchase</li>
          </ul>
        </section>

        {/* Target Users */}
        <section id="target-users" className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Who This Is For</h2>
          <div className="text-muted-foreground">
            <ul className="list-disc list-inside">
              <li>Used car buyers seeking verified background data</li>
              <li>Dealers and brokers needing quick verification</li>
              <li>Inspectors and mechanics preparing condition reports</li>
              <li>Individuals preparing listings who want transparent history</li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section id="cta" className="mb-16">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold">Ready to get the report?</h3>
            <p className="mt-2 text-primary-foreground/90">Purchase a one-time report and get instant access to a downloadable PDF with verified vehicle history.</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <a href="/checkout?product=carreaders-basic" className="px-5 py-3 rounded-md font-semibold" style={{ background: 'rgba(6,12,24,0.85)', color: '#fff' }}>Buy Basic — $9.99</a>
              <a href="/checkout?product=carreaders-premium" className="px-5 py-3 rounded-md font-semibold" style={{ background: 'linear-gradient(135deg, #780000 0%, #9b1111 100%)', color: '#fff' }}>Buy Premium — $29.99</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

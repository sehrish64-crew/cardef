import Link from 'next/link'

export const metadata = {
  title: 'Sample Report | Carreaders',
  description: 'Preview the sample vehicle history report in Carreaders brand style.',
}

export default function SampleReportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)]" />
        <div className="relative container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="rounded-[36px] border border-white/10 bg-slate-900/95 p-8 sm:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f8fafc]">Sample Report</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  Aapka Trusted Vehicle History Preview
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300">
                  Yeh sample report aapko ek complete overview deta hai jo humari theme aur brand identity ke saath styled hai. Scroll karke dekhen ki report kis tarah se organize hoti hai aur kaunse important sections aapko milenge.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Back to Home
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[
                {
                  title: 'Accident & Damage History',
                  description: 'Complete record of reported accidents, structural damage, and insurance claims so you can buy with confidence.',
                },
                {
                  title: 'Title & Lien Status',
                  description: 'Verify clean title, salvage branding, flood history, and any active liens attached to the vehicle.',
                },
                {
                  title: 'Odometer & Usage',
                  description: 'Odometer consistency checks, mileage trends, and service mileage history for accurate readings.',
                },
                {
                  title: 'Ownership & Registration',
                  description: 'Previous owner count, registration history, and vehicle transfers with trusted global data.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                >
                  <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#111827] via-[#111827] to-[#0b1221] p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Download a styled preview</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Sample report layout designed to match your app theme and show report appearance clearly.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#780000] to-[#c0392b] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#780000]/25 transition hover:-translate-y-0.5"
                >
                  Open Full Report Flow
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

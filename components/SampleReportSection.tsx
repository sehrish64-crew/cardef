import Link from 'next/link'

export default function SampleReportSection() {
    return (
        <section className="relative overflow-hidden py-20 bg-slate-950">
            <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(120,33,47,0.25),_transparent_45%)] pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.8),_transparent_50%)] pointer-events-none" />
            <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl">
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
                                <Link
                                    href="/sample-report.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#780000] to-[#c0392b] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#780000]/30 transition hover:-translate-y-0.5"
                                >
                                    Open Sample Report
                                </Link>

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
    )
}

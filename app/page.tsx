import Link from 'next/link';
import { vertical } from '@/config/vertical';
import DemoLauncher from '@/components/demo-launcher';
import { CurrencyAmount } from '@/components/currency-provider';
import { ProviderStatus } from '@/components/provider-status';

const proofPoints = [
  { label: 'Configured benchmark', value: null, detail: vertical.marketSource },
  { label: 'Quote review', value: 'Itemized', detail: 'Compare prices, fees, and terms' },
  { label: 'Default call mode', value: 'Simulated', detail: 'No real provider is called by default' },
];

const flow = [
  {
    title: '1. Intake',
    body: 'A voice interview or uploaded quote becomes one confirmed job spec with the details you provide.',
  },
  {
    title: '2. Compare providers',
    body: 'The demo negotiates with simulated provider personas. Real calls are optional, explicitly gated, and require confirmation.',
  },
  {
    title: '3. Rank and recommend',
    body: 'It compares bids, flags lowball anomalies, and explains why the winner is actually the best value.',
  },
];

const reasons = [
  'No more vague “range” quotes from random movers.',
  'Transparent itemization instead of hidden fees and bait-and-switch totals.',
  'Evidence-backed comparison with a clear recommendation and call transcript.',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(198,90,120,0.2),_transparent_42%),linear-gradient(180deg,#190A12_0%,#2B101E_34%,#190A12_34%,#190A12_100%)] text-[#FFF5F2]">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-[#190A12]/90 p-6 shadow-[0_28px_120px_rgba(25,10,18,0.55)] ring-1 ring-white/10 backdrop-blur md:p-8 lg:p-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C65A78] shadow-[0_12px_32px_rgba(198,90,120,0.35)]">
                  <span className="font-mono text-sm font-black text-[#FFF5F2]">TB</span>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold tracking-[-0.06em] text-white">The Trust Bid</p>
                </div>
              </div>
              <nav className="hidden items-center gap-6 text-sm text-[#C7AAB5] md:flex">
                <Link href="/intake" className="transition hover:text-white">Intake</Link>
                <Link href="/calls" className="transition hover:text-white">Calls</Link>
                <Link href="/report" className="transition hover:text-white">Report</Link>
              </nav>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-7">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8C5A8]/30 bg-[#E8C5A8]/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[#E8C5A8]">
                    AI {vertical.jobNoun} quote negotiation
                  </div>
                  <ProviderStatus compact />
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-xl font-display text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-6xl">
                    Stop paying the first quote you hear.
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-[#C7AAB5]">
                    The Trust Bid compares itemized provider quotes and negotiates with simulated providers by default. Optional real calls require explicit setup and confirmation.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <DemoLauncher />
                  <Link
                    href="/intake"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#E8C5A8]/25 bg-[#2B101E] px-6 py-3 font-semibold text-[#FFF5F2] transition hover:border-[#E8C5A8]/50 hover:bg-[#3B1A2A]"
                  >
                    Start intake
                  </Link>
                </div>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#C7AAB5]">
                  <span>Voice intake</span>
                  <span className="text-[#E8C5A8]">•</span>
                  <span>Quote comparison</span>
                  <span className="text-[#E8C5A8]">•</span>
                  <span>Ranked report</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-6 rounded-full bg-[#C65A78]/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[28px] border border-[#E8C5A8]/20 bg-[#2B101E] p-5 shadow-[0_24px_80px_rgba(25,10,18,0.6)]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#C7AAB5]">Configured benchmark</p>
                      <h2 className="mt-2 flex flex-wrap gap-x-2 font-display text-3xl font-bold text-white">
                        <CurrencyAmount usd={vertical.marketRange.low} />–<CurrencyAmount usd={vertical.marketRange.high} />
                      </h2>
                    </div>
                    <div className="rounded-full border border-[#E8C5A8]/30 bg-[#E8C5A8]/10 px-2.5 py-1 text-xs font-medium text-[#E8C5A8]">
                      {vertical.name === 'moving' ? '45-mile / 2BR reference' : vertical.marketSource}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { name: 'Example provider A', price: 1780, tag: 'initial quote' },
                      { name: 'Example provider B', price: 2540, tag: 'negotiated' },
                      { name: 'Example provider C', price: 3260, tag: 'itemized' },
                      { name: 'Example provider D', price: 4980, tag: 'needs review' },
                    ].map(({ name, price, tag }) => (
                      <div key={name} className="flex items-center justify-between rounded-2xl border border-[#E8C5A8]/15 bg-[#190A12]/60 p-3.5">
                        <div>
                          <p className="font-medium text-white">{name}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#C7AAB5]">{tag}</p>
                        </div>
                        <CurrencyAmount usd={price} className="font-mono text-lg font-semibold text-[#E8C5A8]" />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#C7AAB5]">Illustrative demo rows — not live provider quotes. USD-based U.S. examples converted at the latest published USD/INR rate.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {proofPoints.map(({ label, value, detail }) => (
            <div key={label} className="rounded-[24px] border border-[#E8C5A8]/15 bg-[#2B101E] p-6 shadow-[0_20px_45px_rgba(25,10,18,0.22)]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C7AAB5]">{label}</p>
              <p className="mt-4 font-display text-4xl font-bold tracking-[-0.06em] text-[#FFF5F2]">
                {label === 'Configured benchmark'
                  ? <><CurrencyAmount usd={vertical.marketRange.low} />–<CurrencyAmount usd={vertical.marketRange.high} /></>
                  : value}
              </p>
              <p className="mt-2 text-sm text-[#C7AAB5]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#E8C5A8]">Why it works</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.06em] text-[#FFF5F2] md:text-5xl">
            Built to replace guesswork with receipts.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {flow.map((step) => (
            <div key={step.title} className="rounded-[28px] border border-[#E8C5A8]/15 bg-[#2B101E] p-6 shadow-[0_18px_38px_rgba(25,10,18,0.22)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C65A78]/20 font-display text-xl font-bold text-[#E8C5A8]">
                {step.title.split('.')[0]}
              </div>
              <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#FFF5F2]">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#C7AAB5]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-8 rounded-[32px] border border-[#E8C5A8]/15 bg-[#2B101E] p-8 shadow-[0_25px_70px_rgba(25,10,18,0.25)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#E8C5A8]">No fuzzy pricing</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.06em] text-[#FFF5F2] md:text-5xl">
              One quote. Clear comparisons. Real leverage.
            </h2>
            <ul className="mt-6 space-y-4">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3 text-base text-[#C7AAB5]">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C65A78] text-xs font-black text-[#FFF5F2]">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] bg-[#190A12] p-6 text-[#FFF5F2] shadow-[0_30px_70px_rgba(25,10,18,0.3)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C7AAB5]">Instant insight</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-[#C7AAB5]">Recommended quote</p>
                <CurrencyAmount usd={2240} className="mt-2 block font-display text-4xl font-bold tracking-[-0.06em] text-[#E8C5A8]" />
                <p className="mt-2 text-sm text-[#C7AAB5]">Down from <CurrencyAmount usd={3580} /> after a competitive callback and itemized review.</p>
              </div>
              <div className="rounded-2xl border border-[#C65A78]/40 bg-[#C65A78]/15 p-4 text-sm text-[#FFF5F2]">
                <span className="font-semibold">Why it won:</span> Lower total with fewer add-ons, better packaging terms, and a cleaner fee structure.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { memo } from 'react';
import type { LandingCopy } from '../lib/strings';

function Sections({ copy }: { copy: LandingCopy }) {
  return (
    <>
      <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="how-title" className="text-2xl font-bold text-slate-900">{copy.howItWorks.title}</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <ol className="space-y-3 text-slate-800">
            {copy.howItWorks.steps.map((step, idx) => <li key={step}><span className="font-semibold">{idx + 1}.</span> {step}</li>)}
          </ol>
          <img src="/placeholder-dashboard.svg" alt={copy.howItWorks.screenshotAlt} loading="lazy" className="rounded-lg border border-slate-300 shadow-sm" />
        </div>
      </section>

      <section aria-labelledby="social-title" className="bg-slate-100 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="social-title" className="text-2xl font-bold text-slate-900">{copy.testimonials.title}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {copy.testimonials.items.map((item) => (
              <blockquote key={item.name} className="rounded-lg border border-slate-300 bg-white p-5">
                <p className="text-slate-800">“{item.quote}”</p>
                <footer className="mt-3 text-sm text-slate-700">{item.name} · {item.role}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="comparison-title" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="comparison-title" className="text-2xl font-bold text-slate-900">{copy.comparison.title}</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">{copy.comparison.title}</caption>
            <thead>
              <tr className="border-b border-slate-300 text-slate-900">
                <th className="py-2 pr-4">{copy.comparison.headers.criteria}</th>
                <th className="py-2 pr-4">{copy.comparison.headers.spreadsheet}</th>
                <th className="py-2 pr-4">{copy.comparison.headers.genericApps}</th>
                <th className="py-2">{copy.comparison.headers.faturaLens}</th>
              </tr>
            </thead>
            <tbody>
              {copy.comparison.rows.map((row) => (
                <tr key={row.criteria} className="border-b border-slate-200 text-slate-800">
                  <td className="py-2 pr-4 font-medium">{row.criteria}</td>
                  <td className="py-2 pr-4">{row.spreadsheet}</td>
                  <td className="py-2 pr-4">{row.genericApps}</td>
                  <td className="py-2 font-semibold text-blue-800">{row.faturaLens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 id="faq-title" className="text-2xl font-bold text-slate-900">{copy.faq.title}</h2>
        <div className="mt-6 space-y-3">
          {copy.faq.items.map((item) => (
            <details key={item.question} className="rounded-md border border-slate-300 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">{item.question}</summary>
              <p className="mt-2 text-slate-800">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

export default memo(Sections);

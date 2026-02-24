'use client';

import { FormEvent, useMemo, useState } from 'react';

type FormLabels = {
  title: string;
  name: string;
  email: string;
  company: string;
  submit: string;
  loading: string;
  success: string;
  genericError: string;
};

type Props = { labels: FormLabels; locale: 'pt' | 'en' };

export default function LeadForm({ labels, locale }: Props) {
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [loading, setLoading] = useState(false);

  const submitLabel = useMemo(() => (loading ? labels.loading : labels.submit), [loading, labels.loading, labels.submit]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle' });

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      company: String(data.get('company') || ''),
      locale,
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatus({ type: 'error', message: result?.message || labels.genericError });
      } else {
        (event.target as HTMLFormElement).reset();
        setStatus({ type: 'success', message: labels.success });
      }
    } catch {
      setStatus({ type: 'error', message: labels.genericError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm" onSubmit={onSubmit} noValidate aria-label={labels.title}>
      <h2 className="text-xl font-semibold text-slate-900">{labels.title}</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-800">{labels.name}</label>
          <input id="name" name="name" required autoComplete="name" className="w-full rounded-md border border-slate-400 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-800">{labels.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded-md border border-slate-400 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-slate-800">{labels.company}</label>
          <input id="company" name="company" required className="w-full rounded-md border border-slate-400 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60" aria-live="polite">
        {submitLabel}
      </button>
      {status.type !== 'idle' && (
        <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`} role="status" aria-live="polite">
          {status.message}
        </p>
      )}
    </form>
  );
}

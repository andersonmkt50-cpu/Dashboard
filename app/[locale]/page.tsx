import type { Metadata } from 'next';
import LeadForm from '../../components/LeadForm';
import LandingSections from '../../components/LandingSections';
import { defaultLocale, strings, type Locale } from '../../lib/strings';

type Props = { params: { locale: Locale } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = strings[params.locale] ? params.locale : defaultLocale;
  const seo = strings[locale].seo;
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      images: [{ url: '/placeholder-dashboard.svg', width: 1200, height: 720, alt: 'FaturaLens preview' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: ['/placeholder-dashboard.svg'],
    },
  };
}

export default function FaturaLensLP({ params }: Props) {
  const locale = strings[params.locale] ? params.locale : defaultLocale;
  const copy = strings[locale];

  return (
    <main>
      <header className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{copy.hero.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">{copy.hero.title}</h1>
            <p className="mt-4 text-slate-200">{copy.hero.subtitle}</p>
          </div>
          <LeadForm labels={copy.form} locale={locale} />
        </div>
      </header>
      <LandingSections copy={copy} />
    </main>
  );
}

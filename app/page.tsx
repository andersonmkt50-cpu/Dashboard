import { redirect } from 'next/navigation';
import { defaultLocale } from '../lib/strings';

export default function Home() {
  redirect(`/${defaultLocale}`);
}

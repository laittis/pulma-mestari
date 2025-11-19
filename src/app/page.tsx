// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  const cards = [
    { href: '/game?mode=mixed', title: 'Sekoitettu', desc: 'Yhteen- ja vähennyslaskuja (myöhemmin ×) tasoittain' },
    { href: '/game?mode=add', title: 'Yhteenlaskut', desc: 'Vain yhteenlaskuja, kevyesti vaikeutuva' },
    { href: '/game?mode=sub', title: 'Vähennyslaskut', desc: 'Vain vähennyslaskuja, ei negatiivisia varhain' },
    { href: '/game?mode=mul', title: 'Kertolaskut', desc: 'Pienet kertolaskut tasoittain (myöhemmin laajenee)' },
  ];
  return (
    <main className="min-h-screen flex justify-center items-start p-6 bg-gray-200 text-gray-900">
      <div className="bg-white rounded-2xl p-6 w-full max-w-[720px] shadow-lg">
        <h1 className="text-[24px] m-0 mb-4">Pulmamestarit</h1>
        <p className="text-sm text-gray-600 mb-4">Valitse pelitila</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="block p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100">
              <div className="text-lg font-medium">{c.title}</div>
              <div className="text-sm text-gray-600">{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

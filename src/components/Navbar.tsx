
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const categories = [
  { name: "সব পণ্য", emoji: "🛒", href: "/#সব-পণ্য" },
  { name: "চাল", emoji: "🍚", href: "/category/chal" },
  { name: "ডাল", emoji: "🍲", href: "/category/dal" },
  { name: "তেল", emoji: "🛢️", href: "/category/tel" },
  { name: "সবজি", emoji: "🥬", href: "/category/shobji" },
  { name: "মাছ ", emoji: "🐟", href: "/category/mach-mangsho" },
  { emoji: "🍗", name: "মাংস", href: "/category/mangsho" },
  { emoji: "🥛", name: "ডিম-দুধ", href: "/category/dim-dudh" },
  { emoji: "🌶️", name: "মসলা", href: "/category/moshla" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const today = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const isActive = (href: string) => {
    if (href === "/#সব-পণ্য") {
      return pathname === "/";
    }

    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      
      <div className="mx-auto container flex  items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="text-3xl sm:text-4xl">🛒</span>

          <span className="min-w-0">
            <span className="block text-xl font-extrabold tracking-tight text-emerald-800 sm:text-2xl">
              বাজার দর
            </span>

            <span className="block text-[10px] text-gray-500 sm:text-xs">
              {today}
            </span>
          </span>
        </Link>

       
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/signin"
            className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:px-4"
          >
            সাইন ইন
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-4"
          >
            সাইন আপ
          </Link>
        </div>

       
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-emerald-800 hover:bg-emerald-50 sm:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

     
      <nav className="hidden border-t border-gray-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 overflow-x-auto px-4 sm:gap-5 lg:gap-8">
          {categories.map((category) => {
            const active = isActive(category.href);

            return (
              <Link
                key={category.href}
                href={category.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-transparent text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white p-3 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const active = isActive(category.href);

              return (
                <Link
                  key={category.href}
                  href={category.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold ${
                    active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-100 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 sm:hidden">
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg border border-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-emerald-700"
            >
              সাইন ইন
            </Link>

            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              সাইন আপ
            </Link>
          </div>
        </nav>
      )}

      
      <PriceTicker />
    </header>
  );
}

function PriceTicker() {
  const tickerItems = [
    { emoji: "🍚", name: "চাল", price: "৬৫", unit: "কেজি", change: "২%", up: true },
    { emoji: "🍲", name: "ডাল", price: "১২০", unit: "কেজি", change: "১%", up: false },
    { emoji: "🛢️", name: "সয়াবিন তেল", price: "১৭৫", unit: "লিটার", change: "৩%", up: true },
    { emoji: "🥬", name: "সবজি", price: "৪০", unit: "কেজি", change: "২%", up: false },
    { emoji: "🥔", name: "আলু", price: "৩৫", unit: "কেজি", change: "১%", up: true },
  ];

  return (
    <div
      className="overflow-hidden border-t border-gray-100 bg-white py-2"
      aria-label="পণ্যের দাম"
    >
      <div className="ticker-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {tickerItems.map((item, index) => (
              <div
                key={`${copy}-${index}`}
                className="mx-4 flex shrink-0 items-center gap-1.5 text-sm"
              >
                <span>{item.emoji}</span>
                <span className="font-semibold text-gray-800">
                  {item.name}
                </span>
                <span className="text-gray-500">৳{item.price}/{item.unit}</span>
                <span
                  className={`font-bold ${
                    item.up ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {item.up ? "▲" : "▼"} {item.change}
                </span>
                <span className="ml-3 text-gray-300">|</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

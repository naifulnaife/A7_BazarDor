
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_BAZARDOR_API_URL ||
  "https://openapi.programming-hero.com/api/bazardor";

type Category = {
  id?: string | number;
  slug?: string;
  nameBn?: string;
  name?: string;
  icon?: string;
  emoji?: string;
  categoryIcon?: string;
};

type Product = {
  id: number | string;
  slug?: string;
  nameBn: string;
  category?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today: number;
  yesterday?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
};

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const obj = response as Record<string, unknown>;

  // Supports API responses such as { data: [...] }
  if (Array.isArray(obj.data)) {
    return obj.data as T[];
  }

  if (Array.isArray(obj.categories)) {
    return obj.categories as T[];
  }

  if (Array.isArray(obj.products)) {
    return obj.products as T[];
  }

  // Supports nested responses such as { data: { products: [...] } }
  if (obj.data && typeof obj.data === "object") {
    return extractArray<T>(obj.data);
  }

  return [];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 1,
  }).format(value);
}

function getUnit(unit?: string) {
  const units: Record<string, string> = {
    kg: "কেজি",
    kilogram: "কেজি",
    liter: "লিটার",
    litre: "লিটার",
    l: "লিটার",
    dozen: "ডজন",
    piece: "টি",
    pieces: "টি",
    gram: "গ্রাম",
    g: "গ্রাম",
  };

  return units[(unit || "kg").toLowerCase()] || unit || "কেজি";
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const today = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    let cancelled = false;

    async function fetchNavbarData() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products`),
        ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error("Failed to fetch categories or products");
        }

        const [categoryJson, productJson] = await Promise.all([
          categoryResponse.json(),
          productResponse.json(),
        ]);

        const categoryData = extractArray<Category>(categoryJson);
        const productData = extractArray<Product>(productJson);

        if (!cancelled) {
          setCategories(categoryData);
          setProducts(
            productData.filter(
              (product) =>
                product.nameBn &&
                typeof product.today === "number" &&
                Number.isFinite(product.today)
            )
          );
        }
      } catch (error) {
        console.error("Navbar API error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNavbarData();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryLinks = [
    {
      name: "সব পণ্য",
      emoji: "🛒",
      href: "/#সব-পণ্য",
    },
    ...categories
      .filter((category) => category.slug || category.id)
      .map((category) => {
        const slug = category.slug || String(category.id);

        return {
          name: category.nameBn || category.name || "ক্যাটাগরি",
          emoji:
            category.icon ||
            category.emoji ||
            category.categoryIcon ||
            "🛍️",
          href: `/category/${slug}`,
        };
      }),
  ];

  const isActive = (href: string) => {
    if (href === "/#সব-পণ্য") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
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
          {categoryLinks.map((category) => {
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

      {/* Mobile category navigation */}
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white p-3 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {categoryLinks.map((category) => {
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

      <PriceTicker products={products} loading={loading} />
    </header>
  );
}

function PriceTicker({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        className="overflow-hidden border-t border-gray-100 bg-white py-2 text-center text-sm text-gray-500"
        aria-label="পণ্যের দাম"
      >
        পণ্যের দাম লোড হচ্ছে...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="overflow-hidden border-t border-gray-100 bg-white py-2 text-center text-sm text-gray-500"
        aria-label="পণ্যের দাম"
      >
        পণ্যের দাম দেখানো যাচ্ছে না।
      </div>
    );
  }

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
            {products.map((item) => {
              const direction = item.change?.dir;
              const percentage = item.change?.pct ?? 0;
              const isUp = direction === "up";
              const isDown = direction === "down";

              return (
                <div
                  key={`${copy}-${item.id}`}
                  className="mx-4 flex shrink-0 items-center gap-1.5 text-sm"
                >
                  <span>
                    {item.categoryIcon || item.image || "🛒"}
                  </span>

                  <span className="font-semibold text-gray-800">
                    {item.nameBn}
                  </span>

                  <span className="text-gray-500">
                    ৳{formatNumber(item.today)}/{getUnit(item.unit)}
                  </span>

                  <span
                    className={`font-bold ${isUp ? "text-red-600" : isDown ? "text-emerald-700" : "text-gray-500" }`}>
                    {isUp ? "▲" : isDown ? "▼" : "–"}{" "}
                    {formatNumber(Math.abs(percentage))}%
                  </span>

                  <span className="ml-3 text-gray-300">|</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

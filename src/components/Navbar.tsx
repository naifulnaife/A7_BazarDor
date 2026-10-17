"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

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
  nameBn?: string;
  category?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today: number;
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

  for (const key of [
    "data",
    "categories",
    "products",
    "result",
  ]) {
    const value = obj[key];

    if (Array.isArray(value)) {
      return value as T[];
    }

    if (value && typeof value === "object") {
      const nested = extractArray<T>(value);

      if (nested.length > 0) {
        return nested;
      }
    }
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const {
    data: session,
    isPending: sessionLoading,
  } = authClient.useSession();

  const user = session?.user;

  const today = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Fetch categories and products
  useEffect(() => {
    const controller = new AbortController();

    async function fetchNavbarData() {
      try {
        const [categoryResponse, productResponse] =
          await Promise.all([
            fetch(`${API_BASE}/categories`, {
              signal: controller.signal,
            }),
            fetch(`${API_BASE}/products`, {
              signal: controller.signal,
            }),
          ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error("Could not fetch navbar data.");
        }

        const [categoryJson, productJson] = await Promise.all([
          categoryResponse.json(),
          productResponse.json(),
        ]);

        const categoryData =
          extractArray<Category>(categoryJson);

        const productData =
          extractArray<Product>(productJson);

        setCategories(
          categoryData.filter((category) => category.slug)
        );

        setProducts(
          productData.filter(
            (product) =>
              product.nameBn &&
              typeof product.today === "number" &&
              Number.isFinite(product.today)
          )
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error("Navbar API error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchNavbarData();

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(
          error.message || "সাইন আউট করা যায়নি।"
        );
        return;
      }

      setProfileOpen(false);
      setMenuOpen(false);

      toast.success("সফলভাবে লগআউট হয়েছে!");

      router.push("/signin");
      router.refresh();
    } catch {
      toast.error("লগআউট করার সময় সমস্যা হয়েছে।");
    } finally {
      setLogoutLoading(false);
    }
  }

  // Category navigation links
  const categoryLinks = [
    {
      name: "সব পণ্য",
      emoji: "🛒",
      href: "/#সব-পণ্য",
    },
    ...categories.map((category) => ({
      name: category.nameBn || category.name || "ক্যাটাগরি",
      emoji:
        category.icon ||
        category.emoji ||
        category.categoryIcon ||
        "🛍️",
      href: `/category/${category.slug}`,
    })),
  ];

  function isActive(href: string) {
    if (href === "/#সব-পণ্য") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      {/* Logo and desktop account buttons */}
      <div className="container mx-auto flex items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => {
            setMenuOpen(false);
            setProfileOpen(false);
          }}
          className="flex min-w-0 items-center gap-2"
        >
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

        {/* Desktop account section */}
        <div className="hidden items-center gap-2 sm:flex">
          {sessionLoading ? (
            <div
              className="animate-pulse rounded-lg bg-gray-100 h-9 w-28"
              aria-label="অ্যাকাউন্ট লোড হচ্ছে"
            />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((open) => !open)
                }
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="প্রোফাইল মেনু"
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gray-50"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <UserRound size={20} />
                  </span>
                )}

                <span className="max-w-32 truncate text-sm font-medium text-gray-800">
                  {user.name || user.email}
                </span>

                <ChevronDown
                  size={12}
                  className={`shrink-0 text-gray-500 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="z-[100] mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg absolute right-0 top-full">
                  <div className="px-2 py-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {user.name || "নাম দেওয়া হয়নি"}
                    </p>
                    <p className="mt-1 break-all text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="my-2 border-t border-gray-100" />

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <UserRound
                      size={16}
                      className="text-blue-600"
                    />
                    আমার প্রোফাইল
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span aria-hidden="true">↪</span>
                    {logoutLoading
                      ? "সাইন আউট হচ্ছে..."
                      : "সাইন আউট"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                সাইন ইন
              </Link>
              <Link
                href="/signup"
                className="rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                সাইন আপ
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((open) => !open);
            setProfileOpen(false);
          }}
          className="rounded-lg p-2 text-emerald-800 hover:bg-emerald-50 sm:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop category navigation */}
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

      {/* Mobile category menu */}
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

          {/* Mobile account section */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            {sessionLoading ? (
              <div
                className="animate-pulse rounded-lg bg-gray-100 h-10 w-full"
                aria-label="অ্যাকাউন্ট লোড হচ্ছে"
              />
            ) : user ? (
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((open) => !open)
                  }
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="প্রোফাইল মেনু"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gray-50 w-full border border-gray-100"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                      <UserRound size={20} />
                    </span>
                  )}

                  <span className="max-w-32 truncate text-sm font-medium text-gray-800">
                    {user.name || user.email}
                  </span>

                  <ChevronDown
                    size={12}
                    className={`shrink-0 text-gray-500 transition-transform ml-auto ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="z-[100] mt-2 w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg relative">
                    <div className="px-2 py-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {user.name || "নাম দেওয়া হয়নি"}
                      </p>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>

                    <div className="my-2 border-t border-gray-100" />

                    <Link
                      href="/profile"
                      onClick={() => {
                        setProfileOpen(false);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <UserRound
                        size={16}
                        className="text-blue-600"
                      />
                      আমার প্রোফাইল
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span aria-hidden="true">↪</span>
                      {logoutLoading
                        ? "সাইন আউট হচ্ছে..."
                        : "সাইন আউট"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-lg px-3 py-2.5 text-center text-sm font-semibold border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  সাইন ইন
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-lg px-3 py-2.5 text-center text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Scrolling product price ticker */}
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
      <div className="flex animate-pulse items-center justify-center gap-2 border-t border-gray-100 bg-white py-2 text-sm text-gray-500">
        <span className="h-3 w-24 rounded bg-gray-200" />
        <span>দাম লোড হচ্ছে...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="overflow-hidden border-t border-gray-100 bg-white py-2 text-center text-sm text-gray-500">
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
              const isUp = item.change?.dir === "up";
              const isDown = item.change?.dir === "down";

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
                    className={`font-bold ${
                      isUp
                        ? "text-red-600"
                        : isDown
                          ? "text-emerald-700"
                          : "text-gray-500"
                    }`}
                  >
                    {isUp ? "▲" : isDown ? "▼" : "–"}{" "}
                    {formatNumber(
                      Math.abs(item.change?.pct ?? 0)
                    )}
                    %
                  </span>

                  <span className="ml-3 text-gray-300">
                    |
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
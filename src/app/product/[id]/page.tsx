
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API_URL = "https://openapi.programming-hero.com/api/bazardor";

interface Market {
  market: string;
  division: string;
  min: number;
  max: number;
}

interface Product {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change: {
    dir: string;
    pct: number;
  };
  markets: Market[];
}

function bengaliNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: session, isPending } = authClient.useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (isPending || !session?.user || !id) return;

    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products/${id}`);

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
        }

        const result = await response.json();

        const item =
          result?.data?.product ??
          result?.data ??
          result?.product ??
          result;

        if (!item || Array.isArray(item) || item.id == null) {
          throw new Error("পণ্যটি খুঁজে পাওয়া যায়নি।");
        }

        if (!cancelled) {
          setProduct(item as Product);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "কিছু সমস্যা হয়েছে।"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id, session, isPending]);

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f5f0]">
        <p className="animate-pulse text-sm font-semibold text-green-700">
          লগইন যাচাই করা হচ্ছে...
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f5f0]">
        <p className="animate-pulse text-sm font-semibold text-green-700">
          পণ্যের তথ্য লোড হচ্ছে...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f5f0] ">
        <div className="rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] lg:p-30 p-20 text-center">
          <div className="text-7xl font-bold text-red-600">404</div>
          <h1 className="mt-4 text-xl font-bold text-[#263129]">
            পণ্য পাওয়া যায়নি
          </h1>
          <p className="mt-2 text-sm text-[#667168]">
            {error || "দুঃখিত, এই পণ্যটি পাওয়া যাচ্ছে না।"}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  const markets = product.markets ?? [];

  const minPrice =
    markets.length > 0
      ? Math.min(...markets.map((market) => market.min))
      : product.today;

  const maxPrice =
    markets.length > 0
      ? Math.max(...markets.map((market) => market.max))
      : product.today;

  const averagePrice =
    markets.length > 0
      ? markets.reduce(
          (total, market) => total + (market.min + market.max) / 2,
          0
        ) / markets.length
      : product.today;

  const isUp = product.change?.dir === "up";
  const isDown = product.change?.dir === "down";
const priceDifference = product.today - product.yesterday;
  return (
    <main className="min-h-screen bg-[#f0f5f0] px-3 py-5 text-[#263129] sm:px-5 sm:py-8">
      <div className="container mx-auto">
        <nav className="mb-4 flex items-center gap-2 text-xs text-[#667168]">
          <Link href="/" className="hover:text-green-700">
            হোম
          </Link>
          <span>›</span>
          <span>{product.categoryNameBn}</span>
          <span>›</span>
          <span className="truncate text-[#344138]">
            {product.nameBn}
          </span>
        </nav>

        <section className="rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f0f5f0] sm:h-14 sm:w-14">
              {product.image?.startsWith("http") ? (
                <Image
                  src={product.image}
                  alt={product.nameBn}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              ) : (
                <span className="text-2xl" role="img" aria-label={product.nameBn}>
                  {product.image || product.categoryIcon || "🛒"}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-base font-extrabold sm:text-xl">
                {product.nameBn}
              </h1>
              <p className="mt-1 text-xs text-[#778078]">
                প্রতি কেজি · {product.categoryNameBn}
              </p>
              <p className="mt-1 text-[10px] text-[#59655b]">
  {priceDifference > 0
    ? `গতকালের তুলনায় আজ দাম বেড়েছে · ${bengaliNumber(priceDifference)} টাকা`
    : priceDifference < 0
      ? `গতকালের তুলনায় আজ দাম কমেছে · ${bengaliNumber(Math.abs(priceDifference))} টাকা`
      : "গতকালের তুলনায় আজ দাম অপরিবর্তিত"}
</p>
            </div>

            <div className="shrink-0 rounded-lg bg-[#f0f5f0] px-3 py-2 text-center">
              <span className="text-[10px] text-[#778078]">
                বর্তমান দাম
              </span>
              <p className="text-xl font-extrabold">
                {bengaliNumber(product.today)}
              </p>
              <span className="text-[10px] text-[#667168]">
                টাকা / কেজি
              </span>
              <p
                className={`mt-1 text-xs font-bold ${
                  isUp
                    ? "text-red-600"
                    : isDown
                      ? "text-green-600"
                      : "text-gray-500"
                }`}
              >
                {isUp ? "▲" : isDown ? "▼" : "●"}{" "}
                {bengaliNumber(product.change?.pct ?? 0)}%
              </p>
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-3 sm:p-4">
          <h2 className="mb-3 text-sm font-bold">দামের সারসংক্ষেপ</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[#e6ece6] p-2 sm:p-3">
              <p className="text-[10px] text-[#667168]">সর্বনিম্ন দাম</p>
              <p className="mt-1 font-extrabold text-green-600">
                {bengaliNumber(minPrice)} টাকা
              </p>
              <p className="text-[10px] text-[#667168]">সবচেয়ে কম দামের বাজার</p>
            </div>
            <div className="rounded-lg border border-[#e6ece6] p-2 sm:p-3">
              <p className="text-[10px] text-[#667168]">সর্বোচ্চ দাম</p>
              <p className="mt-1 font-extrabold text-red-600">
                {bengaliNumber(maxPrice)} টাকা
              </p>
              <p className="text-[10px] text-[#667168]">সবচেয়ে বেশি দামের বাজার</p>
            </div>
            <div className="rounded-lg border border-[#e6ece6] p-2 sm:p-3">
              <p className="text-[10px] text-[#667168]">গড় দাম</p>
              <p className="mt-1 font-extrabold text-green-600">
                {bengaliNumber(averagePrice)} টাকা
              </p>
              <p className="text-[10px] text-[#667168]">প্রতি কেজি-এর হিসাবে</p>
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-3 sm:p-4">
          <h2 className="mb-3 text-sm font-bold">
            বাজারভিত্তিক আজকের দাম
          </h2>

          {markets.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#e6ece6]">
              <table className="w-full min-w-[460px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fbf8] text-[#667168]">
                    <th className="px-3 py-2 font-medium">বাজার</th>
                    <th className="px-3 py-2 font-medium">বিভাগ</th>
                    <th className="px-3 py-2 text-right font-medium">সর্বনিম্ন</th>
                    <th className="px-3 py-2 text-right font-medium">সর্বোচ্চ</th>
                    <th className="px-3 py-2 text-right font-medium">গড়</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market, index) => (
                    <tr
                      key={`${market.market}-${index}`}
                      className={`border-t border-[#dfe5df] ${
                        index % 2 === 0 ? "bg-[#f0f5f0]" : "bg-[#fbfdfb]"
                      }`}
                    >
                      <td className="whitespace-nowrap px-3 py-2">
                        {market.market}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {market.division}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        {bengaliNumber(market.min)} টাকা
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        {bengaliNumber(market.max)} টাকা
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        {bengaliNumber((market.min + market.max) / 2)} টাকা
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg bg-[#f0f5f0] px-3 py-5 text-center text-xs text-[#667168]">
              এই পণ্যের কোনো বাজারদরের তথ্য পাওয়া যায়নি।
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

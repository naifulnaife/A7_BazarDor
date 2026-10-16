
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";

const API_URL =
  "https://openapi.programming-hero.com/api/bazardor";

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
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/${id}`
        );

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

        setProduct(item as Product);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "কিছু সমস্যা হয়েছে।"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

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
      <main className="mx-auto flex min-h-screen flex-col items-center justify-center bg-[#f0f5f0] px-4 text-center">
        <div className="rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-8">
          <div className="text-5xl">🛒</div>

          <h1 className="mt-4 text-xl font-bold text-[#263129]">
            পণ্য পাওয়া যায়নি
          </h1>

          <p className="mt-2 text-sm text-[#667168]">
            {error || "দুঃখিত, এই পণ্যটি পাওয়া যাচ্ছে না।"}
          </p>

          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
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
          (total, market) =>
            total + (market.min + market.max) / 2,
          0
        ) / markets.length
      : product.today;

  const isUp = product.change?.dir === "up";
  const isDown = product.change?.dir === "down";

  return (
    <main className="min-h-screen bg-[#f0f5f0] px-3 py-5 text-[#263129] sm:px-5 sm:py-8">
      <div className="mx-auto container">

        
        <nav className="mb-4 flex items-center gap-2 text-[10px] text-[#667168] sm:text-xs">
          <Link href="/" className="transition hover:text-green-700">
            হোম
          </Link>
          <span>›</span>
          <Link href="/" className="transition hover:text-green-700">
            {product.categoryNameBn}
          </Link>
          <span>›</span>
          <span className="truncate text-[#344138]">
            {product.nameBn}
          </span>
        </nav>

       
        <section className="rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">

            
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f0f5f0] sm:h-14 sm:w-14">
              {product.image?.startsWith("http") ? (
                <Image
                  src={product.image}
                  alt={product.nameBn}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span
                  className="text-2xl"
                  role="img"
                  aria-label={product.nameBn}
                >
                  {product.image || product.categoryIcon || "🛒"}
                </span>
              )}
            </div>

            
            <div className="min-w-0 flex-1">
              <h1 className="line-clamp-1 text-base font-extrabold leading-6 sm:text-xl">
                {product.nameBn}
              </h1>

              <p className="mt-0.5 text-[10px] text-[#778078] sm:text-xs">
             প্রতি কেজি · {product.categoryNameBn}
              </p>

              <p className="mt-1 line-clamp-1 text-[9px] text-[#59655b] sm:text-[11px]">
                বর্তমান বাজারদর এবং মূল্য পরিবর্তন
              </p>
            </div>

           
            <div className="flex min-w-[62px] shrink-0 flex-col items-center justify-center rounded-lg bg-[#f0f5f0] px-2 py-2 sm:min-w-[76px] sm:px-3">
              <span className="text-[9px] text-[#778078] sm:text-[10px]">
                বর্তমান দাম
              </span>

              <strong className="mt-0.5 text-lg font-extrabold leading-5 sm:text-xl">
                {bengaliNumber(product.today)}
              </strong>

              <span className="mt-0.5 text-[9px] text-[#667168]">
              টাকা / কেজি
              </span>

              <span
                className={`mt-1 text-[9px] font-bold ${
                  isUp
                    ? "text-red-600"
                    : isDown
                      ? "text-green-600"
                      : "text-gray-500"
                }`}
              >
                {isUp ? "▲" : isDown ? "▼" : "●"}{" "}
                {bengaliNumber(product.change?.pct ?? 0)}%
              </span>
            </div>
          </div>
        </section>

        {/* দামের সারসংক্ষেপ */}
        <section className="mt-3 rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-3 sm:p-4">
          <h2 className="mb-3 text-xs font-bold sm:text-sm">
            দামের সারসংক্ষেপ
          </h2>

          <div className="grid grid-cols-3 gap-2">

            {/* সর্বনিম্ন দাম */}
            <div className="min-w-0 rounded-lg border border-[#e6ece6] p-2 sm:p-3">
              <p className="text-[9px] text-[#667168] sm:text-[10px]">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-1 text-sm font-extrabold text-green-600 sm:text-base">
                {bengaliNumber(minPrice)}{" "}
                <span className="text-[9px] font-medium">টাকা</span>
              </p>

              <p className="mt-1 text-[8px] text-[#667168] sm:text-[9px]">
                বাজারের সর্বনিম্ন মূল্য
              </p>
            </div>

            {/* সর্বোচ্চ দাম */}
            <div className="min-w-0 rounded-lg border border-[#e6ece6] p-2 sm:p-3">
              <p className="text-[9px] text-[#667168] sm:text-[10px]">
                সর্বোচ্চ দাম
              </p>

              <p className="mt-1 text-sm font-extrabold text-red-600 sm:text-base">
                {bengaliNumber(maxPrice)}{" "}
                <span className="text-[9px] font-medium">টাকা</span>
              </p>

              <p className="mt-1 text-[8px] text-[#667168] sm:text-[9px]">
                বাজারের সর্বোচ্চ মূল্য
              </p>
            </div>

            {/* গড় দাম */}
            <div className="min-w-0 rounded-lg border border-[#e6ece6] p-2 sm:p-3">
              <p className="text-[9px] text-[#667168] sm:text-[10px]">
                গড় দাম
              </p>

              <p className="mt-1 text-sm font-extrabold text-green-600 sm:text-base">
                {bengaliNumber(averagePrice)}{" "}
                <span className="text-[9px] font-medium">টাকা</span>
              </p>

              <p className="mt-1 text-[8px] text-[#667168] sm:text-[9px]">
                বাজারের গড় খুচরা মূল্য
              </p>
            </div>
          </div>
        </section>

        {/* বাজারভিত্তিক দাম */}
        <section className="mt-3 rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-3 sm:p-4">
          <h2 className="mb-3 text-xs font-bold sm:text-sm">
            বাজারভিত্তিক আজকের দাম
          </h2>

          {markets.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#e6ece6]">
              <table className="w-full min-w-[460px] border-collapse text-left text-[10px] sm:text-xs">
                <thead>
                  <tr className="bg-[#f8fbf8] text-[#667168]">
                    <th className="px-2 py-2 font-medium sm:px-3">
                      বাজার
                    </th>
                    <th className="px-2 py-2 font-medium sm:px-3">
                      বিভাগ
                    </th>
                    <th className="px-2 py-2 text-right font-medium sm:px-3">
                      সর্বনিম্ন
                    </th>
                    <th className="px-2 py-2 text-right font-medium sm:px-3">
                      সর্বোচ্চ
                    </th>
                    <th className="px-2 py-2 text-right font-medium sm:px-3">
                      গড়
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {markets.map((market, index) => (
                    <tr
                      key={`${market.market}-${index}`}
                      className={`border-t border-[#dfe5df] ${
                        index % 2 === 0
                          ? "bg-[#f0f5f0]"
                          : "bg-[#fbfdfb]"
                      }`}
                    >
                      <td className="whitespace-nowrap px-2 py-2 font-medium sm:px-3">
                        {market.market}
                      </td>

                      <td className="whitespace-nowrap px-2 py-2 text-[#59655b] sm:px-3">
                        {market.division}
                      </td>

                      <td className="whitespace-nowrap px-2 py-2 text-right sm:px-3">
                        {bengaliNumber(market.min)} টাকা
                      </td>

                      <td className="whitespace-nowrap px-2 py-2 text-right sm:px-3">
                        {bengaliNumber(market.max)} টাকা
                      </td>

                      <td className="whitespace-nowrap px-2 py-2 text-right sm:px-3">
                        {bengaliNumber(
                          (market.min + market.max) / 2
                        )}{" "}
                        টাকা
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

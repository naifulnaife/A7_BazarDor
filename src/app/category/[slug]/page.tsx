"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_BAZARDOR_API_URL ||
  "https://openapi.programming-hero.com/api/bazardor";

type SortOption = "default" | "low" | "high";

interface Category {
  id?: string | number;
  slug: string;
  nameBn?: string;
  name?: string;
  icon?: string;
  emoji?: string;
  categoryIcon?: string;
}

interface Product {
  id: string | number;
  slug?: string;
  nameBn: string;
  category: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today: number;
  yesterday?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
}

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

export default function CategoryPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    async function fetchCategoryData() {
      setLoading(true);
      setError(false);
      setProducts([]);
      setCategories([]);
      setSort("default");

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
          throw new Error("Failed to fetch category data.");
        }

        const [categoryJson, productJson] = await Promise.all([
          categoryResponse.json(),
          productResponse.json(),
        ]);

        const categoryData =
          extractArray<Category>(categoryJson);

        const productData =
          extractArray<Product>(productJson);

        if (
          !Array.isArray(categoryData) ||
          !Array.isArray(productData)
        ) {
          throw new Error("Invalid API response.");
        }

        setCategories(categoryData);
        setProducts(productData);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Category page API error:", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCategoryData();

    return () => controller.abort();
  }, [slug]);

  const category = categories.find(
    (item) => item.slug === slug
  );

  const categoryProducts = useMemo(() => {
    return products.filter(
      (product) =>
        String(product.category).toLowerCase() ===
        slug.toLowerCase()
    );
  }, [products, slug]);

  const sortedProducts = useMemo(() => {
    const result = [...categoryProducts];

    if (sort === "low") {
      result.sort((a, b) => a.today - b.today);
    } else if (sort === "high") {
      result.sort((a, b) => b.today - a.today);
    }

    return result;
  }, [categoryProducts, sort]);

  const categoryName =
    category?.nameBn ??
    category?.name ??
    categoryProducts[0]?.categoryNameBn ??
    "চাল";

  const categoryIcon =
    category?.icon ??
    category?.emoji ??
    category?.categoryIcon ??
    categoryProducts[0]?.categoryIcon ??
    "🍚";

  const invalidCategory =
    !loading &&
    (error || !category || categoryProducts.length === 0);

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-4 py-8 sm:px-6 lg:px-10 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Category Header Banner */}
        <section className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex animate-pulse items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-6 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-48 rounded bg-gray-100" />
              </div>
            </div>
          ) : !invalidCategory ? (
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl">
                {categoryIcon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {categoryName}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  {formatNumber(categoryProducts.length)}টি পণ্যের আজকের দাম ও পরিবর্তন
                </p>
              </div>
            </div>
          ) : null}
        </section>

        
        {!loading && !invalidCategory && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white px-6 py-4 shadow-sm">
            <div className="text-sm text-gray-500 invisible sm:visible">
            
            </div>
            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
              <span className="text-sm text-gray-600">
                সাজান
              </span>
              <select
                id="category-sort"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
              >
                <option value="default">ডিফল্ট</option>
                <option value="low">দাম: কম থেকে বেশি</option>
                <option value="high">দাম: বেশি থেকে কম</option>
              </select>
            </div>
          </div>
        )}

      
        {!loading && !invalidCategory && (
          <p className="mb-4 text-sm text-gray-600">
            মোট {formatNumber(categoryProducts.length)}টি পণ্য দেখানো হচ্ছে
          </p>
        )}

        
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

    
        {invalidCategory && (
          <section className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="text-5xl">🔎</div>
            <h2 className="mt-4 text-xl font-bold text-gray-800">
              {error ? "পণ্য লোড করা যায়নি" : "কোনো পণ্য পাওয়া যায়নি!"}
            </h2>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              হোম পেজে ফিরে যান
            </Link>
          </section>
        )}

        
        {!loading && !invalidCategory && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const isUp = product.change?.dir === "up";
  const isDown = product.change?.dir === "down";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail icon */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-3xl">
          {product.image || product.categoryIcon || "🍚"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-emerald-700">
            {product.nameBn}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            প্রতি {getUnit(product.unit)}
          </p>
        </div>
      </div>

      {/* Pricing and Change status */}
      <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-3">
        <div>
          <span className="text-[11px] text-gray-400 block">আজকের দাম</span>
          <span className="text-lg font-bold text-gray-900">
            {formatNumber(product.today)} <span className="text-sm font-normal text-gray-600">টাকা</span>
          </span>
        </div>

        {product.change && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
              isUp
                ? "text-red-600 bg-red-50/80"
                : isDown
                ? "text-emerald-700 bg-emerald-50/80"
                : "text-gray-600 bg-gray-100"
            }`}
          >
            {isUp ? "▲" : isDown ? "▼" : "–"}{" "}
            {formatNumber(Math.abs(product.change.pct ?? 0))}%
          </span>
        )}
      </div>
    </Link>
  );
}
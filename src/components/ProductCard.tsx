
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { Product } from "../types/product";

function bengaliNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const price = Number(
    product.today ?? product.currentPrice ?? product.price ?? 0
  );

  const change = Number(
    product.change?.pct ??
      product.changePercentage ??
      product.priceChange ??
      0
  );

  const image =
    product.image ?? product.emoji ?? product.categoryIcon ?? "🛒";

  const unit = product.unit ?? "কেজি";
  const name = product.nameBn ?? product.name ?? "পণ্যের নাম নেই";

  const changeStyle =
    change > 0
      ? "bg-red-50 text-red-600"
      : change < 0
        ? "bg-green-50 text-green-600"
        : "bg-gray-100 text-gray-500";

  const changeLabel =
    change > 0
      ? `▲ ${bengaliNumber(Math.abs(change))}%`
      : change < 0
        ? `▼ ${bengaliNumber(Math.abs(change))}%`
        : "— ০.০%";

  const isImageUrl =
    typeof image === "string" && /^https?:\/\//.test(image);

  function handleProductClick() {
    if (isPending) return;

    if (!session?.user) {
      router.push("/signin");
      return;
    }

    router.push(`/product/${product.id}`);
  }

  return (
    <button
      type="button"
      onClick={handleProductClick}
      disabled={isPending}
      aria-label={`বিস্তারিত দেখুন: ${name}`}
      className="group flex min-w-0 w-full flex-col justify-between rounded-2xl border border-[#dfe7df] bg-[#fbfdfb] p-3.5 text-left transition hover:border-emerald-300 hover:shadow-md disabled:cursor-wait sm:p-4"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0f5f0]">
          {isImageUrl ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="48px"
              unoptimized
              className="object-contain p-1.5"
            />
          ) : (
            <span className="text-2xl" role="img" aria-label={name}>
              {image}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-sm font-bold leading-5 text-[#202b23] group-hover:text-emerald-700 sm:text-base">
            {name}
          </h3>

          <p className="mt-0.5 text-xs text-[#667168]">
            প্রতি {unit.replace(/^প্রতি\s*/, "")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-[#59635b]">আজকের দাম</p>
          <p className="mt-0.5 text-base font-extrabold leading-6 text-[#202b23] sm:text-lg">
            {bengaliNumber(price)} টাকা
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold sm:text-xs ${changeStyle}`}
        >
          {changeLabel}
        </span>
      </div>
    </button>
  );
}

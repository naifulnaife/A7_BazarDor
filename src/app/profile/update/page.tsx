
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  const handleSignOut = async () => {
    const result = await authClient.signOut();

    if (result.error) {
      alert(result.error.message || "সাইন আউট করা যায়নি।");
      return;
    }

    router.replace("/signin");
    router.refresh();
  };

  if (isPending || !session) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">প্রোফাইল লোড হচ্ছে...</p>
      </main>
    );
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-green-700">
            বাজার দর
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            আমার প্রোফাইল
          </h1>
          <p className="mt-2 text-gray-600">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন এবং আপডেট করুন।
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User profile"}
                className="h-20 w-20 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
                <UserRound size={36} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-bold text-gray-900">
                {user.name || "নাম দেওয়া হয়নি"}
              </h2>
              <p className="mt-1 break-all text-sm text-gray-500">
                {user.email}
              </p>
              <p className="mt-2 text-sm text-green-700">
                আপনার অ্যাকাউন্ট
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} />
              সাইন আউট
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-gray-900">
            ব্যক্তিগত তথ্য
          </h2>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-gray-600">
              নাম
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800">
              {user.name || "নাম দেওয়া হয়নি"}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-600">
              ইমেইল
            </p>
            <div className="break-all rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800">
              {user.email}
            </div>
          </div>

          <Link
            href="/profile/update"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <Pencil size={17} />
            তথ্য আপডেট করুন
          </Link>
        </section>
      </div>
    </main>
  );
}

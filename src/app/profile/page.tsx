"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();

  const {
    data: session,
    isPending,
    refetch,
  } = authClient.useSession();

  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);


  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const updatedName = (
      name ?? session?.user?.name ?? ""
    ).trim();

    if (!updatedName) {
      toast.error("আপনার নাম লিখুন।");
      return;
    }

    if (updatedName === session?.user?.name) {
      toast.error("আপনি কোনো পরিবর্তন করেননি।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.updateUser({
        name: updatedName,
      });

      if (result.error) {
        toast.error(
          result.error.message || "নাম আপডেট করা যায়নি।"
        );
        return;
      }

      await refetch();


      setName(updatedName);

      toast.success("নাম সফলভাবে আপডেট হয়েছে!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("আপডেট করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }


  async function handleSignOut() {
    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.error(
          result.error.message || "সাইন আউট করা যায়নি।"
        );
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছে!");

      router.replace("/signin");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  if (isPending || !session) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          প্রোফাইল লোড হচ্ছে...
        </p>
      </main>
    );
  }

  const user = session.user;

  const displayedName = name ?? user.name ?? "";

  return (
    <main className="min-h-screen bg-[#f0f5f0] px-4 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            আমার প্রোফাইল
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন
          </p>
        </div>

        
        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User profile"}
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 shrink-0 rounded-2xl bg-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <UserRound size={36} />
              </div>
            )}

           
            <div className="min-w-0 flex-1">
              <h2 className="wrap-break-word text-xl font-semibold text-gray-900">
                {user.name || "নাম দেওয়া হয়নি"}
              </h2>

              <p className="mt-1 break-all text-sm text-gray-500">
                {user.email}
              </p>
            </div>

           
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              সাইন আউট
            </button>
          </div>
        </section>

        
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white/80 p-6 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900">
            তথ্য
          </h2>

          <form
            onSubmit={handleUpdate}
            className="mt-8 px-0 sm:px-5"
          >
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              নাম
            </label>

            <input
              id="name"
              type="text"
              value={displayedName}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              maxLength={100}
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !displayedName.trim() ||
                displayedName.trim() === (user.name ?? "")
              }
              className="mt-4 w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "আপডেট হচ্ছে..." : "আপডেট"}
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}

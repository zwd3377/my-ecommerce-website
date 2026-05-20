import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function Signup({ searchParams }: { searchParams: { message?: string } }) {
  const signUp = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return redirect("/signup?message=注册失败，请稍后重试");
    return redirect("/");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 p-8 sm:p-10">
          <div className="flex flex-col items-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl font-bold shadow-lg">
              ✨
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">创建账户</h1>
            <p className="mt-1 text-sm text-gray-500">加入我们，享受专属优惠</p>
          </div>

          <form action={signUp} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="至少 6 位"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
              />
            </div>

            {searchParams?.message && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {searchParams.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:shadow-xl active:scale-[0.98] transition-all"
            >
              注册
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            已有账户？
            <Link href="/login" className="ml-1 font-semibold text-purple-600 hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

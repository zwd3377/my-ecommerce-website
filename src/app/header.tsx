import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Header() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  // Cart item count (sum of quantities)
  let cartCount = 0;
  if (user) {
    const { data } = await supabase
      .from("cart")
      .select("quantity")
      .eq("user_id", user.id);
    cartCount = (data ?? []).reduce((s, r: any) => s + (r.quantity ?? 0), 0);
  }

  const signOut = async () => {
    "use server";
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return redirect("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
            S
          </span>
          <span className="text-lg font-bold text-gray-900 hidden sm:inline">我的商店</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
              <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.763.746-1.858 1.705l-1.262 12.62A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.858-2.42l-1.262-12.62A1.875 1.875 0 0018.487 6.75H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="animate-pop absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                >
                  <span>⚙️</span> 后台管理
                </Link>
              )}
              <Link
                href="/account/orders"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                我的订单
              </Link>
              <span className="hidden md:inline text-gray-500 truncate max-w-[160px]">
                你好，{user.email}
              </span>
              <form action={signOut}>
                <button className="py-1.5 px-3 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition-colors text-sm">
                  退出
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="py-1.5 px-4 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/signup"
                className="py-1.5 px-4 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow hover:shadow-md transition-shadow"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="text-center">
        <p className="text-9xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
          哎呀，页面走丢了
        </h1>
        <p className="mt-3 text-gray-500">您访问的页面不存在或已被移除。</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            返回首页
          </Link>
          <Link
            href="/cart"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all"
          >
            查看购物车
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

interface OrderSuccessPageProps {
  params: { orderId: string };
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 p-8 sm:p-12 text-center">
          {/* Animated check */}
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200 animate-pop">
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p className="mt-6 text-sm font-semibold text-emerald-600 uppercase tracking-wide">
            下单成功
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            感谢您的购买 🎉
          </h1>
          <p className="mt-3 text-gray-500">
            我们已经收到您的订单，正在为您加紧处理。
          </p>

          <div className="mt-8 rounded-2xl bg-gray-50 p-5 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">订单号</p>
            <p className="mt-1 text-xl font-bold text-gray-900 font-mono">#{params.orderId}</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-lg">📦</div>
              <p className="mt-1 font-medium">已确认</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-lg">🚚</div>
              <p className="mt-1 font-medium">待发货</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-lg">🏠</div>
              <p className="mt-1 font-medium">待签收</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/account/orders/${params.orderId}`}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98] transition-all"
            >
              查看订单详情
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              继续购物
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

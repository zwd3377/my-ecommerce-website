import Link from 'next/link';

interface OrderSuccessPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">下单成功</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            感谢您的购买！
          </h1>
          <p className="mt-2 text-base text-gray-500">
            我们已经收到了您的订单，正在为您处理。
          </p>
          <p className="mt-6 text-lg font-medium text-gray-700">
            您的订单号是: <span className="font-bold text-gray-900">{params.orderId}</span>
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              返回首页
            </Link>
            {/* In the future, we can add a link to a 'My Orders' page */}
            {/* <Link href="/account/orders" className="text-sm font-semibold text-gray-900">
              查看我的订单 <span aria-hidden="true">&rarr;</span>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
import { formatCurrency } from '@/lib/prices'

type OrderPayProps = {
  order: {
    order_number?: string
    package_type?: string
    currency?: string
    amount?: number
  }
}

export default function OrderPay({ order }: OrderPayProps) {
  const amountText = order.amount
    ? formatCurrency(order.amount, order.currency || 'USD')
    : 'Amount unavailable'

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-lg">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">Order summary</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Order #{order.order_number || 'N/A'}</h2>
      </div>

      <div className="space-y-4 text-slate-700">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Package</p>
          <p className="mt-1 font-semibold text-slate-900">{order.package_type || 'Standard'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{amountText}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-blue-50 p-5 text-slate-700">
        <p className="font-semibold text-slate-900">Payment integration is currently disabled</p>
        <p className="mt-2 text-sm leading-6">
          We have removed the previous checkout flow. Your order has been created and will be processed manually.
          Please contact support for payment instructions or if you have any questions.
        </p>
        <p className="mt-4 text-sm text-slate-600">Support: <a href="mailto:info@carreaders.com" className="font-medium text-blue-600 underline">info@carreaders.com</a></p>
      </div>
    </div>
  )
}

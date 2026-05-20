type Status = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const map: Record<Status, { label: string; cls: string; icon: string }> = {
  pending:    { label: '待处理', cls: 'bg-amber-100 text-amber-700 ring-amber-200',     icon: '⏳' },
  processing: { label: '处理中', cls: 'bg-blue-100 text-blue-700 ring-blue-200',         icon: '🔧' },
  shipped:    { label: '已发货', cls: 'bg-indigo-100 text-indigo-700 ring-indigo-200',   icon: '🚚' },
  delivered:  { label: '已送达', cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200',icon: '✅' },
  cancelled:  { label: '已取消', cls: 'bg-gray-100 text-gray-600 ring-gray-200',         icon: '✕' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = (status as Status) in map ? (status as Status) : 'pending';
  const info = map[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${info.cls}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}

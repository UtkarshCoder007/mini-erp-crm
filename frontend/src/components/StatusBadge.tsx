const statusStyles: Record<string, string> = {
  // customer statuses
  lead: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  // challan statuses
  draft: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.draft;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {status}
    </span>
  );
}
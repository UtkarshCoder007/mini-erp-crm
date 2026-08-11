export default function StatCard({
  label,
  value,
  sublabel,
  accent = 'text-white',
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-semibold ${accent}`}>{value}</p>
      {sublabel && <p className="text-gray-500 text-xs mt-1">{sublabel}</p>}
    </div>
  );
}
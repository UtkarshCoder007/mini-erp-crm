import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboard';
import type { DashboardStats } from '../api/dashboard';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Customers"
          value={stats.customers.total}
          sublabel={`${stats.customers.active} active · ${stats.customers.leads} leads`}
        />
        <StatCard
          label="Total Products"
          value={stats.products.total}
          sublabel={`${stats.products.lowStock} low stock`}
          accent={stats.products.lowStock > 0 ? 'text-amber-400' : 'text-white'}
        />
        <StatCard
          label="Total Challans"
          value={stats.challans.total}
          sublabel={`${stats.challans.confirmed} confirmed`}
        />
        <StatCard
          label="Draft Challans"
          value={stats.challans.draft}
          sublabel="Awaiting confirmation"
          accent={stats.challans.draft > 0 ? 'text-blue-400' : 'text-white'}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Challans</h2>
        <button onClick={() => navigate('/challans')} className="text-sm text-blue-400 hover:text-blue-300">
          View all →
        </button>
      </div>

      <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#22262F] text-gray-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Challan #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentChallans.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/challans/${c.id}`)}
                className="border-t border-[#2A2E38] cursor-pointer hover:bg-[#22262F]/50"
              >
                <td className="px-4 py-3 text-gray-200">{c.challan_number}</td>
                <td className="px-4 py-3 text-gray-200">{c.customer_name}</td>
                <td className="px-4 py-3 text-gray-200">{c.total_quantity}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-gray-200">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {stats.recentChallans.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={5}>No challans yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
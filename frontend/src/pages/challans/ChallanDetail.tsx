import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChallan, confirmChallan, cancelChallan, deleteChallan, getInvoicePdfUrl } from '../../api/challans';
import type { Challan } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/Button';

export default function ChallanDetail() {
  const { id } = useParams();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setChallan(await getChallan(Number(id)));
  }

  async function handleConfirm() {
    setError('');
    setActionLoading(true);
    try {
      await confirmChallan(Number(id));
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setError('');
    setActionLoading(true);
    try {
      await cancelChallan(Number(id));
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this draft challan? This cannot be undone.')) return;
    await deleteChallan(Number(id));
    navigate('/challans');
  }

  if (!challan) return <p className="text-gray-400">Loading...</p>;

  const grandTotal = challan.items.reduce((sum, item) => sum + Number(item.line_total), 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{challan.challan_number}</h1>
          <div className="mt-1"><StatusBadge status={challan.status} /></div>
        </div>
        <div className="flex gap-2">
          <a href={getInvoicePdfUrl(challan.id)} target="_blank" rel="noreferrer">
            <Button variant="secondary">View Invoice</Button>
          </a>
          {challan.status === 'draft' && (
            <>
              <Button onClick={handleConfirm} disabled={actionLoading}>Confirm</Button>
              <Button variant="danger" onClick={handleCancel} disabled={actionLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </>
          )}
          {challan.status === 'confirmed' && (
            <Button variant="danger" onClick={handleCancel} disabled={actionLoading}>Cancel Challan</Button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-gray-500">Customer</p><p className="text-white">{challan.customer_name}</p></div>
        <div><p className="text-gray-500">Mobile</p><p className="text-white">{challan.customer_mobile}</p></div>
        <div><p className="text-gray-500">Created</p><p className="text-white">{new Date(challan.created_at).toLocaleString()}</p></div>
        {challan.confirmed_at && (
          <div><p className="text-gray-500">Confirmed</p><p className="text-white">{new Date(challan.confirmed_at).toLocaleString()}</p></div>
        )}
        {challan.cancelled_at && (
          <div><p className="text-gray-500">Cancelled</p><p className="text-white">{new Date(challan.cancelled_at).toLocaleString()}</p></div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-white mb-3">Items</h2>
      <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-[#22262F] text-gray-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit Price</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item) => (
              <tr key={item.id} className="border-t border-[#2A2E38]">
                <td className="px-4 py-3 text-gray-200">{item.product_name_snap}</td>
                <td className="px-4 py-3 text-gray-200">{item.product_sku_snap}</td>
                <td className="px-4 py-3 text-gray-200">{item.quantity}</td>
                <td className="px-4 py-3 text-gray-200">₹{Number(item.unit_price_snap).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-200">₹{Number(item.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right text-white">
        <p className="text-sm text-gray-400">Total Quantity: {challan.total_quantity}</p>
        <p className="text-lg font-semibold">Grand Total: ₹{grandTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
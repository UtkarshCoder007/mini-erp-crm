import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallans } from '../../api/challans';
import type { Challan } from '../../types';
import { Table, THead, TRow, TH, TD } from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Select } from '../../components/Input';

export default function ChallanList() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [status]);

  async function load() {
    setLoading(true);
    const res = await getChallans({ status: status || undefined });
    setChallans(res.data);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Challans</h1>
        <Button onClick={() => navigate('/challans/new')}>+ New Challan</Button>
      </div>

      <div className="mb-4 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TH>Challan #</TH>
              <TH>Customer</TH>
              <TH>Qty</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </TRow>
          </THead>
          <tbody>
            {challans.map((c) => (
              <TRow key={c.id} onClick={() => navigate(`/challans/${c.id}`)}>
                <TD>{c.challan_number}</TD>
                <TD>{c.customer_name}</TD>
                <TD>{c.total_quantity}</TD>
                <TD><StatusBadge status={c.status} /></TD>
                <TD>{new Date(c.created_at).toLocaleDateString()}</TD>
              </TRow>
            ))}
            {challans.length === 0 && <TRow><TD>No challans found</TD></TRow>}
          </tbody>
        </Table>
      )}
    </div>
  );
}
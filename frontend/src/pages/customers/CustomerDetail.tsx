import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomer, getFollowups, addFollowup } from '../../api/customers';
import type { Customer } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Textarea } from '../../components/Input';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const c = await getCustomer(Number(id));
    setCustomer(c);
    const f = await getFollowups(Number(id));
    setFollowups(f);
  }

  async function handleAddFollowup(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await addFollowup(Number(id), note);
    setNote('');
    load();
  }

  if (!customer) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{customer.name}</h1>
          <div className="mt-1"><StatusBadge status={customer.status} /></div>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/customers/${id}/edit`)}>Edit</Button>
      </div>

      <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-gray-500">Mobile</p><p className="text-white">{customer.mobile}</p></div>
        <div><p className="text-gray-500">Email</p><p className="text-white">{customer.email || '-'}</p></div>
        <div><p className="text-gray-500">Business Name</p><p className="text-white">{customer.business_name || '-'}</p></div>
        <div><p className="text-gray-500">GST Number</p><p className="text-white">{customer.gst_number || '-'}</p></div>
        <div><p className="text-gray-500">Type</p><p className="text-white capitalize">{customer.customer_type}</p></div>
        <div><p className="text-gray-500">Follow-up Date</p><p className="text-white">{customer.follow_up_date?.split('T')[0] || '-'}</p></div>
        <div className="col-span-2"><p className="text-gray-500">Address</p><p className="text-white">{customer.address || '-'}</p></div>
        <div className="col-span-2"><p className="text-gray-500">Notes</p><p className="text-white">{customer.notes || '-'}</p></div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-3">Follow-ups</h2>

      <form onSubmit={handleAddFollowup} className="mb-4 flex gap-2">
        <Textarea rows={1} placeholder="Add a follow-up note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit">Add</Button>
      </form>

      <div className="space-y-2">
        {followups.map((f) => (
          <div key={f.id} className="bg-[#1A1D24] border border-[#2A2E38] rounded-lg p-3">
            <p className="text-white text-sm">{f.note}</p>
            <p className="text-gray-500 text-xs mt-1">
              {f.created_by_name} · {new Date(f.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        {followups.length === 0 && <p className="text-gray-500 text-sm">No follow-ups yet.</p>}
      </div>
    </div>
  );
}
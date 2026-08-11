import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../api/customers';
import type { Customer } from '../../types';
import { Table, THead, TRow, TH, TD } from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [search]);

  async function load() {
    setLoading(true);
    const res = await getCustomers({ search: search || undefined });
    setCustomers(res.data);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <Button onClick={() => navigate('/customers/new')}>+ Add Customer</Button>
      </div>

      <div className="mb-4 max-w-xs">
        <Input placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TH>Name</TH>
              <TH>Mobile</TH>
              <TH>Business</TH>
              <TH>Type</TH>
              <TH>Status</TH>
            </TRow>
          </THead>
          <tbody>
            {customers.map((c) => (
              <TRow key={c.id} onClick={() => navigate(`/customers/${c.id}`)}>
                <TD>{c.name}</TD>
                <TD>{c.mobile}</TD>
                <TD>{c.business_name || '-'}</TD>
                <TD className="capitalize">{c.customer_type}</TD>
                <TD><StatusBadge status={c.status} /></TD>
              </TRow>
            ))}
            {customers.length === 0 && (
              <TRow><TD>No customers found</TD></TRow>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
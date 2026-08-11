import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../api/customers';
import { getProducts } from '../../api/products';
import { createChallan } from '../../api/challans';
import type { Customer, Product } from '../../types';
import { Field, Select, Input } from '../../components/Input';
import { Button } from '../../components/Button';

interface LineItem {
  product_id: number;
  quantity: number;
}

export default function ChallanForm() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product_id: 0, quantity: 1 }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCustomers({}).then((r) => setCustomers(r.data));
    getProducts({}).then((r) => setProducts(r.data));
  }, []);

  function updateItem(index: number, field: keyof LineItem, value: number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { product_id: 0, quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (!customerId || validItems.length === 0) {
      setError('Select a customer and at least one valid product line.');
      return;
    }

    setLoading(true);
    try {
      const challan = await createChallan(Number(customerId), validItems);
      navigate(`/challans/${challan.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-6">New Challan</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-6">
        <Field label="Customer *">
          <Select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
            ))}
          </Select>
        </Field>

        <div>
          <p className="text-sm text-gray-300 mb-2">Items *</p>
          <div className="space-y-2">
            {items.length > 0 && (
  <div className="flex gap-2 items-center mb-1">
    <p className="flex-1 text-xs text-gray-500">Product</p>
    <p className="w-16 shrink-0 text-xs text-gray-500">Qty</p>
    {items.length > 1 && <div className="w-9" />}
  </div>
)}
{items.map((item, idx) => (
  <div key={idx} className="flex gap-2 items-center mb-2">
    <Select
      value={item.product_id || ''}
      onChange={(e) => updateItem(idx, 'product_id', Number(e.target.value))}
      className="flex-1 min-w-0"
    >
      <option value="">Select product</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
      ))}
    </Select>
    <Input
      type="number"
      min={1}
      value={item.quantity}
      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
      className="!w-16 shrink-0"
    />
    {items.length > 1 && (
      <Button type="button" variant="ghost" onClick={() => removeItem(idx)}>✕</Button>
    )}
  </div>
))}
          </div>
          <Button type="button" variant="secondary" className="mt-2" onClick={addItem}>+ Add Item</Button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Draft Challan'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
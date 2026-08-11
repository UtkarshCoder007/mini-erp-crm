import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct, getStockMovements, addStockMovement } from '../../api/products';
import type { Product } from '../../types';
import { Field, Input, Select } from '../../components/Input';
import { Button } from '../../components/Button';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [form, setForm] = useState({ quantity: '', movement_type: 'IN' as 'IN' | 'OUT', reason: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setProduct(await getProduct(Number(id)));
    setMovements(await getStockMovements(Number(id)));
  }

  async function handleAddMovement(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await addStockMovement(Number(id), {
        quantity: parseInt(form.quantity), movement_type: form.movement_type, reason: form.reason,
      });
      setForm({ quantity: '', movement_type: 'IN', reason: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  if (!product) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-white mb-1">{product.name}</h1>
      <p className="text-gray-500 text-sm mb-6">SKU: {product.sku}</p>

      <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-6 mb-6 grid grid-cols-3 gap-4 text-sm">
        <div><p className="text-gray-500">Category</p><p className="text-white">{product.category || '-'}</p></div>
        <div><p className="text-gray-500">Unit Price</p><p className="text-white">₹{Number(product.unit_price).toFixed(2)}</p></div>
        <div><p className="text-gray-500">Location</p><p className="text-white">{product.warehouse_location || '-'}</p></div>
        <div>
          <p className="text-gray-500">Current Stock</p>
          <p className={`font-semibold ${product.current_stock <= product.min_stock_alert ? 'text-amber-400' : 'text-white'}`}>
            {product.current_stock}
          </p>
        </div>
        <div><p className="text-gray-500">Min Alert</p><p className="text-white">{product.min_stock_alert}</p></div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-3">Adjust Stock</h2>
      <form onSubmit={handleAddMovement} className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-4 mb-6 flex gap-3 items-end">
        <Field label="Type">
          <Select value={form.movement_type} onChange={(e) => setForm({ ...form, movement_type: e.target.value as 'IN' | 'OUT' })}>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </Select>
        </Field>
        <Field label="Quantity">
          <Input type="number" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        </Field>
        <Field label="Reason">
          <Input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </Field>
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <h2 className="text-lg font-semibold text-white mb-3">Movement History</h2>
      <div className="space-y-2">
        {movements.map((m) => (
          <div key={m.id} className="bg-[#1A1D24] border border-[#2A2E38] rounded-lg p-3 flex justify-between text-sm">
            <div>
              <span className={m.movement_type === 'IN' ? 'text-green-400' : 'text-red-400'}>{m.movement_type}</span>
              <span className="text-white ml-2">{m.quantity} units — {m.reason}</span>
            </div>
            <p className="text-gray-500 text-xs">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
        {movements.length === 0 && <p className="text-gray-500 text-sm">No movements yet.</p>}
      </div>
    </div>
  );
}
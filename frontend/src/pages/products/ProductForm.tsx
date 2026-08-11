import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../api/products';
import { Field, Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function ProductForm() {
  const [form, setForm] = useState({
    name: '', sku: '', category: '', unit_price: '', current_stock: '0', min_stock_alert: '0', warehouse_location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const created = await createProduct({
        name: form.name, sku: form.sku, category: form.category || undefined,
        unit_price: parseFloat(form.unit_price), current_stock: parseInt(form.current_stock),
        min_stock_alert: parseInt(form.min_stock_alert), warehouse_location: form.warehouse_location || undefined,
      });
      navigate(`/products/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-white mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-6">
        <Field label="Name *"><Input required value={form.name} onChange={(e) => update('name', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU *"><Input required value={form.sku} onChange={(e) => update('sku', e.target.value)} /></Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => update('category', e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Unit Price *"><Input required type="number" step="0.01" value={form.unit_price} onChange={(e) => update('unit_price', e.target.value)} /></Field>
          <Field label="Initial Stock"><Input type="number" value={form.current_stock} onChange={(e) => update('current_stock', e.target.value)} /></Field>
          <Field label="Min Stock Alert"><Input type="number" value={form.min_stock_alert} onChange={(e) => update('min_stock_alert', e.target.value)} /></Field>
        </div>
        <Field label="Warehouse Location"><Input value={form.warehouse_location} onChange={(e) => update('warehouse_location', e.target.value)} /></Field>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
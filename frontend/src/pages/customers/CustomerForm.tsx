import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, updateCustomer, getCustomer } from '../../api/customers';
import type { Customer } from '../../types';
import { Field, Input, Select, Textarea } from '../../components/Input';
import { Button } from '../../components/Button';

const emptyForm = {
  name: '', mobile: '', email: '', business_name: '', gst_number: '',
  customer_type: 'retail' as Customer['customer_type'],
  address: '', status: 'lead' as Customer['status'],
  follow_up_date: '', notes: '',
};

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      getCustomer(Number(id)).then((c) =>
        setForm({
          name: c.name, mobile: c.mobile, email: c.email || '', business_name: c.business_name || '',
          gst_number: c.gst_number || '', customer_type: c.customer_type, address: c.address || '',
          status: c.status, follow_up_date: c.follow_up_date?.split('T')[0] || '', notes: c.notes || '',
        })
      );
    }
  }, [id]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateCustomer(Number(id), form);
        navigate(`/customers/${id}`);
      } else {
        const created = await createCustomer(form);
        navigate(`/customers/${created.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-6">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1A1D24] border border-[#2A2E38] rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name *">
            <Input required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </Field>
          <Field label="Mobile *">
            <Input required value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </Field>
          <Field label="Business Name">
            <Input value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="GST Number">
            <Input value={form.gst_number} onChange={(e) => update('gst_number', e.target.value)} />
          </Field>
          <Field label="Customer Type *">
            <Select value={form.customer_type} onChange={(e) => update('customer_type', e.target.value)}>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="distributor">Distributor</option>
            </Select>
          </Field>
          <Field label="Status *">
            <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>

        <Field label="Address">
          <Textarea rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
        </Field>

        <Field label="Follow-up Date">
          <Input type="date" value={form.follow_up_date} onChange={(e) => update('follow_up_date', e.target.value)} />
        </Field>

        <Field label="Notes">
          <Textarea rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </Field>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Customer'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
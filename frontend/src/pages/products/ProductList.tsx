import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products';
import type { Product } from '../../types';
import { Table, THead, TRow, TH, TD } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [search]);

  async function load() {
    setLoading(true);
    const res = await getProducts({ search: search || undefined });
    setProducts(res.data);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Products</h1>
        <Button onClick={() => navigate('/products/new')}>+ Add Product</Button>
      </div>

      <div className="mb-4 max-w-xs">
        <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TH>Name</TH>
              <TH>SKU</TH>
              <TH>Category</TH>
              <TH>Price</TH>
              <TH>Stock</TH>
              <TH>Location</TH>
            </TRow>
          </THead>
          <tbody>
            {products.map((p) => (
              <TRow key={p.id} onClick={() => navigate(`/products/${p.id}`)}>
                <TD>{p.name}</TD>
                <TD>{p.sku}</TD>
                <TD>{p.category || '-'}</TD>
                <TD>₹{Number(p.unit_price).toFixed(2)}</TD>
                <TD>
                  <span className={p.current_stock <= p.min_stock_alert ? 'text-amber-400 font-medium' : ''}>
                    {p.current_stock}
                  </span>
                </TD>
                <TD>{p.warehouse_location || '-'}</TD>
              </TRow>
            ))}
            {products.length === 0 && <TRow><TD>No products found</TD></TRow>}
          </tbody>
        </Table>
      )}
    </div>
  );
}
import { pool } from '../../config/db';
import { PoolClient } from 'pg';

export async function getProducts(page: number, limit: number, search?: string, category?: string) {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR sku ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (category) {
    conditions.push(`category = $${idx}`);
    values.push(category);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  return { products: dataResult.rows, total };
}

export async function getProductById(id: number) {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getLowStockProducts() {
  const result = await pool.query('SELECT * FROM products WHERE current_stock <= min_stock_alert ORDER BY current_stock ASC');
  return result.rows;
}

export async function createProduct(data: any) {
  const { name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_location } = data;
  const result = await pool.query(
    `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_location)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, sku, category, unit_price, current_stock || 0, min_stock_alert || 0, warehouse_location]
  );
  return result.rows[0];
}

export async function updateProduct(id: number, data: any) {
  const { name, category, unit_price, min_stock_alert, warehouse_location } = data;
  // Note: sku and current_stock intentionally excluded — sku shouldn't change,
  // stock should only change via movements, never a direct edit
  const result = await pool.query(
    `UPDATE products SET name=$1, category=$2, unit_price=$3, min_stock_alert=$4, warehouse_location=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [name, category, unit_price, min_stock_alert, warehouse_location, id]
  );
  return result.rows[0] || null;
}

export async function addStockMovement(
  productId: number,
  quantity: number,
  movementType: 'IN' | 'OUT',
  reason: string,
  createdBy: number
) {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const productResult = await client.query('SELECT current_stock FROM products WHERE id = $1 FOR UPDATE', [productId]);
    if (productResult.rows.length === 0) {
      throw { status: 404, message: 'Product not found' };
    }

    const currentStock = productResult.rows[0].current_stock;
    const newStock = movementType === 'IN' ? currentStock + quantity : currentStock - quantity;

    if (newStock < 0) {
      throw { status: 400, message: `Insufficient stock. Available: ${currentStock}, requested OUT: ${quantity}` };
    }

    await client.query('UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2', [newStock, productId]);

    const movementResult = await client.query(
      `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, reference_type, created_by)
       VALUES ($1,$2,$3,$4,'manual',$5) RETURNING *`,
      [productId, quantity, movementType, reason, createdBy]
    );

    await client.query('COMMIT');
    return movementResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getStockMovements(productId: number, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT m.*, u.name as created_by_name FROM stock_movements m
     LEFT JOIN users u ON m.created_by = u.id
     WHERE product_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [productId, limit, offset]
  );
  return result.rows;
}
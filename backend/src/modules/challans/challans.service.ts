import { pool } from '../../config/db';
import { PoolClient } from 'pg';

interface ChallanItemInput {
  product_id: number;
  quantity: number;
}

// Generates challan numbers like CH-2026-0001, sequential per year
async function generateChallanNumber(client: PoolClient): Promise<string> {
  const year = new Date().getFullYear();
  const result = await client.query(
    `SELECT challan_number FROM challans WHERE challan_number LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`CH-${year}-%`]
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNumber = result.rows[0].challan_number as string;
    const lastSeq = parseInt(lastNumber.split('-')[2], 10);
    nextSeq = lastSeq + 1;
  }

  return `CH-${year}-${String(nextSeq).padStart(4, '0')}`;
}

export async function getChallans(page: number, limit: number, status?: string, customerId?: number) {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (status) {
    conditions.push(`c.status = $${idx}`);
    values.push(status);
    idx++;
  }
  if (customerId) {
    conditions.push(`c.customer_id = $${idx}`);
    values.push(customerId);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM challans c ${whereClause}`, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    `SELECT c.*, cust.name as customer_name FROM challans c
     JOIN customers cust ON c.customer_id = cust.id
     ${whereClause} ORDER BY c.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  return { challans: dataResult.rows, total };
}

export async function getChallanById(id: number) {
  const challanResult = await pool.query(
    `SELECT c.*, cust.name as customer_name, cust.mobile as customer_mobile, cust.address as customer_address
     FROM challans c JOIN customers cust ON c.customer_id = cust.id WHERE c.id = $1`,
    [id]
  );

  if (challanResult.rows.length === 0) return null;

  const itemsResult = await pool.query('SELECT * FROM challan_items WHERE challan_id = $1', [id]);

  return { ...challanResult.rows[0], items: itemsResult.rows };
}

export async function createChallan(customerId: number, items: ChallanItemInput[], createdBy: number) {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify customer exists
    const customerCheck = await client.query('SELECT id FROM customers WHERE id = $1', [customerId]);
    if (customerCheck.rows.length === 0) {
      throw { status: 404, message: 'Customer not found' };
    }

    const challanNumber = await generateChallanNumber(client);

    let totalQuantity = 0;
    const itemRows: any[] = [];

    // Fetch live product data to build snapshots — does NOT touch stock yet (that only happens on confirm)
    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (productResult.rows.length === 0) {
        throw { status: 404, message: `Product with id ${item.product_id} not found` };
      }
      const product = productResult.rows[0];
      const lineTotal = parseFloat(product.unit_price) * item.quantity;

      itemRows.push({
        product_id: product.id,
        product_name_snap: product.name,
        product_sku_snap: product.sku,
        unit_price_snap: product.unit_price,
        quantity: item.quantity,
        line_total: lineTotal,
      });

      totalQuantity += item.quantity;
    }

    const challanResult = await client.query(
      `INSERT INTO challans (challan_number, customer_id, status, total_quantity, created_by)
       VALUES ($1, $2, 'draft', $3, $4) RETURNING *`,
      [challanNumber, customerId, totalQuantity, createdBy]
    );
    const challan = challanResult.rows[0];

    for (const row of itemRows) {
      await client.query(
        `INSERT INTO challan_items
          (challan_id, product_id, product_name_snap, product_sku_snap, unit_price_snap, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [challan.id, row.product_id, row.product_name_snap, row.product_sku_snap, row.unit_price_snap, row.quantity, row.line_total]
      );
    }

    await client.query('COMMIT');
    return getChallanById(challan.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function confirmChallan(challanId: number, confirmedBy: number) {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const challanResult = await client.query('SELECT * FROM challans WHERE id = $1 FOR UPDATE', [challanId]);
    if (challanResult.rows.length === 0) {
      throw { status: 404, message: 'Challan not found' };
    }
    const challan = challanResult.rows[0];

    if (challan.status !== 'draft') {
      throw { status: 409, message: `Cannot confirm a challan with status '${challan.status}'` };
    }

    const itemsResult = await client.query('SELECT * FROM challan_items WHERE challan_id = $1', [challanId]);
    const items = itemsResult.rows;

    // Lock all relevant product rows first, then validate stock for ALL items
    // before deducting any — prevents partial deduction if one item fails
    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.product_id]);
      const product = productResult.rows[0];

      if (!product) {
        throw { status: 404, message: `Product ${item.product_name_snap} no longer exists` };
      }
      if (product.current_stock < item.quantity) {
        throw {
          status: 400,
          message: `Insufficient stock for ${item.product_name_snap}. Available: ${product.current_stock}, required: ${item.quantity}`,
        };
      }
    }

    // All checks passed — deduct stock and log movements
    for (const item of items) {
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, reference_type, reference_id, created_by)
         VALUES ($1, $2, 'OUT', $3, 'challan', $4, $5)`,
        [item.product_id, item.quantity, `Sales Challan ${challan.challan_number}`, challanId, confirmedBy]
      );
    }

    await client.query(
      `UPDATE challans SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1`,
      [challanId]
    );

    await client.query('COMMIT');
    return getChallanById(challanId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function cancelChallan(challanId: number, cancelledBy: number) {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const challanResult = await client.query('SELECT * FROM challans WHERE id = $1 FOR UPDATE', [challanId]);
    if (challanResult.rows.length === 0) {
      throw { status: 404, message: 'Challan not found' };
    }
    const challan = challanResult.rows[0];

    if (challan.status === 'cancelled') {
      throw { status: 409, message: 'Challan is already cancelled' };
    }

    // If it was Confirmed, reverse the stock movements (Option B behavior)
    if (challan.status === 'confirmed') {
      const itemsResult = await client.query('SELECT * FROM challan_items WHERE challan_id = $1', [challanId]);
      const items = itemsResult.rows;

      for (const item of items) {
        await client.query(
          'UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.product_id]
        );

        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, reference_type, reference_id, created_by)
           VALUES ($1, $2, 'IN', $3, 'cancellation', $4, $5)`,
          [item.product_id, item.quantity, `Cancelled Challan ${challan.challan_number}`, challanId, cancelledBy]
        );
      }
    }
    // If it was Draft, no stock was ever touched — just flip status, no reversal needed

    await client.query(`UPDATE challans SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1`, [challanId]);

    await client.query('COMMIT');
    return getChallanById(challanId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteDraftChallan(challanId: number) {
  const result = await pool.query(
    `DELETE FROM challans WHERE id = $1 AND status = 'draft' RETURNING id`,
    [challanId]
  );
  return result.rows.length > 0;
}
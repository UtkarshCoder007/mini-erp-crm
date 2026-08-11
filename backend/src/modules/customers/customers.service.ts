import { pool } from '../../config/db';

export async function getCustomers(page: number, limit: number, search?: string, status?: string) {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR mobile ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (status) {
    conditions.push(`status = $${idx}`);
    values.push(status);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM customers ${whereClause}`, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  return { customers: dataResult.rows, total };
}

export async function getCustomerById(id: number) {
  const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createCustomer(data: any, createdBy: number) {
  const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = data;

  const result = await pool.query(
    `INSERT INTO customers
      (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [name, mobile, email, business_name, gst_number, customer_type, address, status || 'lead', follow_up_date, notes, createdBy]
  );

  return result.rows[0];
}

export async function updateCustomer(id: number, data: any) {
  const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = data;

  const result = await pool.query(
    `UPDATE customers SET
      name=$1, mobile=$2, email=$3, business_name=$4, gst_number=$5,
      customer_type=$6, address=$7, status=$8, follow_up_date=$9, notes=$10,
      updated_at=NOW()
     WHERE id=$11
     RETURNING *`,
    [name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, id]
  );

  return result.rows[0] || null;
}

export async function addFollowup(customerId: number, note: string, createdBy: number) {
  const result = await pool.query(
    `INSERT INTO customer_followups (customer_id, note, created_by) VALUES ($1, $2, $3) RETURNING *`,
    [customerId, note, createdBy]
  );
  return result.rows[0];
}

export async function getFollowups(customerId: number, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT f.*, u.name as created_by_name FROM customer_followups f
     LEFT JOIN users u ON f.created_by = u.id
     WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [customerId, limit, offset]
  );
  return result.rows;
}
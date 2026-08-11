import { pool } from '../../config/db';

export async function getDashboardStats() {
  const [
    customerCounts,
    productCounts,
    challanCounts,
    recentChallans,
  ] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'lead') AS leads,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'inactive') AS inactive
      FROM customers
    `),
    pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE current_stock <= min_stock_alert) AS low_stock
      FROM products
    `),
    pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
      FROM challans
    `),
    pool.query(`
      SELECT c.id, c.challan_number, c.status, c.total_quantity, c.created_at, cust.name AS customer_name
      FROM challans c
      JOIN customers cust ON c.customer_id = cust.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `),
  ]);

  return {
    customers: {
      total: parseInt(customerCounts.rows[0].total, 10),
      leads: parseInt(customerCounts.rows[0].leads, 10),
      active: parseInt(customerCounts.rows[0].active, 10),
      inactive: parseInt(customerCounts.rows[0].inactive, 10),
    },
    products: {
      total: parseInt(productCounts.rows[0].total, 10),
      lowStock: parseInt(productCounts.rows[0].low_stock, 10),
    },
    challans: {
      total: parseInt(challanCounts.rows[0].total, 10),
      draft: parseInt(challanCounts.rows[0].draft, 10),
      confirmed: parseInt(challanCounts.rows[0].confirmed, 10),
      cancelled: parseInt(challanCounts.rows[0].cancelled, 10),
    },
    recentChallans: recentChallans.rows,
  };
}
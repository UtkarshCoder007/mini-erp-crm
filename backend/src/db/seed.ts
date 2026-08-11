import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from '../config/db';

dotenv.config();

const users = [
  { name: 'Admin User', email: 'admin@erp.test', password: 'admin123', role: 'admin' },
  { name: 'Sales User', email: 'sales@erp.test', password: 'sales123', role: 'sales' },
  { name: 'Warehouse User', email: 'warehouse@erp.test', password: 'warehouse123', role: 'warehouse' },
  { name: 'Accounts User', email: 'accounts@erp.test', password: 'accounts123', role: 'accounts' },
];

async function seed() {
  for (const u of users) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
    if (existing.rows.length > 0) {
      console.log(`Skipping ${u.email} — already exists`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [u.name, u.email, hash, u.role]
    );
    console.log(`Created ${u.email}`);
  }

  console.log('Seeding complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
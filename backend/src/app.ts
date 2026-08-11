import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customers.routes';
import productRoutes from './modules/products/products.routes';
import challanRoutes from './modules/challans/challans.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes'; 

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mini-erp-crm-six-pi.vercel.app',
  ],
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/challans', challanRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
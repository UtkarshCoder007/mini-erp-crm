# Mini ERP + CRM — API Documentation

Base URL (local): `http://localhost:4000`
Base URL (production): `https://mini-erp-crm-04e1.onrender.com`

All endpoints except `POST /auth/login` require a JWT in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Response format

**Success:**
```json
{ "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 42 } }
```
`meta` is only present on paginated list endpoints.

**Error:**
```json
{ "error": "message", "details": { ... } }
```
`details` is only present on validation errors.

## Status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no content (e.g. delete) |
| 400 | Validation error / bad request (e.g. insufficient stock) |
| 401 | Missing/invalid/expired JWT |
| 403 | Authenticated, but role not permitted for this action |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate SKU, invalid status transition) |
| 500 | Unhandled server error |

## Roles

`admin`, `sales`, `warehouse`, `accounts`. Each endpoint below lists which roles may access it beyond authentication alone.

---

## Auth

### POST /auth/login
Public.
```json
// Request
{ "email": "admin@erp.test", "password": "admin123" }

// Response 200
{ "data": { "token": "...", "user": { "id": 1, "name": "Admin User", "email": "admin@erp.test", "role": "admin" } } }
```
`401` on invalid credentials.

### GET /auth/me
Any authenticated user. Returns the current user's profile.
```json
{ "data": { "id": 1, "name": "Admin User", "email": "admin@erp.test", "role": "admin" } }
```

---

## Customers

### GET /customers
Any role. Query params: `page`, `limit`, `search` (matches name/mobile), `status` (`lead`/`active`/`inactive`).
```json
{ "data": [ { "id": 1, "name": "Sharma Traders", "mobile": "9876543210", "status": "active", ... } ], "meta": { "page": 1, "limit": 20, "total": 3 } }
```

### GET /customers/:id
Any role. Returns full customer record.

### POST /customers
`admin`, `sales`.
```json
{
  "name": "Sharma Traders",
  "mobile": "9876543210",
  "email": "sharma@traders.com",
  "business_name": "Sharma Traders Pvt Ltd",
  "gst_number": "29ABCDE1234F1Z5",
  "customer_type": "wholesale",
  "address": "45 Market Yard Road, Bangalore",
  "status": "active",
  "follow_up_date": "2026-08-20",
  "notes": "Regular bulk buyer"
}
```
`customer_type`: `retail` | `wholesale` | `distributor`. `status`: `lead` | `active` | `inactive` (defaults to `lead`).

### PUT /customers/:id
`admin`, `sales`. Same body shape as POST.

### POST /customers/:id/followups
`admin`, `sales`.
```json
{ "note": "Called, confirmed order for next week" }
```

### GET /customers/:id/followups
Any role. Query params: `page`, `limit`.

---

## Products

### GET /products
Any role. Query params: `page`, `limit`, `search` (name/SKU), `category`.

### GET /products/low-stock
Any role. Returns products where `current_stock <= min_stock_alert`, no pagination.

### GET /products/:id
Any role.

### POST /products
`admin`, `warehouse`.
```json
{
  "name": "Steel Rod 10mm",
  "sku": "SR-10MM",
  "category": "Steel",
  "unit_price": 475.00,
  "current_stock": 200,
  "min_stock_alert": 30,
  "warehouse_location": "A1"
}
```
`409` if SKU already exists.

### PUT /products/:id
`admin`, `warehouse`. Same body minus `sku` and `current_stock` — both are locked; stock changes must go through the stock-movements endpoint, and SKU is immutable once created.

### POST /products/:id/stock-movements
`admin`, `warehouse`. Manually adjusts stock (e.g. new delivery, damage write-off).
```json
{ "quantity": 50, "movement_type": "IN", "reason": "New stock delivery" }
```
`movement_type`: `IN` | `OUT`. `400` if an `OUT` would take stock negative.

### GET /products/:id/stock-movements
Any role. Query params: `page`, `limit`. Full audit history for that product.

---

## Challans

### GET /challans
Any role. Query params: `page`, `limit`, `status` (`draft`/`confirmed`/`cancelled`), `customer_id`.

### GET /challans/:id
Any role. Returns challan header + line items (with product snapshot fields).

### POST /challans
`admin`, `sales`. Creates a **Draft**. Stock is not touched at this stage.
```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 20 },
    { "product_id": 2, "quantity": 50 }
  ]
}
```
Server auto-generates `challan_number` (e.g. `CH-2026-0001`), snapshots product name/SKU/price at creation time, and computes line totals + total quantity.

### POST /challans/:id/confirm
`admin`, `sales`, `warehouse`. Transitions Draft → Confirmed. Validates stock for **all** items first; if any item has insufficient stock, the whole confirm fails and nothing is deducted (`400`, names the short product). On success, deducts stock and logs a `stock_movements` entry per item. `409` if challan isn't currently Draft.

### POST /challans/:id/cancel
`admin`, `sales`, `warehouse`. Two behaviors depending on current status:
- **Draft → Cancelled**: no stock effect.
- **Confirmed → Cancelled**: reverses the original deduction — stock is added back and a new `stock_movements` IN entry is logged.
`409` if already Cancelled.

### DELETE /challans/:id
`admin`, `sales`. Only permitted while status is Draft (hard delete). `409` otherwise. Returns `204` on success.

### GET /challans/:id/invoice-pdf
`admin`, `sales`, `accounts`. Generates and streams a PDF invoice on demand — not stored anywhere, regenerated fresh on each request.

---

## Example end-to-end flow

1. `POST /auth/login` → get token
2. `POST /customers` → create a customer
3. `POST /products` (x2) → create products
4. `POST /challans` → create a Draft challan referencing the customer + products
5. `POST /challans/:id/confirm` → stock deducts
6. `GET /challans/:id/invoice-pdf` → download invoice
7. `POST /challans/:id/cancel` (optional) → stock restores
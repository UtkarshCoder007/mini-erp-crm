-- =========================
-- USERS (Auth + Roles)
-- =========================
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'warehouse', 'accounts');

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- CUSTOMERS (CRM)
-- =========================
CREATE TYPE customer_type AS ENUM ('retail', 'wholesale', 'distributor');
CREATE TYPE customer_status AS ENUM ('lead', 'active', 'inactive');

CREATE TABLE customers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    mobile          VARCHAR(15) NOT NULL,
    email           VARCHAR(150),
    business_name   VARCHAR(150),
    gst_number      VARCHAR(20),
    customer_type   customer_type NOT NULL,
    address         TEXT,
    status          customer_status NOT NULL DEFAULT 'lead',
    follow_up_date  DATE,
    notes           TEXT,
    created_by      INTEGER REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_followups (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note            TEXT NOT NULL,
    created_by      INTEGER REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- PRODUCTS (ERP master data)
-- =========================
CREATE TABLE products (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    sku                 VARCHAR(50) UNIQUE NOT NULL,
    category            VARCHAR(100),
    unit_price          NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    current_stock       INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_alert     INTEGER NOT NULL DEFAULT 0,
    warehouse_location  VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- STOCK MOVEMENTS (audit log)
-- =========================
CREATE TYPE movement_type AS ENUM ('IN', 'OUT');

CREATE TABLE stock_movements (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    movement_type   movement_type NOT NULL,
    reason          VARCHAR(255) NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    INTEGER,
    created_by      INTEGER REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- CHALLANS (ERP transaction header)
-- =========================
CREATE TYPE challan_status AS ENUM ('draft', 'confirmed', 'cancelled');

CREATE TABLE challans (
    id              SERIAL PRIMARY KEY,
    challan_number  VARCHAR(30) UNIQUE NOT NULL,
    customer_id     INTEGER NOT NULL REFERENCES customers(id),
    status          challan_status NOT NULL DEFAULT 'draft',
    total_quantity  INTEGER NOT NULL DEFAULT 0,
    created_by      INTEGER REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    confirmed_at    TIMESTAMP,
    cancelled_at    TIMESTAMP
);

-- =========================
-- CHALLAN ITEMS (line items, WITH product snapshot)
-- =========================
CREATE TABLE challan_items (
    id                  SERIAL PRIMARY KEY,
    challan_id          INTEGER NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
    product_id          INTEGER NOT NULL REFERENCES products(id),
    product_name_snap   VARCHAR(150) NOT NULL,
    product_sku_snap    VARCHAR(50) NOT NULL,
    unit_price_snap     NUMERIC(12, 2) NOT NULL,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    line_total          NUMERIC(12, 2) NOT NULL
);

-- =========================
-- Helpful indexes
-- =========================
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_challans_customer ON challans(customer_id);
CREATE INDEX idx_challans_status ON challans(status);
CREATE INDEX idx_challan_items_challan ON challan_items(challan_id);
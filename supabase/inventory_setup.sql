-- Medux Hospital ERP - Inventory Management Tables

-- Create items table
CREATE TABLE items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(category_id),
    supplier_id UUID REFERENCES suppliers(supplier_id),
    unit VARCHAR(50) NOT NULL,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    reorder_point INTEGER,
    unit_cost DECIMAL(10,2),
    qr_code VARCHAR(255),
    location_id UUID REFERENCES locations(location_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(category_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('warehouse', 'pharmacy', 'department', 'storage')),
    parent_id UUID REFERENCES locations(location_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create suppliers table
CREATE TABLE suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_movements table
CREATE TABLE stock_movements (
    movement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(item_id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'transfer', 'adjustment')),
    quantity INTEGER NOT NULL,
    from_location_id UUID REFERENCES locations(location_id),
    to_location_id UUID REFERENCES locations(location_id),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_number VARCHAR(100),
    notes TEXT,
    performed_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create current_stock view
CREATE OR REPLACE VIEW current_stock AS
SELECT 
    i.item_id,
    i.name as item_name,
    i.sku,
    c.name as category_name,
    l.name as location_name,
    COALESCE(SUM(CASE 
        WHEN sm.type = 'stock_in' THEN sm.quantity
        WHEN sm.type = 'stock_out' THEN -sm.quantity
        WHEN sm.type = 'adjustment' THEN sm.quantity
        WHEN sm.type = 'transfer' AND sm.to_location_id = i.location_id THEN sm.quantity
        WHEN sm.type = 'transfer' AND sm.from_location_id = i.location_id THEN -sm.quantity
    END), 0) as current_quantity,
    i.unit,
    i.minimum_stock,
    i.reorder_point,
    i.maximum_stock
FROM items i
LEFT JOIN categories c ON i.category_id = c.category_id
LEFT JOIN locations l ON i.location_id = l.location_id
LEFT JOIN stock_movements sm ON i.item_id = sm.item_id
WHERE i.is_active = true
GROUP BY i.item_id, i.name, i.sku, c.name, l.name;

-- Create indexes for performance
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_supplier ON items(supplier_id);
CREATE INDEX idx_items_location ON items(location_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for items
CREATE POLICY "Items are viewable by authenticated users" ON items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Items are editable by inventory officers and admins" ON items
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'inventory_officer'));

-- Create policies for categories
CREATE POLICY "Categories are viewable by authenticated users" ON categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Categories are editable by inventory officers and admins" ON categories
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'inventory_officer'));

-- Create policies for locations
CREATE POLICY "Locations are viewable by authenticated users" ON locations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Locations are editable by inventory officers and admins" ON locations
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'inventory_officer'));

-- Create policies for suppliers
CREATE POLICY "Suppliers are viewable by authenticated users" ON suppliers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Suppliers are editable by inventory officers and admins" ON suppliers
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'inventory_officer'));

-- Create policies for stock_movements
CREATE POLICY "Stock movements are viewable by authenticated users" ON stock_movements
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Stock movements are editable by inventory officers and admins" ON stock_movements
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'inventory_officer'));
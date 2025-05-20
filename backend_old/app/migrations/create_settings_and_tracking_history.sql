-- Create settings table
CREATE TABLE IF NOT EXISTS setting (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL
);

-- Create tracking_history table
CREATE TABLE IF NOT EXISTS tracking_history (
    id SERIAL PRIMARY KEY,
    tracking_code VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(255) NOT NULL,
    success BOOLEAN DEFAULT TRUE NOT NULL,
    user_id INTEGER,
    details TEXT
);

-- Create index on tracking_code
CREATE INDEX IF NOT EXISTS idx_tracking_history_tracking_code ON tracking_history(tracking_code);

-- Create index on timestamp
CREATE INDEX IF NOT EXISTS idx_tracking_history_timestamp ON tracking_history(timestamp);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_tracking_history_user_id ON tracking_history(user_id);

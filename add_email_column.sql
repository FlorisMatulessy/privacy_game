-- Add email column to users table
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE AFTER username;

-- Optional: Add index for faster lookups
CREATE INDEX idx_email ON users(email);

-- Update existing users with placeholder emails (optional, for testing)
-- UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;

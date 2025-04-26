-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  userpassword VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bookings table
CREATE TABLE IF NOT EXISTS Bookings (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  orderid VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES Users(username) ON DELETE CASCADE
);

-- Insert a test user
INSERT INTO Users (username, userpassword)
VALUES ('testuser', 'testpassword')
ON CONFLICT (username) DO NOTHING; 
-- PEED Database Initialization Script
-- This script will be run when the PostgreSQL container starts

-- Create database if it doesn't exist (Docker handles this)
-- CREATE DATABASE peed_db;

-- Connect to the database
\c peed_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE peed_db TO postgres;

-- Create indexes for better performance
-- These will be created after tables are created by SQLAlchemy

-- Success message
SELECT 'PEED Database initialized successfully!' AS message; 
CREATE DATABASE jsa_database;

USE jsa_database;

-- Eboard members table
CREATE TABLE eboard_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100),
  password_hash VARCHAR(255),
  role VARCHAR(50)
);

-- Events table
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(255),
  event_date DATETIME,
  event_location VARCHAR(255),
  event_description TEXT,
  registration_status ENUM('open', 'closed') DEFAULT 'open'
);

-- Members table
CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(100),
  message TEXT,
  registered_events TEXT -- store event IDs as a comma-separated string
);

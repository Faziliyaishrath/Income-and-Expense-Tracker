-- databasefile.sql

CREATE DATABASE expense_tracker;
USE expense_tracker;

SHOW TABLES;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    budget FLOAT,
    icon VARCHAR(50),
    color VARCHAR(20)
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(10),
    amount FLOAT,
    description VARCHAR(255),
    category_id INT,
    date DATE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    target FLOAT,
    saved FLOAT,
    date DATE
);
INSERT INTO categories (name, budget, icon, color) VALUES
('Food', 300, 'fa-utensils', '#FF6384'),
('Transportation', 150, 'fa-car', '#36A2EB'),
('Housing', 1000, 'fa-home', '#FFCE56'),
('Entertainment', 100, 'fa-film', '#4BC0C0'),
('Shopping', 200, 'fa-shopping-cart', '#9966FF'),
('Income', 0, 'fa-money-bill-wave', '#00CC99');
DROP TABLE category;
DROP TABLE goal;
DROP TABLE transaction;
select * from transactions;
select * from goals;
select * from categories;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);
drop table users;
ALTER TABLE transactions ADD user_id INT;
ALTER TABLE goals ADD user_id INT;

ALTER TABLE transactions 
ADD FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE goals 
ADD FOREIGN KEY (user_id) REFERENCES users(id);
select * from users;
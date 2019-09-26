DROP DATABASE IF EXISTS books_app;
create database books_app;
\c books_app;

DROP TABLE IF EXISTS books;

CREATE TABLE books(
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
book_id VARCHAR(255),
image_url VARCHAR(255),
summary VARCHAR(255)

);
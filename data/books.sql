DROP DATABASE IF EXISTS books_app;
create database if not exists books_app;
\c books_app;

DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books(

id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn VARCHAR(255),
image_url VARCHAR(255),
summary VARCHAR(255)

);
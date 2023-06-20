CREATE DATABASE IF NOT EXISTS api_rest_symfony;
USE api_rest_symfony;

CREATE TABLE users(
id 				INT(255) AUTO_INCREMENT NOT NULL,
name           VARCHAR(50) NOT NULL,
surname        VARCHAR(150),
email          VARCHAR(255) NOT NULL,
password       VARCHAR(255) NOT NULL,
role           VARCHAR(20),
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT pk_users PRIMARY KEY(id)
)ENGINE=InnoDb;

CREATE TABLE videos(
id 				INT(255) AUTO_INCREMENT NOT NULL,
user_id        INT(255) NOT NULL,
title          VARCHAR(255) NOT NULL,
description    TEXT,
url            VARCHAR(255) NOT NULL,
status         VARCHAR(50),
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,	
CONSTRAINT pk_videos PRIMARY KEY(id),
CONSTRAINT fk_videos_users FOREIGN KEY(user_id) REFERENCES users(id)
)ENGINE=InnoDb;
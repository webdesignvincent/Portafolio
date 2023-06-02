/*CATEGORY*/
por iniciar
en progreso
estancado
finalizado

to start
in progress
stagnant
finished

/*DROP*/
DROP TABLE tasks;
DROP TABLE projects;
DROP TABLE users;
DROP TABLE clients;
DROP DATABASE symfony_sisgespro;

/*CREATE DATABASE AND TABLE*/
CREATE DATABASE IF NOT EXISTS symfony_sisgespro;
USE symfony_sisgespro;

CREATE TABLE IF NOT EXISTS users(
id          int(255) auto_increment not null,
role        varchar(50),
name        varchar(100),
surname     varchar(200),
email       varchar(255),
password    varchar(255),
image       varchar(255),
created_at  datetime,
CONSTRAINT pk_users PRIMARY KEY(id)
)ENGINE=InnoDb;

CREATE TABLE IF NOT EXISTS clients(
id  int(255) auto_increment not null,
company_name varchar(50),
ntdide varchar(50),
phone  varchar(50),
contact varchar(100),
image   varchar(255),
created_at  datetime,
CONSTRAINT pk_clients PRIMARY KEY(id)
)ENGINE=InnoDb;

CREATE TABLE IF NOT EXISTS projects(
id          int(255) auto_increment not null,
client_id     int(255) not null,
creator_user  int(255) not null,
project_name varchar(255),
content     text,
phase       varchar(20),
start_date  datetime,
end_date    datetime,
priority    varchar(20),
project_budget int(255),
created_at  datetime,
CONSTRAINT pk_projects PRIMARY KEY(id),
CONSTRAINT fk_clients FOREIGN KEY(client_id) REFERENCES clients(id)
)ENGINE=InnoDb;

CREATE TABLE IF NOT EXISTS tasks(
id          int(255) auto_increment not null,
project_id  int(255) not null,
user_id     int(255) not null,
title       varchar(255),
content     text,
priority    varchar(20),
phase       varchar(20),
hours       int(100),
created_at  datetime,
CONSTRAINT pk_tasks PRIMARY KEY(id),
CONSTRAINT fk_projects FOREIGN KEY(project_id) REFERENCES projects(id),
CONSTRAINT fk_users FOREIGN KEY(user_id) REFERENCES users(id)
)ENGINE=InnoDb;

/*INSERT USERS*/
INSERT INTO users VALUES(NULL, 'ROLE_USER', 'Víctor', 'Robles', 'victor@victor.com', '$2y$04$98P/6gSWxXD82L.micM9r.PLd4Zmjj5VnxkoWDdbrgCxoSVBeqADa', NULL, CURTIME());

/*INSERT CLIENTS*/
INSERT INTO clients VALUES(NULL, 'Unidad Educativa Clemencia Clark Arias', '0928954163', '0986344153', 'Oscar Montalvan Ronquillo', NULL, CURTIME());

/*INSERT PROJECTS*/
INSERT INTO projects VALUES(NULL, 1, 1, 'Sistema Automatizar El Proceso de Matriculacion E Ingreso de Notas de la Escuela Clemencia Clark Arias - UECCA', 'Sistema para la automatizacion del Proceso de Matriculacion e Ingreso de Notas de la Escuela Clemencia Clark Arias', 'to start', CURTIME(), CURTIME(), 'high', 1000, CURTIME());

/*INSERT TASKS*/
INSERT INTO tasks VALUES(NULL, 1,1, 'Maquetar el Header', 'Maquetacion del Header del Proyecto UECCA', 'high', 'to start', 2, CURTIME());
INSERT INTO tasks VALUES(NULL, 1, 1, 'Maquetar el main', 'Maquetacion del Main del Proyecto UECCA', 'high', 'to start', 2, CURTIME());
INSERT INTO tasks VALUES(NULL, 1, 1, 'Maquetar el Footer', 'Maquetacion del Footer del Proyecto UECCA', 'low', 'to start', 1, CURTIME());
INSERT INTO tasks VALUES(NULL, 1, 1, 'Aplicar CSS al Proyecto', 'Mejorar el diseño del Proyecto UECCA', 'high', 'to start', 4, CURTIME());

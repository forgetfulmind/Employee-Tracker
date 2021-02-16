CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT,
  dept_name VARCHAR(30),
  primary key(id)
);

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL, 
  department_id INT,
  primary key(id)
);

CREATE TABLE employees (
   id INT NOT NULL AUTO_INCREMENT,
   first_name VARCHAR(30), 
   last_name VARCHAR(30), 
   role_id INT, 
   manager_id INT,
   primary key(id)
);


INSERT INTO departments
(dept_name)
VALUES 
("Sales"), 
("Support"), 
("Marketing");

INSERT INTO roles
(title, salary, department_id)
VALUES 
("Sales Manager", 80000, 1), 
("Marketing Coordinator", 45000, 3), 
("Support Technician", 50000, 2),
("Sales Person", 60000, 1);

INSERT INTO employees
(first_name, last_name, role_id)
VALUES 
("Cam", "Pickle", 1), 
("Paper", "Bryan", 2), 
("John", "Powell", 3);

INSERT INTO employees
(first_name, last_name, role_id, manager_id)
VALUES 
("Jim", "Armstrong", 4, 1);



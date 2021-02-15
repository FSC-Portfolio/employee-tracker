DROP DATABASE IF EXISTS emp_tracker_db;

CREATE DATABASE emp_tracker_db;

USE emp_tracker_db;

CREATE TABLE department (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL(10,2),
    department_id INT,
    FOREIGN KEY(department_id) REFERENCES department(id)
);

CREATE TABLE employee (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    FOREIGN KEY(role_id) REFERENCES role(id),
    FOREIGN KEY(manager_id) REFERENCES employee(id)
);

USE emp_tracker_db;

INSERT INTO department(name)
	VALUES
		("Commercial"),
        ("Construction")
;

INSERT INTO role (title, salary, department_id)
	VALUES
		("Project Manager", 50000.00, 1),
		("Commercial Manager", 50000.00, 1),
		("Construction Manager", 50000.00, 2)
;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
	VALUES
		("Ralph", "Wiggum", 1, NULL),
		("Homer", "Simpson", 2, 1),
		("Bart", "Simpson", 3, 1)
;
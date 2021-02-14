USE emp_tracker_db;

INSERT INTO department(name)
	VALUES
		("Commercial"),
        ("Survey"),
        ("Construction")
;

INSERT INTO role (title, salary, department_id)
	VALUES
		("Quantity Surveyor", 30000.00, 1),
		("Commercial Manager", 50000.00, 1),
		("Surveyor", 60000.00, 2),
		("Survey Technician", 20000.00, 2),
		("Project Manager", 60000.00, 3),
		("Superintendent", 50000.00, 3),
		("Operator", 20000.00, 3)
;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
	VALUES
		("Ralph", "Wiggum", 5, NULL),
		("Homer", "Simpson", 6, 1),
		("Bart", "Simpson", 7, 2),
		("Lisa", "Simpson", 2, 1),
		("Marge", "Simpson", 1, 4),
		("Chief", "Wiggum", 3, 5),
		("Krusty", "Clown", 4, 3)
;
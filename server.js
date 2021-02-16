"use strict";
// Script requirements.
const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

// Script Constants.
const ADD_DEPT = "Add Department";
const ADD_ROLE = "Add Role";
const ADD_EMP = "Add Employee";
const VIEW_DEPT = "View Department";
const VIEW_ROLE = "View Role";
const VIEW_EMP = "View Employees";
const VIEW_ALL = "View Everything";
const UPDATE_EMP_ROLE = "Update Employee Role and / or Manager";
const VIEW_MAN = "View employees grouped by manager";  // Not yet implemented.

const SEP = new inquirer.Separator();

// Setup connection to the database.
const connection = mysql.createConnection({
	// Connect to Local database
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'emp_tracker_db',
});

const addItem = (tableName, itemsToAdd) => {
	// Take an object and add it to the specified table.
	const query = "INSERT INTO ?? SET ?";
	let values = itemsToAdd;
	connection.query(query, [tableName, values], (err, res) => {
		if (err) throw err;
	});
	return true;
};

// function which prompts the user for what action they should take
const start = () => {
	inquirer.prompt({
		name: 'selectAction',
		type: 'list',
		message: 'Please select an action',
		choices: [
			ADD_DEPT,
			ADD_ROLE,
			ADD_EMP, SEP,
			VIEW_DEPT,
			VIEW_ROLE,
			VIEW_EMP,
			VIEW_ALL, SEP,
			// VIEW_MAN, SEP,
			UPDATE_EMP_ROLE, SEP,
			'Quit'
		],
	},)
	.then((answer) => {
		switch (answer.selectAction) {
			case (ADD_DEPT):
				postDepartment();
				break;
			case (ADD_ROLE):
				postRole();
				break;
			case (ADD_EMP):
				postEmployee();
				break;
			case (VIEW_DEPT):
				getDepartment(true);
				break;
			case (VIEW_ROLE):
				getRole(true);
				break;
			case (VIEW_EMP):
				getEmployee(true);
				break;
			case (VIEW_ALL):
				getEverything();
				break;
			case (VIEW_MAN):
				getEmployeeGrouped(true);
				break;
			case (UPDATE_EMP_ROLE):
				updateEmployee();
				break;
			default:
				console.log("peace!");
				connection.end();
				break;
		}
	});
};

// Function to create new department.
const postDepartment = () => {
	// prompt for department information.
	inquirer.prompt(
		[
			{
				name: 'departmentName',
				type: 'input',
				message: 'Enter department name',
			},
		]
	).then((answer) => {
		// when finished prompting, insert a new item into the db with that info
		connection.query('INSERT INTO department SET ?', {name: answer.departmentName},
			(err) => {
				if (err) throw err;
				console.log('Your department was created successfully!');
				// take the user back to the main menu.
				start();
			}
		);
	});
};

const postRole = () => {
	// query the database for department info.
	connection.query('SELECT * FROM department', (err, results) => {
		if (err) throw err;
		// Prompt the user for role information.
		inquirer.prompt([
			{
				name: 'department_id',
				type: 'rawlist',
				choices() {
					const choiceArray = [];
					results.forEach(({department_id, name }) => {
						choiceArray.push({department_id , name});
					});
					return choiceArray;
				},
				message: 'What department does the role belong to?',
			},
			{
				name: 'name',
				type: 'input',
				message: 'What is the name of the role?',
			},
			{
				name: 'salary',
				type: 'number',
				message: 'PLease enter role salary',
			},
		])
		.then((answer) => {
			// get the information of the chosen item
			let chosenItem;
			results.forEach((item) => {
				if (item.name === answer.department_id) {
					chosenItem = item.id;
				}
			});
			// when finished prompting, insert a new item into the db with that info
			const query = "INSERT INTO role SET ?";
			let values = {
				title: answer.name,
				salary: answer.salary,
				department_id: chosenItem,
			};
			connection.query(query, values, (err) => {
					if (err) throw err;
					console.log('Your role was created successfully!');
					// take the user back to the main menu.
					start();
				}
			);
		});
	});
};

const postEmployee = (existingEmployee =false) => {
	// Add or update an employee
	if (!existingEmployee ) {
		existingEmployee = {
			id: "new",
			first_name: "",
			last_name: "",
			manager_id: 1,
			role_id: 1,
		}
	}

	// query the database for department info.
	connection.query('SELECT * FROM role', (err, results) => {
		if (err) throw err;
		// Prompt the user for employee information.
		inquirer.prompt([
			{
				name: 'role_id',
				type: 'rawlist',
				choices() {
					const choiceArray = [];
					results.forEach(({id, title}) => {
						choiceArray.push(title);
					});
					return choiceArray;
				},
				message: 'employee role',
			},
			{
				name: 'first_name',
				type: 'input',
				message: 'What is the employees first name?',
				default: existingEmployee.first_name,
			},
			{
				name: 'last_name',
				type: 'input',
				message: 'Please enter employees last name',
				default: existingEmployee.last_name,
			},
		]).then((answer) => {
			// get the information of the chosen item
			let chosenItem;
			results.forEach((item) => {
				if (item.title === answer.role_id) {
					chosenItem = item.id;
				}
			});

			// Add the manager here.
			connection.query('SELECT * FROM employee', (err, results) => {
				if (err) throw err;
				// Prompt the user for employee information.
				inquirer.prompt([
					{
						name: 'manager_id',
						type: 'rawlist',
						choices() {
							const choiceArray = [];
							choiceArray.push("No Manager");
							// TODO this query needs to be limited to managers only.
							results.forEach(({id, first_name, last_name}) => {
								choiceArray.push(`${first_name} ${last_name}`);
							});
							return choiceArray;
						},
						message: 'employee manager',
					},
				]).then((answer_emp) => {
					// get the information of the chosen item
					let chosenManager;
					results.forEach((item) => {
						if (`${item.first_name} ${item.last_name}` === answer_emp.manager_id) {
							chosenManager = item.id;
						}
					});

					let query;
					// Quick check to see if this is a new employee, or one being updated.
					if (existingEmployee.id !== "new") {
						query = `UPDATE employee SET ? WHERE id = ${existingEmployee.id}`;
					} else {
						// when finished prompting, insert a new item into the db with that info
						query = "INSERT INTO employee SET ?";
					}

					// Set the values for the query.
					let values = {
						first_name: answer.first_name,
						last_name: answer.last_name,
						role_id: chosenItem,
						manager_id: chosenManager
					};

					connection.query(query, values, (err) => {
						if (err) throw err;
						console.log('Your employee was created successfully!');
						// take the user back to the main menu.
						start();
					});
				});
			});
		});
	});
};

const doPause = () => {
	// Inserts a pause for the user where required.
	inquirer.prompt([
		{
			name: "paused...",
			type: "list",
			choices: ["press enter to proceed"],
		},
	]).then(() => {
		start();
	});
};

const getDepartment = (pause) => {
	// Gets and displays the departments.
	connection.query('SELECT * FROM department', (err, res) => {
		if (err) throw err;
		console.log("/---Departments---/");
		console.table(res);
		if (pause) doPause();
	});
};

const getRole = (pause) => {
	// Gets and displays the roles
	let roleQuery = 'SELECT * FROM role';
	roleQuery += ' INNER JOIN department ON (role.department_id = department.id)';
	connection.query(roleQuery, (err, res) => {
		if(err) throw err;
		console.log("/---Roles---/");
		console.table(res);
		if (pause) doPause();
	});
};

const getEmployee = (pause) => {
	// Gets and displays the employees
	// Put a bumper query together to get all the info on the employees.
	let employeeQuery = "SELECT";
	employeeQuery += ' CONCAT(e.first_name, " ", e.last_name) AS Employee,';
	employeeQuery += ' CONCAT(m.first_name, " ", m.last_name) AS Manager,';
	employeeQuery += "  r.title, r.salary, d.name, r.department_id";
	employeeQuery += " FROM employee e";
	employeeQuery += " LEFT JOIN employee m ON (m.id = e.manager_id)";
	employeeQuery += " INNER JOIN role r ON (r.id = e.role_id)";
	employeeQuery += " INNER JOIN department d ON (d.id = r.department_id)";

	connection.query(employeeQuery, (err, res) => {
		if(err) throw err;
		console.log("/---Employees---/");
		console.table(res);
		if (pause) doPause();
	});
};

const getEverything = () => {
	// Returns Roles, Departments, Employees.
	getRole(false);
	getDepartment(false);
	getEmployee(true);
}

const updateEmployee = () => {
	// Gets exisitn gemplopyee info, and parses it to postEmployee()
	// query the database for department info.
	let employeeQuery = "SELECT";
	employeeQuery += " e.id, e.first_name, e.last_name, e.role_id, e.manager_id";
	employeeQuery += " FROM employee e";
	connection.query(employeeQuery, (err, results) => {
		if (err) throw err;
		// Prompt the user for role information.
		inquirer.prompt([
			{
				name: 'employee_id',
				type: 'rawlist',
				choices() {
					const choiceArray = [];
					results.forEach(({id, first_name, last_name}) => {
						let uniqueEmp = `[id: ${id}] ${last_name}, ${first_name}`;
						choiceArray.push(uniqueEmp);
					});
					return choiceArray;
				},
				message: 'Select an employee to edit',
			},
		]).then((answer) => {
			// get the information of the chosen item
			let chosenItem;
			results.forEach((item) => {
				let uniqueEmp = `[id: ${item.id}] ${item.last_name}, ${item.first_name}`;
				if (uniqueEmp === answer.employee_id) {
					chosenItem = {
						id: item.id,
						first_name: item.first_name,
						last_name: item.last_name,
						manager_id: item.manager_id,
						role_id: item.role_id,
					};
				}
			});
			postEmployee(chosenItem);
		});
	});
};

// connect to the mysql server and sql database
connection.connect((err) => {
	if (err) throw err;
	// run the start function after the connection is made to prompt the user
	start();
});

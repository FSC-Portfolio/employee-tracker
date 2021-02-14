"use strict";
const inquirer = require('inquirer');
const mysql = require('mysql');
const ADD_DEPT = "Add Department";
const ADD_ROLE = "Add Role";
const ADD_EMP = "Add Employee";
const VIEW_DEPT = "View Department";
const VIEW_ROLE = "View Role";
const VIEW_EMP = "View Employee";
const UPDATE_EMP_ROLE = "Update Employee Role";

const SEP = new inquirer.Separator();

const connection = mysql.createConnection({
	// Connect to Local database
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'himypal',
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
	inquirer
		.prompt({
			name: 'selectAction',
			type: 'list',
			message: 'Please select an action',
			// choices: [ADD_DEPT, ADD_ROLE, ADD_EMP, SEP, VIEW_DEPT, VIEW_ROLE, VIEW_EMP, SEP, UPDATE_EMP_ROLE, SEP, 'Quit'],
			choices: [UPDATE_EMP_ROLE, SEP, 'Quit'],
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
					getDepartment();
					break;
				case (VIEW_ROLE):
					getRole();
					break;
				case (VIEW_EMP):
					getEmployee();
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
			console.log(values);
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

const postEmployee = (existingEmployee =-1) => {
	if (existingEmployee) console.dir(existingEmployee);
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
						// console.log({id, title});
						choiceArray.push(title);
					});
					console.log(choiceArray);
					return choiceArray;
				},
				message: 'employee role',
			},
			{
				name: 'first_name',
				type: 'input',
				message: 'What is the employees first name?',
			},
			{
				name: 'last_name',
				type: 'input',
				message: 'Please enter employees last name',
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
							console.log(choiceArray);
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
							console.log("got a manager");
						}
					});

					// when finished prompting, insert a new item into the db with that info
					const query = "INSERT INTO employee SET ?";
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

const getDepartment = () => {
	connection.query('SELECT * FROM department', (err, res) => {
		if (err) throw err;
		console.log("/---Departments---/");
		res.forEach((item) => {
			console.log(`${item.name}`);
		});
		doPause();
	});
};

const getRole = () => {
	let roleQuery = 'SELECT * FROM role';
	roleQuery += ' INNER JOIN department ON (role.department_id = department.id)';
	connection.query(roleQuery, (err, res) => {
		if(err) throw err;
		console.log("/---Roles---/");
		res.forEach((item) => {
			console.log(`#${item.title} || Salary: ${item.salary} || Department: ${item.name}`);
			// console.dir(item);
		});
		doPause();
	});
};

const getEmployee = () => {
	// Put a bumper query together to get all the info on the employees.
	let employeeQuery = "SELECT";
	employeeQuery += " CONCAT(e.first_name, e.last_name) AS Employee,";
	employeeQuery += " CONCAT(m.first_name, m.last_name) AS Manager,";
	employeeQuery += "  r.title, r.salary, d.name, r.department_id";
	employeeQuery += " FROM employee e";
	employeeQuery += " INNER JOIN employee m ON (m.id = e.manager_id)";
	employeeQuery += " INNER JOIN role r ON (r.id = e.role_id)";
	employeeQuery += " INNER JOIN department d ON (d.id = r.department_id)";

	connection.query(employeeQuery, (err, res) => {
		if(err) throw err;
		console.log("/---Employees---/");
		res.forEach((item) => {
			console.log(`${item.Employee} is a ${item.title} from the ${item.name} department, and is managed by ${item.Manager}, they are paid a salary of ${item.salary}`);
		});
		doPause();
	});
};

const updateEmployee = () => {
	// query the database for department info.
	// show all employees
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
			// connection.end();
		});
	});
};

// connect to the mysql server and sql database
connection.connect((err) => {
	if (err) throw err;
	// run the start function after the connection is made to prompt the user
	start();
});

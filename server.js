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
			choices: [ADD_DEPT, ADD_ROLE, ADD_EMP, SEP, VIEW_DEPT, VIEW_ROLE, VIEW_EMP, SEP, UPDATE_EMP_ROLE, SEP, 'Quit'],
		},)
		.then((answer) => {
			// based on their answer, either call the bid or the post functions
			if (answer.selectAction === ADD_DEPT) {
				postDepartment();
			} else if (answer.selectAction === ADD_ROLE) {
				postRole();
			} else {
				connection.end();
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
		inquirer
			.prompt([
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

// connect to the mysql server and sql database
connection.connect((err) => {
	if (err) throw err;
	// run the start function after the connection is made to prompt the user
	start();
});

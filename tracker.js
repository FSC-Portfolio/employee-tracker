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
	connection.query(query, [tableName, values], (err, result) => {
		if (err) throw err;
		console.log(result);
	});
};

const viewItem = (tableName) => {
	const query = 'SELECT * FROM ?';
	connection.query(query, tableName, (err, res) => {
		console.log("view");
	})
};

const updateItem = (tableName) => {
	const query = 'SELECT * FROM ?';
	connection.query(query, tableName, (err, res) => {
		console.log("updating");
	})
};

const mainMenu = () => {
	// Display the main menu for the user.
	inquirer.prompt(
		{
			name: 'selectAction',
			type: 'list',
			message: 'Please select an action',
			choices: [ADD_DEPT, ADD_ROLE, ADD_EMP, SEP, VIEW_DEPT, VIEW_ROLE, VIEW_EMP, SEP, UPDATE_EMP_ROLE, SEP],
		}
	).then((answer) => {
		// perform selected action.
		switch (answer.selectAction) {
			case (ADD_DEPT):
				console.log(ADD_DEPT);
				break;
			case (ADD_ROLE):
				console.log(ADD_ROLE);
				break;
			case (ADD_EMP):
				console.log(ADD_EMP);
				break;
			case (VIEW_DEPT):
				console.log(VIEW_DEPT);
				break;
			case (VIEW_ROLE):
				console.log(VIEW_ROLE);
				break;
			case (VIEW_EMP):
				console.log(VIEW_EMP);
				break;
			case (UPDATE_EMP_ROLE):
				console.log(UPDATE_EMP_ROLE);
				break;
			default:
				console.log("peace!");
				break;
		}
		connection.end();
	});
}

// connection.connect((err) => {
// 	if(err) throw err;
// 	// addItem("department", {title: "survey"});
// 	// addItem("role", {title: "Surveyor", salary: 99999.99, department_id: 1});
// 	// addItem("employee",
// 	// 	{first_name: "Frank", last_name: "Beans", role_id: 1, manager_id: 1});
// 	// connection.end();
// 	mainMenu();
// });


mainMenu();
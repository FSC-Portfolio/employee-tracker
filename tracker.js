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

const roleQuestions = [
	{
		name: 'title',
		type: 'input',
		message: 'Please enter a role title',
	},
	{
		name: 'salary',
		type: 'number',
		message: 'Please enter a salary',
	},
	{
		name: 'department_id',
		type: 'input',
		message: 'Please select a department',
	},
];

const deptQuestions = [
	{
		name: 'departmentName',
		type: 'input',
		message: 'Enter department name',
	},
];

const menuQuestions = [
	{
		name: 'selectAction',
		type: 'list',
		message: 'Please select an action',
		choices: [ADD_DEPT, ADD_ROLE, ADD_EMP, SEP, VIEW_DEPT, VIEW_ROLE, VIEW_EMP, SEP, UPDATE_EMP_ROLE, SEP, 'Quit'],
	},
];

const mainMenu = async () => {
	// Ask the user what they want todo first.
	let mainMenuQ = await inquirer.prompt(menuQuestions);

	if (mainMenuQ.selectAction !== 'Quit') {
		let gameOn = true;
			while (gameOn) {
			switch (mainMenuQ.selectAction) {
				case (ADD_DEPT):
					const askDept = await inquirer.prompt(deptQuestions).then((answer) => {
						addItem("department", {name: answer.departmentName});
					});
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;

				case (ADD_ROLE):
					const askRole = await inquirer.prompt(roleQuestions).then((answer) => {
						addItem("role", {
							title: answer.title,
							salary: answer.salary,
							department_id: answer.departmentId});
					});
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;

				case (ADD_EMP):
					console.log(ADD_EMP);
					//{first_name: "Frank", last_name: "Beans", role_id: 1, manager_id: 1});
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;

				case (VIEW_DEPT):
					console.log(VIEW_DEPT);
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;
				case (VIEW_ROLE):
					console.log(VIEW_ROLE);
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;
				case (VIEW_EMP):
					console.log(VIEW_EMP);
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;
				case (UPDATE_EMP_ROLE):
					console.log(UPDATE_EMP_ROLE);
					mainMenuQ = await inquirer.prompt(menuQuestions);
					break;
				default:
					console.log("peace!");
					connection.end();
					gameOn = false;
					break;
			}
		}
	}
}


connection.connect((err) => {
	if(err) throw err;
});

let promise = mainMenu();


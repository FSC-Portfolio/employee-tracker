"use strict";
const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'himypal',
	database: 'emp_tracker_db',
});

const addItem = () => {
	const query = 'SELECT * FROM department';
	connection.query(query, (err, res) => {
		console.log("adding");
	})
};

const viewItem = () => {
	const query = 'SELECT * FROM department';
	connection.query(query, (err, res) => {
		console.log("view");
	})
};

const updateItem = () => {
	const query = 'SELECT * FROM department';
	connection.query(query, (err, res) => {
		console.log("updating");
	})
};

connection.connect((err) => {
	if(err) throw err;
	addItem();
	connection.end();
});

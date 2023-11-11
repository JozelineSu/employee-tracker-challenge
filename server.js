const mysql = require('mysql2');
const inquirer = require('inquirer');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'rootroot',
      database: 'employee_tracker_db'
    }
);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database', err);
        return;
    }
    console.log('Connected to employee_tracker_db database');
});


function viewAllEmployees() {
    db.query(`SELECT
                e.id, e.first_name, e.last_name, r.title, d.department_name AS 'department', r.salary, CONCAT(m.first_name, ' ', m.last_name) AS 'manager'
            FROM employee e
            LEFT JOIN role r ON e.role_id = r.id
            LEFT JOIN department d ON d.id = r.department_id
            LEFT JOIN employee m ON m.id = e.manager_id`, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        console.table(results);
    });
};
    

const choicesArray = ['View All Employees', 'Add Employee', 'Update Employee Role',
                    'View All Roles', 'Add Role', 'View All Departments', 'Add Department'];

inquirer.prompt(
    {
        type: 'list',
        name: 'answer',
        message: 'What would you like to do?',
        choices: choicesArray,
    }
).then((answer) => {
    if(answer.answer === 'View All Employees') {
        viewAllEmployees();

    } else if(answer === 'Add Employee') {

    } else if(answer === 'Update Employee Role') {

    } else if(answer === 'View All Roles') {

    } else if(answer === 'Add Role') {

    } else if(answer === 'View All Departments') {

    } else if(answer === 'Add Department') {

    };
    
}).catch((error) => {
    console.error(error);
})


// Import Packages
const mysql = require('mysql2');
const inquirer = require('inquirer');
// Connect to database
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

    userPrompt(); // Run first prompt
});
// Get all Employees
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

    userPrompt();
};
//Add New Employee
function addEmployee() {
    const rolesQuery = `SELECT id, title FROM role`;
    db.query(rolesQuery, (rolesErr, rolesResults) => {
        if (rolesErr) {
            console.error('Error fetching roles:', rolesErr);
            return;
        }
        const roleChoices = rolesResults.map((role) => ({
            name: role.title,
            value: role.id,
        }));

        const managersQuery = `SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee WHERE manager_id IS NULL`;
        db.query(managersQuery, (managerErr, managerResults) => {
          if (managerErr) {
            console.error('Error fetching managers', managerErr);
            return;
        }  
        const managerChoices = managerResults.map((manager) => ({
            name: manager.manager_name,
            value: manager.id,
        }));

        managerChoices.push({ name: 'Null', value: null });

        inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter employee first name:',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter employee last name:',
        },
        {
            type: 'list',
            name: 'role',
            message: 'Enter the role of the employee:',
            choices: roleChoices,
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Enter manager name of employee:',
            choices: managerChoices,
        },
    ]).then((results) => {
        const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?)`;

        const managerId = results.manager === 'Null' ? null : results.manager;

        const values = [results.first_name, results.last_name, results.role, managerId];

        db.query(query, values, (err) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
            console.log('Employee added successfully');
        });
        userPrompt();
    }).catch((error) => {
        console.error(error);
    });
        })
    })
};
//Update role of employee
function updateEmployeeRole() {
    const employeesQuery = `SELECT id, CONCAT(first_name, " ", last_name) AS employee_name FROM employee`;
    const rolesQuery = `SELECT id, title FROM role`;

    db.query(employeesQuery, (employeeErr, employeeResults) => {
        if(employeeErr) {
            console.error('Error fetching employees:', employeeErr);
            return;
        }
        const employeeList = employeeResults.map((employee) => ({
            name: employee.employee_name,
            value: employee.id,
        }));

        db.query(rolesQuery, (rolesErr, rolesResults) => {
            if (rolesErr) {
                console.error('Error fetching roles:', rolesErr);
                return;
              }
            
            const roleList = rolesResults.map((role) => ({
                name: role.title,
                value: role.id,
            }));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_name',
                    message: 'Select employee to update',
                    choices: employeeList,
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Assign new role:',
                    choices: roleList,
                }
            ]).then((answer) => {
                const updateQuery = `UPDATE employee SET role_id = ? WHERE id = ?`;
                const values = [answer.role, answer.employee_name];

                db.query(updateQuery, values, (updateErr) => {
                    if(updateErr) {
                        console.error('Error executing query', updateErr);
                        return;
                    }
                    console.log('Employee role updated successfully!');
                });
                userPrompt();
            }).catch((error) => {
                console.error(error);
            });
        });
    });
};
// Get All Roles
function viewAllRoles() {
    db.query(`SELECT r.id, r.title, r.salary, d.department_name 
            FROM role r
            LEFT JOIN department d ON r.department_id = d.id `, (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }
                console.table(results);
            });
            userPrompt();
};
// Add New Role
function addRole() {
        const departmentQuery = `SELECT id, department_name FROM department`;
        db.query(departmentQuery, (dptErr, dptResults) => {
            if(dptErr) {
                console.error('Error fetching department names:', dptErr);
                return;
            }
            const dptChoices = dptResults.map((department) => ({
                name: department.department_name,
                value: department.id,
            }));
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter name of new role:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter employee salary:',
            },
            {
                type: 'list',
                name: 'department',
                message: 'Enter department of employee:',
                choices: dptChoices,
            },
        ]).then((results) => {
            const query = `
            INSERT INTO role (title, salary, department_id)
            VALUES (?, ?, ?)`;
    
            const values = [results.title, results.salary, results.department];
    
            db.query(query, values, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }
                console.log('role added successfully');
            });
            userPrompt();
        }).catch((error) => {
            console.error(error);
        });
        });
    };
// Get All Departments
function viewAllDepartments() {
    db.query(`SELECT d.id, d.department_name FROM department d`, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        console.table(results);
       
    });
     userPrompt();
};
// Add New Department
function addDepartment() {
    inquirer.prompt(
        {
            type: 'input',
            name: 'department_name',
            message: 'Enter name of new department:',
        }
    ).then((result) => {
        const dptQuery = `INSERT INTO department (department_name)
        VALUES (?)`;
        const dptValue = [result.department_name];

        db.query(dptQuery, dptValue, (err) => {
            if (err) {
                console.error('Error executing qery:', err);
                return;
            }
            console.log('Successfully added department!');
        });
        userPrompt();
    }).catch((error) => {
        console.error(error);
    });
};
    
const choicesArray = ['View All Employees', 'Add Employee', 'Update Employee Role',
'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'];
// Initial Prompt
function userPrompt() {
    inquirer.prompt(
    {
        type: 'list',
        name: 'answer',
        message: 'What would you like to do?',
        choices: choicesArray,
    }
    ).then(function ({answer}) {
        switch (answer) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Quit':
                db.end();
                break;
        }
    }).catch((error) => {
        console.error(error);
    })
}
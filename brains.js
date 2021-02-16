const { Console } = require('console');
const inquirer = require('inquirer')
const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: 'root',
  
    // Be sure to update with your own MySQL password!
    password: 'D3ath2Sql117',
    database: 'employee_tracker_db',
  });

const rootChoice = ()=>{
  inquirer
  .prompt([
      {
          type: 'list',
          choices:[
              'View All Employees',
              'Add Employee',
              'View All Departments',
              'Add Department',
              'View All Roles',
              'Add Role',
              'Exit',
          ],
          message: 'What would you like to do? ',
          name: 'taskChoice' 
      },
  ])
  .then((response)=>{
    switch (response.taskChoice) {
        case "View All Employees":
            viewEmployees()
        break;
        case "Add Employee":
            addEmployee()
        break;    
        case "View All Departments":
            viewDepartments()
        break;
        case "Add Department":
            addDepartment()
        break;
        case "View All Roles":
            viewRoles()
        break;
        case "Add Role":
            addRole()
        break;       
        case "Exit":
            console.log("okay bye bye")
            connection.end();
            return 
        break;   
    }
  })
}
  const viewEmployees = ()=>{
    connection.query('SELECT employees.id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.dept_name FROM employees INNER JOIN roles ON employees.role_id=roles.id INNER JOIN departments ON roles.department_id=departments.id', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        rootChoice();
      });
  }

  const viewDepartments = ()=>{
    connection.query('SELECT * FROM departments', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        rootChoice();
      });
  }

  const viewRoles = ()=>{
    connection.query('SELECT roles.id, roles.title, roles.salary, departments.dept_name FROM roles INNER JOIN departments ON roles.department_id=departments.id', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        rootChoice();
      });
  }




  //init
  rootChoice();
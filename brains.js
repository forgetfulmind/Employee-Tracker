const { Console } = require('console');
const inquirer = require('inquirer')
const mysql = require('mysql');
const { title } = require('process');

const connection = mysql.createConnection({
    host: 'localhost',
  
    // port
    port: 3306,
  
    // username
    user: 'root',
  
    // Be sure to export your password as DB_password
    password: process.env.DB_password,
    database: 'employee_tracker_db',
  });

//main menu
const rootChoice = ()=>{
  inquirer
  .prompt([
      {
          type: 'list',
          choices:[
              'View All Employees',
              'Add Employee',
              `Remove Employee`,
              `Modify an Employee's Role`,
              `Modify an Employee's Manager`,
              `View Employees by Manager`,
              'View All Departments',
              //`View a Department's Budget`,
              'Add Department',
              `Remove Department`,
              'View All Roles',
              'Add Role',
              'Remove Role',
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
        case "Remove Employee":
            removeEmployee()
        break;    
        case "View All Departments":
            viewDepartments()
        break;
        case "Add Department":
            addDepartment()
        break;
        case "Remove Department":
            removeDepartment()
        break;
        // case "View a Department's Budget":
        //     moneyDepartment()
        // break;
        case "View All Roles":
            viewRoles()
        break;
        case "Add Role":
            addRole()
        break;  
        case "Remove Role":
            removeRole()
        break;      
        case `Modify an Employee's Manager`:
            modEmployee()
        break;  
        case `View Employees by Manager`:
            viewByManager()
        break;
        case `Modify an Employee's Role`:
            modRole()
        break;         
        case "Exit":
            console.log("okay bye bye")
            connection.end();
            return 
        break;   
    }
  })
}

//view all employees
  const viewEmployees = ()=>{
    connection.query('SELECT employees.id, employees.first_name, employees.last_name, roles.title, roles.salary, employees.manager_id, departments.dept_name FROM employees INNER JOIN roles ON employees.role_id=roles.id INNER JOIN departments ON roles.department_id=departments.id ORDER BY employees.id', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        rootChoice();
      });
  }

//view all departments
  const viewDepartments = ()=>{
    connection.query('SELECT * FROM departments', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        rootChoice();
      });
  }

//view all roles  
  const viewRoles = ()=>{
    connection.query('SELECT roles.id, roles.title, roles.salary, departments.dept_name FROM roles INNER JOIN departments ON roles.department_id=departments.id ORDER BY roles.id', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        rootChoice();
      });
  }

// add an employee
  const addEmployee = ()=>{
    connection.query('SELECT roles.title FROM roles', (err,res)=>{
        if (err) throw err;
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the employees first name? ',
            name: 'firstName' 
        },
        {
            type: 'input',
            message: 'What is the employees last name? ',
            name: 'lastName' 
        },
        {
            name: 'roleChoice',
            type: 'rawlist',
            choices(){
                    let arr = [];
                    res.forEach(({title}) => {
                       arr.push(title)
                    });
                return arr;

            },
            message: 'What is the employees role? ',
        },
        {
            name: 'managerChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.first_name, employees.last_name FROM employees', (err,res)=>{
                        //console.log(res)
                        let arr = ["No Manager"];
                        res.forEach(({first_name, last_name}) => {

                           arr.push(`${first_name} ${last_name}`)
                        });
                        //console.log(arr)
                        resolve(arr);
                })
                })
            },
            message: 'Does the Employee have a Manager? ',
        },
    ])
    .then((response)=>{

        let roleID; 
        function getRole(){
            return new Promise((resolve, reject)=>{
                connection.query('SELECT roles.id FROM roles WHERE ?',
                {title: response.roleChoice},
                (err,res)=>{
                    roleID = res[0].id
                    resolve(getManager());
               })
            })
        }

        let managerChoice = response.managerChoice.split(" ")

        let managerID;
        function getManager(){
            new Promise((resolve, reject)=>{
                if(response.managerChoice !== "No Manager"){
                    connection.query('SELECT employees.id FROM employees WHERE ? AND ?',
                    [
                        {
                            first_name: managerChoice[0],
                        }, 
                        {
                            last_name: managerChoice[1],
                        },
                ],
                    (err,res)=>{
                        managerID = res[0].id
                        resolve(insertEmployee());
                   })
                }else{resolve(insertEmployee())}
          })
        }

        function insertEmployee(){
            connection.query(
                'INSERT INTO employees SET ?',
                {
                    first_name: response.firstName, 
                    last_name: response.lastName, 
                    role_id: roleID, 
                    manager_id: managerID
                },
                (err, res) => {
                  if (err) throw err;
                  console.log(`${res.affectedRows} employee created!\n`);
                  rootChoice();
                }
            )
        }
    
        getRole()

    })
   })
  }

// add a department to the list 
  const addDepartment = ()=>{
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the name of the department you would like to add? ',
            name: 'newDept' 
        }
    ])
    .then((response)=>{
        connection.query( 'INSERT INTO departments SET ?',
                {
                    dept_name: response.newDept, 
                },
                (err, res) => {
                  if (err) throw err;
                  console.log(`${res.affectedRows} department created!\n`);
                  rootChoice();
                }
           )
    })
  }

//add a role to the list 
  const addRole = ()=>{
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the name of the Role you would like to add? ',
            name: 'newRole' 
        },
        {
            type: 'input',
            message: 'What is the salary of the role you would like to add? ',
            name: 'newSalary' 
        },
        {
            name: 'addRole',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT departments.dept_name FROM departments', (err,res)=>{
                        //console.log(res)
                        let arr = [];
                        res.forEach(({dept_name})=>{
                            arr.push(dept_name)
                        })
                        resolve(arr);
                    })
                })
            },
            message: 'What department is this role part of?',
        },
    ])
    .then((response)=>{
            let deptID;
            new Promise((resolve, reject)=>{
                    connection.query('SELECT departments.id FROM departments WHERE ?',
                    [
                        {
                            dept_name: response.addRole,
                        }, 
                ],
                    (err,res)=>{
                        deptID = res[0].id
                        resolve(insertDepartment());
                   })
                
          })

        const insertDepartment = ()=>{
         connection.query( 'INSERT INTO roles SET ?',

                {
                    title: response.newRole,
                    salary: response.newSalary,
                    department_id: deptID, 
                },
                (err, res) => {
                  if (err) throw err;
                  console.log(`${res.affectedRows} department created!\n`);
                  rootChoice();
                }
              )
            }
    })
  } 

//modify an employee's manager  
  const modEmployee = ()=>{
    inquirer
    .prompt([
        {
            name: 'employeeChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.first_name, employees.last_name FROM employees', (err,res)=>{
                        //console.log(res)
                        let arr = [];
                        res.forEach(({first_name, last_name}) => {

                           arr.push(`${first_name} ${last_name}`)
                        });
                        //console.log(arr)
                        resolve(arr);
                })
                })
            },
            message: 'Which Employee would you like to modify? ',
        },
        {
            name: 'managerChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.first_name, employees.last_name FROM employees', (err,res)=>{
                        //console.log(res)
                        let arr = ["No Manager"];
                        res.forEach(({first_name, last_name}) => {

                           arr.push(`${first_name} ${last_name}`)
                        });
                        //console.log(arr)
                        resolve(arr);
                })
                })
            },
            message: `Who is this employee's manager?`,
        },
    ])
    .then((response)=>{
        let managerChoice = response.managerChoice.split(" ")
        let managerID;
        let employeeChoice = response.employeeChoice.split(" ")
         getManager()
        function getManager(){
            new Promise((resolve, reject)=>{
                if(response.managerChoice !== "No Manager"){
                    connection.query('SELECT employees.id FROM employees WHERE ? AND ?',
                    [
                        {
                            first_name: managerChoice[0],
                        }, 
                        {
                            last_name: managerChoice[1],
                        },
                ],
                    (err,res)=>{
                        managerID = res[0].id
                        resolve(updateManager());
                   })
                }else{resolve(updateManager())}
          })
        }

        function updateManager(){
            
            connection.query(
                'UPDATE employees SET ? WHERE ? AND ?',
                [
                    {
                        manager_id: managerID
                    },
                    {   first_name: employeeChoice[0],  
                    },
                    {
                        last_name: employeeChoice[1],
                    },
                ],
                (err, res) => {
                  if (err) throw err;
                  console.log(`${res.affectedRows} employee's manager updated!\n`);
                  rootChoice();
                }
            )
        }
  
    })
  }

//modify an employee's role  
const modRole = ()=>{
    inquirer
    .prompt([
        {
            name: 'employeeChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.first_name, employees.last_name FROM employees', (err,res)=>{
                        //console.log(res)
                        let arr = [];
                        res.forEach(({first_name, last_name}) => {

                           arr.push(`${first_name} ${last_name}`)
                        });
                        //console.log(arr)
                        resolve(arr);
                })
                })
            },
            message: 'Which Employee would you like to modify? ',
        },
        {
            name: 'roleChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                connection.query('SELECT roles.title FROM roles', (err,res)=>{
                    if (err) throw err;
                    let arr = [];
                    res.forEach(({title}) => {
                       arr.push(title)
                    });
                resolve(arr);
                })
            })
            },
            message: 'What is the employees new role? ',
        },
    ])
    .then((response)=>{
        let employeeChoice = response.employeeChoice.split(" ")
        let roleID; 
        getRole()
        function getRole(){
            return new Promise((resolve, reject)=>{
                connection.query('SELECT roles.id FROM roles WHERE ?',
                {title: response.roleChoice},
                (err,res)=>{
                    roleID = res[0].id
                    resolve(updateRole());
               })
            })
        }

        function updateRole(){
            
            connection.query(
                'UPDATE employees SET ? WHERE ? AND ?',
                [
                    {
                        role_id: roleID
                    },
                    {   first_name: employeeChoice[0],  
                    },
                    {
                        last_name: employeeChoice[1],
                    },
                ],
                (err, res) => {
                  if (err) throw err;
                  console.log(`${res.affectedRows} employee's role updated!\n`);
                  rootChoice();
                }
            )
        }
  
    })
  }


//view employees by manager
  const viewByManager = ()=>{
    inquirer
    .prompt([
        {
            name: 'managerView',
            type: 'rawlist',
            choices(){
                
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.first_name, employees.last_name FROM employees WHERE employees.id IN (SELECT manager_id FROM employees)', (err,res)=>{
                        //console.log(res)
                        let arr = [];
                        res.forEach(({first_name, last_name}) => {

                           arr.push(`${first_name} ${last_name}`)
                        });
                        //console.log(arr)
                        resolve(arr);
                })
                })
            },
            message: `Which Manager's Employee list would you like to view?`,
        },
    ])
    .then((response)=>{
        let managerView = response.managerView.split(" ")
        let managerID;
         getManager()

        function getManager(){
            new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.id FROM employees WHERE ? AND ?',
                    [
                        {
                            first_name: managerView[0],
                        }, 
                        {
                            last_name: managerView[1],
                        },
                ],
                    (err,res)=>{
                        managerID = res[0].id
                        resolve(viewChosen());
                   })
          })
        }

        function viewChosen(){
            connection.query(
                'Select * FROM employees WHERE ?',
                [
                    {
                        manager_id: managerID
                    },

                ],
                (err, res) => {
                  if (err) throw err;
                  if(!res[0]){
                    console.log(`|| This selection currently has no employees assigned ||`)
                  }else{
                    console.table(res);
                  }
                  rootChoice();
                }
            )
        }
  
    })
  }

//delete employee 
const removeEmployee = ()=>{
    inquirer
    .prompt([
        {
            name: 'employeeChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT employees.first_name, employees.last_name FROM employees', (err,res)=>{
                        //console.log(res)
                        let arr = [];
                        res.forEach(({first_name, last_name}) => {

                           arr.push(`${first_name} ${last_name}`)
                        });
                        //console.log(arr)
                        resolve(arr);
                })
                })
            },
            message: 'Which Employee would you like to remove? ',
        },
    ])
    .then((response)=>{
        let employeeChoice = response.employeeChoice.split(" ")
 
            new Promise((resolve, reject)=>{
                    connection.query('DELETE FROM employees WHERE ? AND ?',
                    [
                        {
                            first_name: employeeChoice[0],
                        }, 
                        {
                            last_name: employeeChoice[1],
                        },
                ],
                    (err,res)=>{
                        console.log(`${res.affectedRows} employees removed!\n`);
                        resolve(rootChoice());
                   })

          })
  
    })
  }

//delete department
const removeDepartment = ()=>{
    inquirer
    .prompt([
        {
            name: 'departmentChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT dept_name FROM departments', (err,res)=>{
                        let arr = [];
                        res.forEach(({dept_name})=>{
                            arr.push(dept_name)
                        })
                        resolve(arr);
                })
                })
            },
            message: 'Which Department would you like to remove? ',
        },
    ])
    .then((response)=>{
 
            new Promise((resolve, reject)=>{
                    connection.query('DELETE FROM departments WHERE ?',
                    [
                        {
                            dept_name: response.departmentChoice,
                        }, 

                ],
                    (err,res)=>{
                        console.log(`${res.affectedRows} departments removed!\n`);
                        resolve(rootChoice());
                   })

          })
  
    })
  }

//delete role
const removeRole = ()=>{
    inquirer
    .prompt([
        {
            name: 'roleChoice',
            type: 'rawlist',
            choices(){
                return new Promise((resolve, reject)=>{
                    connection.query('SELECT title FROM roles', (err,res)=>{
                        let arr = [];
                        res.forEach(({title})=>{
                            arr.push(title)
                        })
                        resolve(arr);
                })
                })
            },
            message: 'Which Role would you like to remove? ',
        },
    ])
    .then((response)=>{
 
            new Promise((resolve, reject)=>{
                    connection.query('DELETE FROM roles WHERE ?',
                    [
                        {
                            title: response.roleChoice,
                        }, 

                ],
                    (err,res)=>{
                        console.log(`${res.affectedRows} roles removed!\n`);
                        resolve(rootChoice());
                   })

          })
  
    })
  }

//view a department's budget 
// const moneyDepartment = ()=>{
//     inquirer
//     .prompt([
//         {
//             name: 'departmentChoice',
//             type: 'rawlist',
//             choices(){
//                 return new Promise((resolve, reject)=>{
//                     connection.query('SELECT dept_name FROM departments', (err,res)=>{
//                         let arr = [];
//                         res.forEach(({dept_name})=>{
//                             arr.push(dept_name)
//                         })
//                         resolve(arr);
//                 })
//                 })
//             },
//             message: `Which Department's budget would you like to view?`,
//         },
//     ])
//     .then((response)=>{
//         let deptID;
//         new Promise((resolve, reject)=>{
//                 connection.query('SELECT id FROM departments WHERE ?',
//                 [
//                     {
//                         dept_name: response.departmentChoice,
//                     }, 
//                 ],
//                 (err,res)=>{
//                     deptID = res[0].id
//                     resolve();
//                })
//         })

//     })
// }


  //init
  rootChoice();
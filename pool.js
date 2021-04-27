const mysql = require('mysql')
var pool = mysql.createPool({  
    host : '120.77.246.130',  
    port : 3306,  
    database : 'sys_admin',  
    user : 'root',  
    password : '123456'     
}) 
module.exports=pool
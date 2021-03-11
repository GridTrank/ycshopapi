const mysql = require('mysql')
var pool = mysql.createPool({  
    host : '47.112.113.38',  
    port : 3306,  
    database : 'sys_admin',  
    user : 'root',  
    password : '123456'     
}) 
module.exports=pool
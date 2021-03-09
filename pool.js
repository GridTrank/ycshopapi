const mysql = require('mysql')
var pool = mysql.createPool({  
    host : 'localhost',  
    port : 3001,  
    database : 'sys_admin',  
    user : 'root',  
    password : ''     
}) 
module.exports=pool
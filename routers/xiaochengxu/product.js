const pool = require('../../pool.js')
const router  = require("../index");

router.post('/index',(req,res)=>{
    var sql='select * from sys_admin_product'
    pool.query(sql,(err,result)=>{
        if(err) throw err
        res.send({
            code:200,
            message:'success',
            data:result
        })
    })
})



module.exports=router
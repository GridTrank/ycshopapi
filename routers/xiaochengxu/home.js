const pool = require('../../pool.js')
const router  = require("../index");
const sd = require('silly-datetime');

// 添加购物车
router.post('/homeList',(req,res)=>{
    var sql='select * from sys_admin_homeconfig'
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
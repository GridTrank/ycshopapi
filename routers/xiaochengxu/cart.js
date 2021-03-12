const pool = require('../../pool.js')
const router  = require("../index");
const sd = require('silly-datetime');


router.post('/addCart',(req,res)=>{
    delete req.body.sign
    var selectSql='select * from sys_admin_cart where pid = ? and mid =?'
    var insertSql='insert into sys_admin_cart set ?'
    var updateSql='update sys_admin_cart set ? where pid =? and mid =?'
    pool.query(selectSql,[req.body.pid,req.body.mid],(err,selectResult)=>{
        if(err) throw err
        console.log('查找',selectResult)
        if(selectResult.length<=0){
            pool.query(insertSql,[req.body],(err,insertResult)=>{
                if(err) throw err
                res.send({
                    code:200,
                    message:'添加成功',
                })
            })
        }else{
            pool.query(updateSql,[req.body,req.body.pid,req.body.mid],(err,updateResult)=>{
                if(err) throw err
                res.send({
                    code:200,
                    message:'添加成功',
                })
            })
        }
    })
})



module.exports=router
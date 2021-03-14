const pool = require('../../pool.js')
const router  = require("../index");
const sd = require('silly-datetime');

// 添加购物车
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

// 购物车列表
router.post('/list',async (req,res)=>{
    var sql='select * from sys_admin_cart where mid=?'   
    pool.query(sql,[req.body.mid],async (err,result)=>{
        if(err)throw err
        result.forEach(async (item,index,arr)=>{
            var rr=await getList(item.pid)
            item.info=rr
            if(index===arr.length-1){
                res.send({
                    code:200,
                    message:'success',
                    data:result
                })
            }
        })
        
    })
})
// 选中
router.post('/choice',(req,res)=>{
    var sql='update sys_admin_cart set is_choice = ? where cid in (?)'
    pool.query(sql,[req.body.is_choice,req.body.cid],(err,result)=>{
        if(err)throw err
        res.send({
            code:200,
            message:'success'
        })
    })
})  



function getList(id){
    var prosql='select pid,product_name,product_price,product_describe,detail_imgs from sys_admin_product where pid=?'
    return new Promise((resolve,reject)=>{
        pool.query(prosql,[id],(err,carResult)=>{
            if(err) throw err
            carResult[0].detail_imgs='http://47.112.113.38:3000/uploads/'+carResult[0].detail_imgs.split(',')[0]
            resolve(carResult[0])
        })
    })
}



module.exports=router
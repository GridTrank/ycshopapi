const pool = require('../../pool.js')
const router  = require("../index");
const sd = require('silly-datetime');


router.post('/index',(req,res)=>{
    var sql='select * from sys_admin_product where store_id = ?'
    pool.query(sql,[req.body.store_id],(err,result)=>{
        if(err) throw err
        res.send({
            code:200,
            message:'success',
            data:result
        })
    })
})

// 查询商品
router.post('/detail',(req,res)=>{
    var sql=`select * from sys_admin_product where pid = (${req.body.pid})`
    pool.query(sql,(err,response)=>{
        if(err)throw err
        let data=response[0]
        for (var key in data){
            if(!data[key]){
                delete data[key]
            }
        }
        if(data.banners){
            data.banners=data.banners.split(',')
            data.banners.forEach((el,i,arr)=>{
                arr[i]='http://120.77.246.130:3000/uploads/'+ el
            })
        }
        if(data.detail_imgs){
            data.detail_imgs=data.detail_imgs.split(',')
            data.detail_imgs.forEach((el,i,arr)=>{
                arr[i]='http://120.77.246.130:3000/uploads/'+ el
            })
        }

        data.create_time=sd.format(new Date(data.create_time).getTime(),'YYYY-MM-DD HH:mm:ss' ) 
        res.send({
            code:200,
            message:'success',
            result:data
        })
        
    })
})



module.exports=router
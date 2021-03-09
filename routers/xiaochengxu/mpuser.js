const pool = require('../../pool.js')
const router  = require("../index");

var {PRIVITE_KEY,EXPIRESD} = require("../../utils/store")
var WXBizDataCrypt = require('../../utils/WXBizDataCrypt')

const jwt = require("jsonwebtoken");
const md5 = require("md5");
const bodyParser=require('body-parser')
const sd = require('silly-datetime');



router.post("/getOpenid", async (req, res) => {
    let code = req.body.code; 
    let encryptedData = req.body.encryptedData;
    let iv = req.body.iv;
    let appid = req.body.appid; 
    let secret = req.body.secret; 
    let grant_type = "authorization_code"; 
    let url ="https://api.weixin.qq.com/sns/jscode2session?grant_type=" + grant_type +"&appid=" +appid +"&secret=" +secret +"&js_code=" +code;
    let openData=await getOpenid(url)
    res.send({
      code:200,
      data:openData
    })
    
});

router.post('/shopLogin',(req,res)=>{
  let body=req.body
  let insertData={
    open_id:body.openId,
    avatarUrl:body.userInfo.avatarUrl,
    nickName:body.userInfo.nickName,
  }
  var selectSql='select * from sys_admin_members where open_id=? '
  var insertSql='insert into sys_admin_members set ? '

  pool.query(selectSql,[body.openId],(err,response)=>{
      if(err)throw err
      let data={}
      if(response.length<=0){
        // 没有用户信息,先添加
        insertData.create_time=sd.format(new Date().getTime(),'YYYY-MM-DD HH:mm:ss') 
        pool.query(insertSql,[insertData],(err,inserRes)=>{
          if(err)throw err
          // 再查找
          pool.query(selectSql,[body.openId],(rr,rs)=>{
            if(rr)throw rr
            data={
              open_id:body.openId,
              userInfo:rs[0]
            }
            res.send({
              code:200,
              data:data
            })
          })
        })
      }else{
        // 有用户信息
        data={
          open_id:body.openId,
          userInfo:response[0]
        }
        res.send({
          code:200,
          data:data
        })
      }

  })
})

router.post('/shopRegister',(req,res)=>{
  let body=JSON.parse(JSON.stringify(req.body)) 
  delete body.sessionKey
  delete body.sign

  /**
   * 解密手机号码
   */
  body.mobile='15917356315'

  var insertSql='update sys_admin_members set ? where open_id=?'
  var selectSql='select * from sys_admin_members where open_id=? '
  pool.query(insertSql,[body,body.open_id],(err,inserRes)=>{
    if(err)throw err
    pool.query(selectSql,[body.open_id],(err,selectRes)=>{
      if(err)throw err
      res.send({
        code:200,
        userInfo:selectRes[0]
      })
    })
  })
  

})


router.post('/getToken',(req,res)=>{
  let sign=req.body.sign
  let token=md5(jwt.sign({sign},PRIVITE_KEY,{expiresIn:EXPIRESD})) 
  res.send(token)
    
})



function getOpenid(url){
  return new Promise((resolve,reject)=>{
    let https = require("https");
    let openid, sessionKey;

    https.get(url, (res1) => {
      res1.on("data", (d) => {
          openid = JSON.parse(d).openid; //得到openid
          sessionKey = JSON.parse(d).session_key; //得到session_key
          let data = {
            openid: openid,
            sessionKey: sessionKey,
          };
          resolve(data)
        })
        .on("error", (e) => {
          reject('error')
        });
    });
  })
}





module.exports=router
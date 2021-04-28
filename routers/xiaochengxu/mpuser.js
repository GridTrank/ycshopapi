const pool = require('../../pool.js')
const router  = require("../index");

const sd = require('silly-datetime');
const auth=require('../../utils/auth');
const { resolve } = require('path');

router.post("/getOpenid", async (req, res) => {
    let code = req.body.code; 
    let encryptedData = req.body.encryptedData;
    let iv = req.body.iv;
    let appid = req.body.appid; 
    let secret ='8afa34be9ae90b3331196a4b6b40c032'; 
    let grant_type = "authorization_code"; 
    let url ="https://api.weixin.qq.com/sns/jscode2session?grant_type=" + grant_type +"&appid=" +appid +"&secret=" +secret +"&js_code=" +code;
    let openData=await getOpenid(url)
    res.send({
      code:200,
      data:openData
    })
});

// 登录
router.post('/shopLogin',async (req,res)=>{
  let body=req.body
  let insertData={
    open_id:body.openId,
    avatarUrl:body.userInfo.avatarUrl,
    nickName:body.userInfo.nickName,
    member_name:body.post_share_key?'商家':body.get_share_key?'商家会员':'普通会员',
  }
  let get_share_key=body.option.get_share_key || ''

  var selectSql='select * from sys_admin_members where open_id=? '
  var insertSql='insert into sys_admin_members set ? '
  // 先查找
  pool.query(selectSql,[body.openId],async (err,response)=>{
      if(err)throw err
      let data={}
      if(response.length<=0){
        // 没有用户信息,先添加
        insertData.create_time=sd.format(new Date().getTime(),'YYYY-MM-DD HH:mm:ss') 

        // 有get_share_key，先写入表中
        console.log('没有用户信息')
        if(get_share_key){
          insertData.get_share_key=get_share_key
          // 继续查找商家信息
          let getStoreData=await selectStore(get_share_key)
          insertData.store_id=getStoreData.store_id
          insertData.store_name=getStoreData.store_name
        }
        pool.query(insertSql,[insertData],(err,inserRes)=>{
          if(err)throw err
          // 再查找
          pool.query(selectSql,[body.openId],(rr,rs)=>{
            if(rr)throw rr
            rs[0].create_time=sd.format(new Date(rs[0].create_time).getTime(),'YYYY-MM-DD HH:mm:ss') 

            data={
              open_id:body.openId,
              userInfo:rs[0]
            }
            let Token = auth.makeToken(rs[0].mid); 
            if(rs[0].mobile){
              res.send({
                code:200,
                data:data,
                token:Token
              })
            }else{
              res.send({
                code:100005,
                data:data,
                token:Token
              })
            }
          })
        })
      }else{
        // 有用户信息
        response[0].create_time=sd.format(new Date(response[0].create_time).getTime(),'YYYY-MM-DD HH:mm:ss') 
        data={
          open_id:body.openId,
          userInfo:response[0]
        }
        let Token = auth.makeToken(response[0].mid);

        // 没有get_share_key才去修改
        if(!response[0].get_share_key && get_share_key){
            console.log('有用户信息')
            var getShareKeyData=await getShareKey(body.openId,get_share_key)
            data= Object.assign({},data.userInfo,getShareKeyData)
        }

        if(response[0].mobile){
          // 有手机号码的话先验证是否是商家
          if(!response[0].post_share_key ){
            var storeData=await postShareKey(response[0].mobile)
            if(storeData) {data= Object.assign({},data.userInfo,storeData)}
          }

          res.send({
            code:200,
            data:data,
            token:Token
          })
        }else{
          res.send({
            code:100005,
            data:data,
            token:Token
          })
        }
        
      }

  })
})

router.post('/shopRegister',async (req,res)=>{
  let body=JSON.parse(JSON.stringify(req.body)) 
  
  /**
   * 解密手机号码
   */
  body.mobile='15917356315'
  var insertSql='update sys_admin_members set ? where open_id=?'
  var selectSql='select * from sys_admin_members where open_id=? '
  pool.query(insertSql,[body,body.open_id],async (err,inserRes)=>{
    if(err)throw err

    pool.query(selectSql,[body.open_id],async (err,selectRes)=>{
      if(err)throw err

      var storeData=await postShareKey(body.mobile)
      if(storeData){
        // 商家身份则修改相应信息
        selectRes[0]=Object.assign({},selectRes[0],storeData)
      }
      res.send({
        code:200,
        userInfo:selectRes[0]
      })
    })
  })
})

// 普通会员添加get_share_key 
async function getShareKey(openid,get_share_key){
  return new Promise((resolve,reject)=>{
    let updateData={
      get_share_key:get_share_key,
      member_name:'商家会员'
    }
    var insertSql=`update sys_admin_members set ? where open_id='${openid}'`
    var selectSql='select * from sys_admin_members where open_id=?'
    pool.query(insertSql,[updateData],(err,result)=>{
      if(err) throw err

      pool.query(selectSql,[openid],async (er,res)=>{
        if(er) throw er
        if(res.length>0){
          var store=await selectStore(get_share_key)
          res[0].store_id=store.store_id
          res[0].store_name=store.store_name
          resolve(res[0])
        }
      })
      
    })
  })
}

// 根据get_share_key查找商家
function selectStore(key){
  return new Promise((resolve,reject)=>{
    var sql='select * from sys_admin_store where post_share_key=?'
    pool.query(sql,[key],(err,result)=>{
      if(err)throw err
      if(result.length>0){
        resolve(result[0])
      }else{
        reject('请求错误')
      }
    })
  })
}


// 验证是否是商家，加上postShareKey
function postShareKey(value){
  return new Promise((resolve,reject)=>{
    var selectSql='select * from sys_admin_store where mobile=?'
    pool.query(selectSql,[value],(err,result)=>{
      if(err) throw err
      if(result.length>0){
        let updateData={
          store_name:result[0].store_name,
          post_share_key:result[0].post_share_key,
          store_id:result[0].store_id,
          member_name:'商家'
        }
        pool.query(
          `update sys_admin_members set ? where mobile=${value}`,[updateData],(er,insResult)=>{
          if(er)throw er
          let data={
            post_share_key:result[0].post_share_key,
            store_id:result[0].store_id,
            store_name:result[0].store_name,
          }
          resolve(data)
        })
      }else{
        resolve(false)
      }
    })
  })
}


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
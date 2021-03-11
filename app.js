const express=require('express')
const expressJWT = require('express-jwt');
const app =express();
app.use(express.static('public'))
const bodyParser=require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

app.all('*', function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); 
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization'); 
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    next();
})

// 解密token
var {PRIVITE_KEY} = require("./utils/store")
app.use(expressJWT({
    secret: PRIVITE_KEY,
    algorithms:['HS256'],
}).unless({
	path: ['/mpuser/getToken']  
}))

// 中间件，处理请求中公用的方法
// 针对rep或者res做一些操作
app.use((err,req,res,next)=>{
    if (err.name === 'UnauthorizedError') {	
      res.status(401).send({
          code:100002,
          message:'登录超时'
      });
      return
    }
    next()
})

// 小程序api
app.use('/mpuser', require('./routers/xiaochengxu/mpuser'));
app.use('/product', require('./routers/xiaochengxu/product'));


app.listen(3002,()=>{
    console.log('服务器开启')
})







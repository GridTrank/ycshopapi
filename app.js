const express=require('express')
const expressJWT = require('express-jwt');
const app =express();
app.use(express.static('public'))
const bodyParser=require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))



let allowORigin=[
    "http://47.112.113.38",
    "http://localhost:8080",
]
app.all('*', function(req, res, next) {
    if (allowORigin.indexOf(req.headers.origin) >= 0){
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST'); 
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization'); 
        res.header("content-Type", "application/json;charset=utf-8");
        res.header("Access-control-Allow-Credentials","true");
    }
    next();;
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
app.use('/cart', require('./routers/xiaochengxu/cart'));


app.listen(3002,()=>{
    console.log('服务器开启')
})







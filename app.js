const express=require('express')
const app =express();
app.use(express.static('public'))
const bodyParser=require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

const auth=require('./utils/auth')

let allowORigin=[
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8085",
    "http://120.77.246.130",
]
app.all('*', function(req, res, next) {
    if (allowORigin.indexOf(req.headers.origin) >= 0){
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST'); 
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization'); 
        res.header("content-Type", "application/json;charset=utf-8");
        res.header("Access-control-Allow-Credentials","true");
        if (req.getMethod().equals(HttpMethod.OPTIONS.name())){
            res.setStatus(HttpStatus.NO_CONTENT.value());
        }
    }
    next();;
})


// 小程序api
app.use('/mpuser', require('./routers/xiaochengxu/mpuser'));
app.use('/product', require('./routers/xiaochengxu/product'));
app.use('/cart', require('./routers/xiaochengxu/cart'));
app.use('/home', require('./routers/xiaochengxu/home'));


app.listen(3002,()=>{
    console.log('服务器开启')
})





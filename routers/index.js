const express=require('express')
const bodyParser=require('body-parser')
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}))

const auth=require('../utils/auth')
router.use('*',[auth.validate],function(req,res,next){ 
    next();
}); 

module.exports=router


const express=require('express')
const bodyParser=require('body-parser')
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}))


module.exports=router


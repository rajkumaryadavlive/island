const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const paintingServices = require("../services/paintingServices");
const landServices=require('../services/landServices');
const blockchainServices = require("../services/blockchainServices");
const userServices = require("../services/userServices");
const token = require('../helper/token');
const { JWT_SECRET_KEY } = require('../config/default.json');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH } = require('../helper/ethHelper');
const { UserInfo } = require("../models/userModel");
const categoryServices=require('../services/categoryServices');
const signNftServices=require('../services/signNftServices');
const contentCreaterServices=require('../services/contentCreaterServices');
function authuser(req, res, next) {
    if (req.session&&req.session.role) 
      {
        if(req.session.role!="user")
        {
            res.redirect('/users/dashboard');

        }
      }
      
    next();
}


const Storage = multer.diskStorage({
    destination:'./public/uploadFile',
    filename:(req,file,cb)=>{
      cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})

//middleware
const upload = multer({
    storage:Storage
}).single('file');

const market=async (req,res)=>{
   // let lands=await landServices.findLand();
    let lands=await landServices.findLand()
  
      console.log('land data',lands)
 
        res.render('market',{ layout: 'layout/front/frontlayout',name:req.session.re_usr_name,lands:lands});
}

const map=async (req,res)=>{
    res.render('map',{ layout: 'layout/front/frontlayout',name:req.session.re_usr_name});
}
const index=async(req,res)=>{
    res.render('index',{layout:'layout/front/frontlayout',name: req.session.re_usr_name})
}
const exploreContent=async(req,res)=>{
    let query=req.query.category;
    let sortby=req.query.sortby;
    console.log(query); console.log(sortby);
    let content = await paintingServices.getpaintingList(query,sortby);

    res.send(content);

}

const model=async (req,res)=>{
     
    res.render('models',{ layout: 'layouts/front/layout',name:req.session.re_usr_name});

}
const contentDetail=async(req,res)=>{
    let id=req.query.id.trim();
    let lands=await landServices.findLandById(id)
    console.log('get by id land',lands)
    //let details=await paintingServices.getContentDetail(id);
    //let creater=await userServices.checkUserByID(details.created_by);
    res.render('details',{layout:'layout/front/frontlayout',name:req.session.re_usr_name,land:lands});
}

const author=async(req,res)=>{
    let author_id=req.query.id.trim();

    let content=await paintingServices.autherContent(author_id);
    let user=await userServices.checkUserId(author_id);
    console.log(content);
    res.render('author',{ layout: 'layouts/front/layout',name:req.session.re_usr_name,content:content,user:user});
}

const fetchNft=async(req,res)=>{
    let id=req.query.id.trim();
    console.log(id);
    let nft=await signNftServices.findByIdVoucher(id);
    res.send(nft);
}
const addOrder=async(req,res)=>{
    let id=req.query.id.trim();
    let hash=req.query.hash;
    let address=req.query.address;
    let land_id=req.query.land_id;
    try{ 
        let nft=await signNftServices.updateNftStatus(id);
        
        /*
        let user=await userServices.checkUserByWallet(address);
        let user_id="";
        if(user){
            user_id=user._id;
            req.session.success = true;
            req.session.re_us_id = user._id;
            req.session.re_usr_name = user.name;
            req.session.re_usr_email = user.email;
            req.session.is_user_logged_in = true;
            req.session.role=user.user_role;
          }
        else
          {
                let email=address+"@gmail.com";
                let mystr = await contentCreaterServices.createCipher("123456");
                let created = await contentCreaterServices.createAtTimer();
                userOBJ={ name:address,
                       email:email,
                       password:mystr,
                       username:"metamask",
                       mobile:"1234567898",
                       wallet_address:address,
                       user_role:"user",
                       created_at:created  
                       }
    
                       let newuser = await userServices.addUserByWallet(userOBJ);
                       let user=await userServices.checkUserByWallet(address);
                       user_id=user._id;
                       req.session.success = true;
                       req.session.re_us_id = user._id;
                       req.session.re_usr_name = user.name;
                       req.session.re_usr_email = user.email;
                       req.session.is_user_logged_in = true;
                       req.session.role=user.user_role;      
          }

          let order={
            user_id:user_id,
            land_id:land_id,
            hash:hash,
            wallet_address:req.body.address,
            total:req.body.amount,
            status:"success"
            } 
            let orderData=await orderServices.saveOrder(order);
             */
          res.send(nft);
    }catch(e){console.log(e);}

}
module.exports = {
    market,
    exploreContent,
    model,
    contentDetail,
    index,
    author,
    authuser,
    map,
    addOrder,
    fetchNft
};

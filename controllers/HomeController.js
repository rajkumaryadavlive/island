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

module.exports = {
    market,
    exploreContent,
    model,
    contentDetail,
    index,
    author,
    authuser,
    map
};

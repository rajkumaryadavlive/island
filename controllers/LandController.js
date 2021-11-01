const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const userServices = require("../services/userServices");
const blockchainServices = require("../services/blockchainServices");
const token = require('../helper/token');
const { JWT_SECRET_KEY } = require('../config/default.json');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH } = require('../helper/ethHelper');
const { activationTokens } = require('../models/contact');
const orderServices=require('../services/orderServices');
const categoryServices=require('../services/categoryServices');
const landServices=require('../services/landServices');
const signNftServices=require('../services/signNftServices');
const base_url = process.env.BASE_URL;

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

const uploadFiles = multer({ storage : Storage }).array('file',4);

const createLand=async (req,res)=>{
        
        res.render('admin/land/add',{title:"Add Land",role:req.session.role,name:req.session.re_usr_name});
    }

const saveLand=async(req,res)=>{
    let land=req.body;
    let user_id=req.session.re_us_id;
    let files="";
    if(req.files){
        files=req.files;
    }

    let landObj={
              name:land.name,
              price:land.price,
              size:land.size,
              quantity:land.quantity,
              content:land.content,
              created_by:user_id,
            }

   let  landDetail=await landServices.addLand(landObj);   
   console.log(landDetail);
   req.session.land=land;  
   req.session.land_image= req.files[0].filename;
   console.log('files',files);
   files.forEach( async function(file,index)
    {
     let media_type=file.mimetype.split("/","2");
    
     console.log(media_type);
     let imageObj={land_id:landDetail._id,name:file.filename,type:media_type}
     let content_media=await landServices.addImages(imageObj);
     console.log(content_media);
   });

   res.redirect('/users/mint-land');
}

const mintLand=async(req,res)=>{
    let land=req.session.land;
    let land_image=req.session.land_image;
    console.log('land_image',land_image);
    res.render('admin/nft/mint-nft',{role:req.session.role,land_image:land_image,land:land,name:req.session.re_usr_name});
}

const updateLand=async(req,res)=>{
    let land=req.body;
    let id=req.body.id;
    let user_id=req.session.re_us_id;
    if(req.files){
        files=req.files;
    }

    let landObj={
              name:land.name,
              price:land.price,
              size:land.size,
              quantity:land.quantity,
              content:land.content,
              created_by:user_id,
            }

   let  landDetail=await landServices.editLand(landObj,id);   
   console.log(landDetail);

    if(files){
        files.forEach( async function(file,index)
        {
         let media_type=file.mimetype.split("/","2");
        
         console.log(media_type);
         let image={land_id:landDetail._id,name:file.filename,type:media_type}
         let content_media=await landServices.updateImages(imageObj);
         console.log(content_media);
       });
    }

   res.redirect('/users/lands');
}
const land=async (req,res)=>{
    let lands=await landServices.findLand();
    res.render('admin/land/',{lands:lands,role:req.session.role,name:req.session.re_usr_name});

}

const editLand=async (req,res)=>{
     let orders=await orderServices.getOrders();
      console.log(orders);
     res.render('admin/land/edit',{role:req.session.role,name:req.session.re_usr_name,orders:orders});
    
}

const signNft=async(req,res)=>{
    let voucher=req.query.voucher;
    let copy_no=req.query.no_of_copy;
    let land_id=req.query.land_id;
    let image_name=req.query.land_image
    console.log(copy_no);
    let imageUrl=base_url+'/uploadFile/'+land_image;
        
      tokenUrl=imageUrl;  
    for(let i=0;i<copy_no;i++){
        let token_id =Math.floor(Math.random() * 10000);
       
        console.log(token_id);
          let nftObj="";
          if(i>0){
           
            nftObj={land_id:land_id,
                signature:voucher.signature,
                token_id:token_id,
                token_url:tokenUrl,
                min_price:voucher.minPrice,
                }
           
          }else
            {
               

                     nftObj={land_id:land_id,
                        signature:voucher.signature,
                        token_id:voucher.tokenId,
                        token_url:tokenUrl,
                        min_price:voucher.minPrice,
                        }
            }

        try{
            
          let nft=await signNftServices.addVoucher(nftObj);
          console.log(nft);
       }catch(e){console.log(e); }

      
    }
    //res.send(voucher);
    res.send(voucher);

}

module.exports = {
    createLand,
    land,
    editLand,
    uploadFiles,
    saveLand,
    updateLand,
    mintLand,
    signNft
};

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
 let video_name=req.files[1].filename;
 let image_name=req.files[0].filename;

 console.log(video_name);
 console.log('image name',image_name);

    let landObj={
              name:land.name,
              price:land.price,
              size:land.size,
              quantity:land.quantity,
              image:image_name,
              video:video_name,
              content:land.content,
              created_by:user_id,
            }

   let  landDetail=await landServices.addLand(landObj);   
   console.log(landDetail);
   req.session.land=landDetail;  
   req.session.land_image= req.files[0].filename;
   console.log('files',files);
   files.forEach( async function(file,index)
    {
     let media_type=file.mimetype.split("/","2");
    
     console.log(media_type);
     let imageObj={land_id:landDetail._id,name:file.filename,type:media_type}
     console.log('images fata',imageObj)
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
  console.log('data update land',req.body)
  
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
              //created_by:user_id,
            }
            
   let  landDetail=await landServices.editLand(landObj,id); 

   console.log('landDetail',landDetail);

    if(files){
        files.forEach( async function(file,index)
        {
         let media_type=file.mimetype.split("/","2");
        
          console.log('AAAAAAAAAAAAAAA',media_type);
          let imageObj={name:file.filename,type:media_type}
          
            if(media_type.includes('image')){
              console.log('ddddd',file.filename);
             await landServices.editLand({image:file.filename},id);
            }
            else
              {
                console.log('eeeee',file.filename);
                await landServices.editLand({video:file.filename},id);
              }

         let content_media=await landServices.updateImages(imageObj,id);
         console.log('image update',content_media);
       });
    }

   res.redirect('/users/lands');
}
const deleteLand= async (req,res)=>{
  let id = req.query.id.trim()
  let responce=await landServices.deleteLandById(id);
  console.log('delete land resp',responce)
  if(responce){
    res.redirect('/users/lands');
  }
}
const land=async (req,res)=>{
    //let landData=await landServices.findLand();

    //console.log('lands',landData);
    //console.log('land data',lands)

     let landDatas = await landServices.findAllLand()
     var data=[]
     for(var key of landDatas){
         var temp = JSON.stringify(key);
         var temp1 = JSON.parse(temp);
         let imageInfos = await landServices.findImagesByID(key._id)
         temp1.imageinfo = imageInfos
         data.push(temp1)
     }
     console.log('data ===========================',data)
    res.render('admin/land/',{landData:data,role:req.session.role,name:req.session.re_usr_name,});

}

const landDetail=async(req,res)=>{
  let id=req.query.id.trim();
  let land=await landServices.findLandById(id);
  let images=await landServices.findImagebyId(land._id);
  let nft=await signNftServices.totalVoucher(land._id);//findByIdVoucher(land._id);
  
  console.log(images)
  console.log(land);
  res.render('details',{layout:'layout/front/frontlayout',nft:nft,name:req.session.re_usr_name,land:land,images:images});
}

const editLand=async (req,res)=>{
  var id = req.query.id
     let orders=await landServices.findLandById(id);
      console.log(orders);
     res.render('admin/land/edit',{role:req.session.role,name:req.session.re_usr_name,land:orders});
    
}

const signNft=async(req,res)=>{
    let voucher=req.query.voucher;
    let copy_no=req.query.no_of_copy;
    let land_id=req.query.land_id;
    let image_name=req.query.land_image
    console.log(copy_no);
    console.log('land_is',land_id);
    let imageUrl=base_url+'/uploadFile/'+image_name;
        
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
    signNft,
    deleteLand,
    landDetail
};

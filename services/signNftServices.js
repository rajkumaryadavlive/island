const {SignNftInfo}=require('../models/SignNft');
const { mail } = require('../helper/mailer');
const API_URL = process.env.API_URL;

const addVoucher=async(nftData)=>{
      try{

          let nftObj=new SignNftInfo(nftData);
          await nftObj.save();
          return nftObj;
      }catch(e){
          console.log(e);
      }
}

const findByIdVoucher=async(id)=>{
        try{
            let voucher=await SignNftInfo.findOne({land_id:id,status:0});
           return voucher;
        }catch(e){console.log(e)}
}
const findAllVoucher=async(id)=>{
    try{
        let voucher=await SignNftInfo.find();
       return voucher;
    }catch(e){console.log(e)}
}

const updateNftStatus=async(id)=>{
    try{
        let voucher=await SignNftInfo.updateOne({_id:id},{$set:{status:1}});
       return voucher;
    }catch(e){console.log(e)}
}



const SignData=async(voucher)=>{

    try{

        let data= await web3.eth.accounts.sign(voucher,PRIVATE_KEY);
        console.log(data);
        return data;

    }catch(e){console.log(e);}
      
}

const totalNft=async()=>{
    try{
         return await  SignNftInfo.find({}).count();
    }catch(e){console.log(e)}
}

const availableNft=async()=>{
    try{
         return await  SignNftInfo.find({'status':0}).count();
    }catch(e){console.log(e)}
}

const soldNft=async()=>{
    try{
         return await  SignNftInfo.find({'status':1}).count();
    }catch(e){console.log(e)}
}

module.exports={addVoucher,
               findByIdVoucher,
               SignData,
               updateNftStatus,
               findAllVoucher,
               totalNft,
               soldNft,
               availableNft
              }
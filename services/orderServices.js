const { hashSync } = require("bcryptjs");
const moment = require("moment");
const crypto = require('crypto');
const { generateCode, generateActivationToken } = require('../helper/userHelper');
const { Registration, Userwallet, Importwallet, Tokensettings, Tokendetails, OrderDetails, RefCode, FAQ, ContactInfo, activationTokens } = require('../models/contact');
const {  UserInfo } = require('../models/userModel');
const { OrderInfo } =require('../models/orderModel');
const { mail } = require('../helper/mailer');
const moongoose = require('mongoose');



const saveOrder=async (orderData)=>{
    try{
      let Order= new OrderInfo(orderData);
      await Order.save();
      return Order;
    }catch(error){
      console.log(error);
       return null;
    }
    
    
}
const getOrders=async()=>{
  /*let orders= await OrderInfo.aggregate([
    { "$sort": { "_id":-1 } },
    {"$lookup": {
    "localField": "user_id",
    "from": "users",
    "foreignField": "_id",
    "as": "userinfo"
    } },
    { "$unwind": "$userinfo" }
   ]);*/

   let orders=await OrderInfo.find({}).sort( { _id: -1 } ); 
      

  return orders;
}

const findOrder=async(id)=>{
   let order=await OrderInfo.findOne({'_id':id});
   return order;
}

const getKycList=async(req,res)=>{
 
  let users= await UserInfo.aggregate([
    { $lookup:
       {
         from: 'kycs',
         localField:'_id',
         foreignField:'user_id',
         as: 'kyc_info'
       }
     },
     {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$kyc_info", 0 ] }, "$$ROOT" ] } }
   },
   { $project: { kyc_info: 0 } }
    ]);
  console.log(users);
    return users;
    
}

const createCipher = async (text) => {
  let mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
  let mystr1 = mykey1.update(text, 'utf8', 'hex')
  mystr1 += mykey1.final('hex');
  return mystr1;
};

const createAtTimer = async () => {
  let indiaTime1 = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
  let indiaTime = new Date(indiaTime1);
  let created_at = indiaTime.toLocaleString();
  return created_at;
};




const sendActivationMail = async function (newuser, req) {
  let activationTokenId = await generateActivationToken(newuser)
  console.log(`26 userServices TokenId`, activationTokenId)
  const subject = 'JUSTyours Account Activation'
  const reciever = `${newuser.email}`
  const message = `
  <h3> Hello ${newuser.name}, </h3>
  <p>Thank you for registering on JUSTyours.</p>
  <p>To activate your account please follow this link:</p>
  <p> <a target="_" href="http://${req.headers.host}/activate/user/${activationTokenId}" </a>Click Here</p>
  <p>This link will get deactivated in 30 min</p>
  <p>Team JUSTyours</p>`;

  let sendmail = await mail(reciever, subject, message);
  if (sendmail) {
    return true;
  }
}





const sendNewPasswordMail = async function (req, otp, user_id) {
  console.log(otp)
  let user = await Registration.findOne({ '_id': user_id });

  console.log(`ForgetPassword OTP generated for ${user.name}`);
  const subject = 'JUSTyours Forget Password'
  const reciever = `${user.email}`
  const message = `
      <h3> Hello ${user.name}, </h3>
      <p>Thank you for using JUSTyours.</p>
      <p>Here is your password please don't share this with anybody</p>
      <p> <h2>${otp}</h2></p>
      <p>You can change password once you login</p>
      <p>Team JUSTyours</p>`;
  let sendmail = await mail(reciever, subject, message);
  if (sendmail) {
    return true;
  }

}
const findOrderByID=async(user_id)=>{
  try{
      let order=await OrderInfo.find({'creator_id':user_id});
      return order;
  }catch(err){
    console.log(err);
  }
}

const updateOrder=async(order_id)=>{
  let order=await OrderInfo.updateOne({ '_id':order_id}, { $set: { status:"confirmed" } });
  

}
const totalEarning=async(user_id)=>{
  let total= await OrderInfo.find({"creator_id":user_id});
  let earning=0;
  total.forEach(element => {
    earning=earning+parseInt(element.total);
  });
   return earning;
 }

 const updateNftHash=async(id,hash)=>{
  let order=await OrderInfo.updateOne({'trans_id':id}, { $set: {nft_hash:hash} });
}
const findOrderByUser=async(user_id,address)=>{
  console.log('user id',user_id);
   try{
        //let order=await OrderInfo.find({'user_id':user_id});
   /* let orders= await OrderInfo.aggregate([
    { "$match": {'user_id':new moongoose.Types.ObjectId(user_id) } },  
    { "$sort": { "_id":-1 } },
    {"$lookup": {
    "localField": "land_id",
    "from": "lands",
    "foreignField": "_id",
    "as": "landInfo"
    } },
    { "$unwind": "$landInfo" }
    ]);*/
      
      let regex = new RegExp(address,'i');

      let orders=await OrderInfo.find({wallet_address:regex}).sort( { _id: -1 } ); 
      
        return orders; 
      }catch(e){console.log(e)}  
    }
module.exports = {
  saveOrder,
  getOrders,
  findOrder,
  findOrderByID,
  updateOrder,
  totalEarning,
  findOrderByUser,
  updateNftHash
};

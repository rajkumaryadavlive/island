const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const paintingServices = require("../services/paintingServices");
const userServices = require("../services/userServices");
const blockchainServices = require("../services/blockchainServices");
const token = require('../helper/token');
const { JWT_SECRET_KEY } = require('../config/default.json');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH } = require('../helper/ethHelper');
const { activationTokens } = require('../models/contact');
const contentCreaterServices = require("../services/contentCreaterServices");
const orderServices = require("../services/orderServices");
const categoryServices=require('../services/categoryServices');
const pageServices=require('../services/pageServices');
const signNftServices=require('../services/signNftServices')
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

const loginPage = async (req, res) => {
       let err_msg = req.flash('err_msg');
       let success_msg=req.flash('success_msg');
    //let success_msg = req.flash('success_msg');
       let user_id=req.session.re_us_id;
       let role=req.session.role;

        if(user_id)
        {
            if(role=="user"){
                res.redirect('/');
            }else
              {
                  res.redirect('/users/dashboard');
              }
          
        }
        else
        {
           // res.render('users/login', { layout: 'layouts/front/layout',err_msg:err_msg ,name: req.session.re_usr_name,success_msg:success_msg});
           res.render('login',{ layout: false });

        }
    
}


const passwordPage = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg=req.flash('success_msg');
 //let success_msg = req.flash('success_msg');
    let user_id=req.session.re_us_id;
    let role=req.session.role;

     if(user_id)
     {
        res.render('users/creaters/change-password',{title:"Dashboard",role:req.session.role,name:req.session.re_usr_name,success_msg} );
       
     }
     else
     {
        res.redirect('/');
     }
 
}

const signup= async (req,res)=> {
    let err_msg = req.flash('err_msg');
    
       let user_id=req.session.re_us_id;
       let role=req.session.role;

        if(user_id)
        {
            if(role=="user"){
                res.redirect('/');
            }else
              {
                  res.redirect('/users/dashboard');
              }
          
        }
        else
        {

            res.render('users/register', { layout: 'layouts/front/layout',name: req.session.re_usr_name,err_msg});

        }



}



const userLogin = async (req, res) => {
    //console.log(req.body)
    let user = await userServices.checkUser(req.body.email);
    let password = req.body.password.trim();
    let mystr = await userServices.createCipher(password);
    if (user) {
        if (user.email_verified == true) {
            let wallet = { success: 0, msg: "Account not activated please activate account before login" };
            let wallet_details = JSON.stringify(wallet);
            return res.send(wallet_details);
        }
        userObject = {
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            mobile: user.mobile,
            role: user.user_role,
            status: user.status,
        }
        let userLogin = await userServices.checkUserPass(req.body.email.trim(), mystr);
        if (userLogin) {
            if (userLogin.status == 'active' ) 
             {
                req.session.success = true;
                req.session.re_us_id = userLogin._id;
                req.session.re_usr_name = userLogin.name;
                req.session.re_usr_email = userLogin.email;
                req.session.is_user_logged_in = true;
                req.session.role=userLogin.user_role;
                req.session.is_approved=userLogin.isApproved;
                console.log(req.session);
                res.redirect('/users/dashboard');
            } 
            else 
            {
                req.flash('err_msg', 'Your account is not active.');
                res.redirect('/users/login')
            }
        }
        else {
            req.flash('err_msg', 'The username or password is incorrect.');
            res.redirect('/users/login');
           
        }
    }
    else {
        //let message = { success: 0, msg: "Email address does not exist." };
        req.flash('err_msg', 'Email does not exist.');
        res.redirect('users/login');
    }
}


const submitSignup = async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let mobile = req.body.mobile;
   // let username = req.body.username;
    
      console.log(req.body);
        if(name && email && password && mobile){
            let user = await userServices.checkUser(req.body.email);
            console.log(user);
            if (user) 
             {
                req.flash('err_msg', 'Email already exists. Please enter another email.');
                res.redirect('/users/signup');
            }
            else {
                let mystr = await contentCreaterServices.createCipher(req.body.password);
                let created = await contentCreaterServices.createAtTimer();
                let newuser = await userServices.addUser(req.body, mystr, created);
                let user = await userServices.checkUser(req.body.email);
                //let activationmail = await userServices.sendActivationMail(user, req)
                console.log(user);
                let otp="";
                let subject = 'Taboo NFT Signup';
                let text = 'Hello '+ req.body.name + ',<br><br>\n\nCongratulations on signing up with The Taboo NFT website!<br><br>\n\n' +
                'If this withdrawal attempt was not made by you it means someone visited your account. It may be an indication you have been the target of a phishing attempt and might want to consider moving your funds to a new wallet.' + '<br><br>\n\n' + 'Regards,<br>\nTeam The Taboo NFT';
               
                try{
                    await mail(req.body.email, subject, text);
                }catch(err){
                    console.log(err);
                }


                req.flash('success_msg', 'You are registered successfully. Please login to continue.');
              res.redirect('/users/login');
            }
        
        }
   
}


const logout = async (req, res) => {
    req.session.destroy();
    res.redirect('/');
}


const loginByWallet=async(req,res)=>{
    let address=req.query.account;
    console.log(address);
    if(address=="undefined"||address==""||address==null){
       
        res.send(false);
  
     }else{
        
        
        let userCheck=await userServices.checkUserByWalletAddress(address);
         console.log("user account",userCheck);
         if(userCheck>0){
            let user=await userServices.checkUserByWallet(address);
             req.session.success = true;
             req.session.re_us_id = user._id;
             req.session.re_usr_name = user.name;
             req.session.re_usr_email = user.email;
             req.session.is_user_logged_in = true;
             req.session.role=user.user_role;
             req.session.wallet_address=user.wallet_address;

             console.log(req.session);
             res.send(user);
         }else
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
     
     
              req.session.success = true;
              req.session.re_us_id = user._id;
              req.session.re_usr_name = user.name;
              req.session.re_usr_email = user.email;
              req.session.is_user_logged_in = true;
              req.session.role=user.user_role;
              req.session.wallet_address=user.wallet_address;
              console.log(req.session);
     
              res.send(user);
           }
     }
    
}

const updateProfile=async(req,res)=>{
    let image="";
    let user_id=req.session.re_us_id;
    console.log(req.file);
      if(!req.file){
            
        image=req.body.old_image;
    
      }
      else
      {
         image= req.file.filename;

      }

     let user=await userServices.updateProfile(image,user_id,req.body);
      console.log(user);
      res.redirect('/users/profile');

}

const privacyPage=async(req,res)=>{
    let page=await  pageServices.findPageByName('privacy');
    res.render('admin/privacy/create',{role:req.session.role,name:req.session.re_usr_name,page:page});
}

const termsPage=async(req,res)=>{
    let page=await  pageServices.findPageByName('terms');

    res.render('admin/terms-conditions/create',{role:req.session.role,name:req.session.re_usr_name,page:page});
}

const userProfile=async(req,res)=>{

    let id=req.session.re_us_id;

    let user= await userServices.checkUserId(id);

    console.log("user profile",user);

    res.render('users/creaters/update-profile',{title:"profile",user:user,role:req.session.role,name:req.session.re_usr_name});

}

const activateAccount = async (req, res) => {
    let email = req.body.email;
    let user = await userServices.checkUser(email)
    if (user) {
        let mail = await userServices.sendActivationMail(user, req)
        let wallet = { success: 1, msg: "We have sent an activation mail to your registered mail." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
    else {
        let wallet = { success: 0, msg: "Email address does not exist." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
}

const activateUser = async function (req, res) {
    const tokenId = req.params.id
    console.log(tokenId)
    let token = await activationTokens.findOne({ '_id': tokenId });
    if (token) {
        let activate = await userServices.updateUserStatus(token._userId)
        if (activate) {
            let wallet = { success: 1, msg: "Account activted successfully" };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
        else {
            let wallet = { success: 0, msg: "Something went wrong please try later" };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
    else {
        let wallet = { success: 0, msg: "Activation link deactivated Please resend detials to get activation mail." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
}

const dashboard=async (req,res)=>{
    let user_id=req.session.re_us_id;
    let role=req.session.role;
    let loginwallet = await blockchainServices.importWalletFindId(user_id);
    console.log("login wallet",loginwallet)
    let total= await signNftServices.totalNft();
    let total_for_sale=await signNftServices.availableNft()
    let total_pending=await paintingServices.totalPendingContent(user_id,role);
    let total_creater=await userServices.totalCreators();
    let total_earning=await orderServices.totalEarning(user_id);

    console.log("earning",total_earning)
    if(role=="admin")
      {
        let category=await categoryServices.findAllCategory();

        res.render('admin/dashboard',{title:"Dashboard",role:req.session.role,name:req.session.re_usr_name,total,total_for_sale,total_pending,total_creater,category:category});
      }
     else
     {
        if(loginwallet){

            let contents=await paintingServices.paintingList(user_id);
            let category=await categoryServices.findAllCategory();

            res.render('users/dashboard',{title:"Dashboard",role:req.session.role,contents,name:req.session.re_usr_name,total,total_for_sale,total_pending,total_earning,category:category});

        }else{
            res.redirect('/users/create-wallet');
        }
     }
}
const getCreaters=async(req,res)=>{
    let users= await userServices.creaters();
    console.log(users);
    res.render('users/creaters/',{title:"Creaters",role:req.session.role,users:users,name:req.session.re_usr_name});
}
const acceptUser=async (req,res)=>{
     let id=req.query.id.trim();
     console.log("user id",id);
     let status="active";
     let user=await userServices.checkUserByID(id);
     console.log(user);
     if(user){
        let user= await userServices.updateAccount(id,status);

              let subject = 'Taboo NFT Signup';
                let text = 'Hello '+user.name + ',<br><br>\n\n Your Account has been actived with The Taboo NFT website!<br><br>\n\n' +
                'If this withdrawal attempt was not made by you it means someone visited your account. It may be an indication you have been the target of a phishing attempt and might want to consider moving your funds to a new wallet.' + '<br><br>\n\n' + 'Regards,<br>\nTeam The Taboo NFT';
               
                try{
                    await mail(user.email, subject, text);
                }catch(err){
                    console.log(err);
                }
        res.redirect('/users/creaters');
     }
     else
     {
         console.log("record not found");
     }

}


const rejectUser=async (req,res)=>{
    let id=req.query.id.trim();
    console.log("user id",id);
    let status="inactive";
    let user=await userServices.checkUserByID(id);
    console.log(user);
    if(user){
       let user= await userServices.updateAccount(id,status);

       let subject = 'Taboo NFT Signup';
       let text = 'Hello '+ user.name + ',<br><br>\n\n Your Account has been deactived with The Taboo NFT website!<br><br>\n\n' +
       'If this withdrawal attempt was not made by you it means someone visited your account. It may be an indication you have been the target of a phishing attempt and might want to consider moving your funds to a new wallet.' + '<br><br>\n\n' + 'Regards,<br>\nTeam The Taboo NFT';
      
       try{
           await mail(user.email, subject, text);
       }catch(err){
           console.log(err);
       }

       res.redirect('/users/creaters');
    }
    else
    {
        console.log("record not found");
    }

}

const forgetPassword = async (req, res) => {
    let user = await userServices.checkUser(req.body.email);
    if (!user) {
        let wallet = { success: 0, msg: "Email address does not exist." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
    else {
        let new_pass = Math.random().toString(36).slice(-6);
        console.log(new_pass, '----------new_pass');
        let mystr1 = await userServices.createCipher(new_pass);
        let userUpdated = await userServices.updateUserPassword(req.body.email, mystr1);
        if (userUpdated) {
            let passwordmail = await userServices.sendNewPasswordMail(req, new_pass, userUpdated._id)
            let wallet = { success: 1, msg: "Password mail sent to registered email" };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
        else {
            let wallet = { success: 0, msg: "An error occured." };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
}

const updatePassword = async (req, res) => {
    let user_id ='616035fd04df5e835574abab'; //req.session.re_us_id;
   // console.log(req.body.password)
    let newpassword = await contentCreaterServices.createCipher('@dm1np@n3l$$!');

    try{

        let user=await userServices.updateUserPasswordID(user_id,newpassword);
        res.send(user)
    }catch(err){
        console.log(err);
    }
   
}

module.exports = {
    upload,
    userLogin,
    activateAccount,
    activateUser,
    loginPage,
    forgetPassword,
    logout,
    signup,
    dashboard,
    submitSignup,
    getCreaters,
    acceptUser,
    rejectUser,
    loginByWallet,
    userProfile,
    updateProfile,
    updatePassword,
    updatePassword,
    passwordPage,
    privacyPage,
    termsPage
};

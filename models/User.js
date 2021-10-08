const mongoose=require('mongoose');

const validator=require('validator');

const bcrypt = require('bcryptjs');

const UserSchema=new mongoose.Schema({

   name:{
        type:String,
        default:null,
    },
    email:{
        type:String,
        default:null,
    },
    wallet_address:{
        type:String,
        default:null,
    },
    user_role:{
        type:String,
        default:'user',
    },
    password:{
        type:String,
        default:null,
    },
    created_at:{
        type:String,
        default:new Date()
    },
    updated_at:{
        type:String,
        default:null
    }
})

var UserInfo =  mongoose.model('users',UserSchema);

module.exports = {UserInfo:UserInfo};


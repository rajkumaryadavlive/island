const mongoose=require('mongoose');

const validator=require('validator');

const bcrypt = require('bcryptjs');

const ContentSchema=new mongoose.Schema({

    title:{
        type:String,
        default:null,
    },
    price:{
        type:String,
        default:null,
    },
    image:{
        type:String,
        default:null,
    },
    description:{
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

var ContentInfo =  mongoose.model('contents',ContentSchema);

module.exports = {ContentInfo:ContentInfo};


const moongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

/**How access and token works only we are perfoming just restructuring****/

var LandSchema =  new moongoose.Schema({

   name:{

        type:String
    },
    price:{
        type:String,
    },
    quantity:{
        type:String,
        required:true
    },
    size:{
        type:String,
         default:null
    },
    image:{
        type:String,
         default:null
    },
    video:{
        type:String,
         default:null
    },
    content:{
        type:String,
        default:null
    },
    created_at: { 
                    type: String,
                    default: new Date()
                },
    
    created_by:[{ type: moongoose.Schema.Types.ObjectId, ref: 'users' }],
    updated_at: {

            type: String,
            default: null
    },

    updated_by: {

            type:String,
            default:0
    },
    status:{

        type:String,
        default:'active'

    },

});


var LandInfo =  moongoose.model('lands',LandSchema);

module.exports = {LandInfo:LandInfo};

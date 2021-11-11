const moongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

/**How access and token works only we are perfoming just restructuring****/

var OrderSchema =  new moongoose.Schema({

    user_id:[{ type: moongoose.Schema.Types.ObjectId, ref: 'users' }],

    land_id:[{ type: moongoose.Schema.Types.ObjectId, ref: 'paintings' }],
   
    wallet_address:{
           type:String
         },  
    address_to:{
          type:String,
        },        
    hash:{
          type:String
    }, 
    total:{
       type:String
      },
    status:{

        type:String,
        default:'success'

    },
    created_at:{ 
                    type: String,
                    default: new Date()
                },
   
});

var OrderInfo =  moongoose.model('orders',OrderSchema);

module.exports = {OrderInfo:OrderInfo};

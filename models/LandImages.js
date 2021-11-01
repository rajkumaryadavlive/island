const moongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

/**How access and token works only we are perfoming just restructuring****/

var LandImageSchema =  new moongoose.Schema({

   land_id:[{ type: moongoose.Schema.Types.ObjectId, ref: 'lands' }],
    name:{
        type: String
    },
    type:{
        type:[],
        default:null
    },
    status:{
        type:String,
        default:'active'

    },
    created_at: { 
                    type: String,
                    default: new Date()
                },
    updated_at: {

            type: String,
            default: null
    },
   

});


var LandImageInfo =  moongoose.model('land_images',LandImageSchema);

module.exports = {LandImageInfo:LandImageInfo};

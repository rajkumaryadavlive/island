const {LandInfo}=require('../models/Land');
const {LandImageInfo}=require('../models/LandImages');
const addLand=async(data)=>{
    try{
        
        let land=new LandInfo(data);
        await land.save();
        return land;
    }catch(e){console.log(e)}
}

const editLand=async(data,id)=>{
    try{
       let land=await LandInfo.updateOne('_id',{$set:{data}});
       return land;
    }catch(e){console.log(e);}
}
const findLandById=async(id)=>{
    try{
       return await LandInfo.findOne({'_id':id});
    }catch(e){ console.log(e); }
}
const findLand=async()=>{
     try{
         
         lands=await LandInfo.aggregate([
            { "$match": {'status':'active'} },
            { "$sort": { "price": 1 } },
            { "$limit": 20 }, 
            { "$lookup": {
              "localField": "_id",
              "from": "land_images",
              "foreignField": "land_id",
              "as": "imageinfo"
            } },
            { "$unwind": "$imageinfo" },
            { "$project": {
              "name":1,
              "price":1,
              "size":1,
               "quantity":1,
              "_id":1,
              "imageinfo._id": 1,
              "imageinfo.name": 1,
              "imageinfo.type": 1
            } }
          ]);  
        
          if(lands){
            return lands;
          }
      }catch(e){console.log(e);}
}

const addImages=async(id,LandImage)=>{
     try{
         let images=new LandImageInfo(LandImage)
         await images.save();
         return images;
     }catch(e){ console.log(e); }
  }

module.exports={findLand,addLand,editLand,findLandById,addImages}
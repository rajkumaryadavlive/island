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
        console.log('==========data',data,'++++++id',id)
       let land=await LandInfo.updateOne({'_id':id},{$set:data});
      console.log('land',land)
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
         
        let lands=await LandInfo.aggregate([
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

const addImages=async(LandImage)=>{
     try{
         let images=new LandImageInfo(LandImage)
         await images.save();
         return images;
     }catch(e){ console.log(e); }
  }

 const findImagebyId=async(id)=>{
     try{
       let images=await LandImageInfo.find({'land_id':id});
       return  images;
     }catch(e){console.log(e);}
 } 

  const updateImages=async(imageObj,id)=>{
    try{
       
        let data=await LandImageInfo.updateOne({'land_id':id},{$set:imageObj});
        return data;
    }catch(e){ console.log(e); }
 }
 
 const deleteLandById=async(id)=>{
    try{
       
        let data=await LandInfo.deleteOne({'_id':id});
        return data;
    }catch(e){ console.log(e); }
 }
module.exports={findLand,
                addLand,
                editLand,
                findLandById,
                addImages,
                updateImages,
                deleteLandById,
                findImagebyId}
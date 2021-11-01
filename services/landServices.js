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
         return await LandInfo.find({});
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
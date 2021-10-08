const {CategoryInfo}=require('../models/Category');

const createCategory=async(categoryObj)=>{

    try{
        let category=new CategoryInfo(categoryObj);
        await category.save();
        return category;
    }catch(err){
        console.log(err);
    }

}

const findAllCategory=async()=>{
    try{
         return await CategoryInfo.find({});
    }catch(err){
        console.log(err);
    }

}

const findCategory=async(id)=>{
    try{
          return await CategoryInfo.findOne({_id:id});
    }catch(err){
        console.log(err);
    }

}

const updateCategory=async(id,category_name)=>{
      try{
          let category=await CategoryInfo.updateOne({_id:id},{$set:{name:category_name}});
           return category;
        }catch(err){
            console.log(err);
        }
}

const DeleteCategory=async(id)=>{
    try{

        let res= await  CategoryInfo.deleteOne({'_id':id});
        if(res){
              console.log("Painting Deleted Successfully!");
          }
      }catch(error){
        console.log(error);
      }
}
module.exports={
    createCategory,
    findAllCategory,
    findCategory,
    updateCategory,
    DeleteCategory
}
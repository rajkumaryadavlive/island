const categoryServices=require("../services/categoryServices");


const index=async(req,res)=>{
    try{
        let category=await categoryServices.findAllCategory();
        res.render('admin/category/index',{role:req.session.role,category:category,name:req.session.re_usr_name});
      }catch(e){
        console.log(e);
    }
}
const create=async(req,res)=>{
   res.render('admin/category/create',{role:req.session.role,name:req.session.re_usr_name});
}
const store=async(req,res)=>{
    let user_id=req.session.re_us_id;
    let name=req.body.name;
    let categoryObj={user_id:user_id,name:name};

    console.log(categoryObj);

    let category=await categoryServices.createCategory(categoryObj);

    console.log(category);
    res.redirect('/users/category');
 }
const edit=async(req,res)=>{
    let id=req.query.id.trim();
    let category=await categoryServices.findCategory(id);
   console.log(category);
    res.render('admin/category/edit',{role:req.session.role,name:req.session.re_usr_name,category:category});
}

const update=async(req,res)=>{
    let id=req.body.category_id;
    let name=req.body.category_name;
    let category=await categoryServices.updateCategory(id,name);
    res.redirect('/users/category');
}

const deleteCategory=async(req,res)=>{
    let id=req.query.id.trim();
     let category=await categoryServices.DeleteCategory(id);
     res.redirect('/users/category');
}
module.exports={index,create,store,edit,update,deleteCategory}
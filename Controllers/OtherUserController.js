import Post from "../Models/Postmodel.js"
import User from "../Models/UserLogin.js"
import { UserProfilePic } from "../Utiles/Utiles.js"

export const OtherUser_Details=async(req,res)=>{
    const{post_id}=req.params
    const{user_id}=req.query
    try{
let post_details= await Post.findOne({_id:post_id})
let userdetails=await User.findOne({user_id:post_details.user_id})
let userpic = await UserProfilePic(userdetails.user_id,userdetails.sex)
let user_data = {
    user_name: userdetails.name,
    user_pic: userpic,
    sex:userdetails.sex,
    user_id:user_id===userdetails.user_id?userdetails.user_id:""
}
res.status(200).send({data:user_data})
console.log(user_id);
    }catch(err){
        res.status(400).send({message:"Something wrong"})
    }

}
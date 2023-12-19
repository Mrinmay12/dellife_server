import mongoose from "mongoose";
const Schema = mongoose.Schema
const postSchema = new Schema({
    user_id:{type:String},
    post_title:{type:String},
    post_img:{type:String},
    color_code:{type:String},
    textstyle:{type:String},

}, {
    timestamps: true
})

const Post = mongoose.model("PostInformation", postSchema)
export default Post

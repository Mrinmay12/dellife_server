import mongoose from "mongoose";
const Schema = mongoose.Schema
const postSchema = new Schema({
    user_id:{type:String},
    profile_img:{type:String},

}, {
    timestamps: true
})

const ProfilePic = mongoose.model("ProfilePic", postSchema)
export default ProfilePic

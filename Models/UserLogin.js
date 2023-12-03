import mongoose from "mongoose";
const Schema = mongoose.Schema
const userSchema = new Schema({
    name: {
        type: String
    },
    age: { type: String },
    email: {
        type: String
    },
    password: { type: String },
    resetToken: { type: String },
    sex:{type:String},
    user_id:{type:String}

}, {
    timestamps: true
})

const User = mongoose.model("UsersInformation", userSchema)
export default User

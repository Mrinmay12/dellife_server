
import {
  Userdetails,
  UploadProfilePic,
  GetProfileImg,
} from '../Controllers/SettingController.js';
import Multer from "fastify-multer";
const multer = Multer()

async function routes(fastify, options) {
  fastify.get("/api/user/details/:user_id", Userdetails)
  fastify.put("/api/user/profilepic/upload", UploadProfilePic)
  fastify.get("/api/user/userpic/:user_id", GetProfileImg)
}


export default routes
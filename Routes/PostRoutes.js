import { CreatPost, GetAllPost ,GetPerticularPost, GetUserPost,PostUpdate} from "../Controllers/PostController.js";
import Multer from "fastify-multer";
const multer = Multer()
async function routes(fastify, options, done) {
    fastify.post("/api/userpost/newpost", { preHandler: multer.single('image') }, CreatPost)
    fastify.get("/api/userpost/getallpost",GetAllPost)
    fastify.get("/api/userpost/:post_id",GetPerticularPost) 
    fastify.get("/api/userpost/user/:user_id",GetUserPost)
    fastify.put("/api/userpost/user/:post_id/:user_id",PostUpdate)

}
export default routes
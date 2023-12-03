
import {
    Creatuser,
    Login,
    Resetpassword,
    Forgetpassword,
    UpdateUser,
    AdvenceSearch,
    // UserVerify,
    // verifyToken,
    verifyTokenAndUser,
    getAllUser,
    UserProfile,
  } from '../Controllers/UserController.js';

  async function routes (fastify, options) {
    fastify.post("/api/user/newuser",Creatuser)
    fastify.post("/api/user/login",Login)  
     fastify.post("/api/user/resetpassword",Resetpassword)
     fastify.post("/api/user/forgetpassword",Forgetpassword)
     fastify.put("/api/user/updateuser",UpdateUser)
     fastify.get("/api/user/searchuser",AdvenceSearch)
     fastify.get("/api/user/verifytoken", verifyTokenAndUser);
     fastify.get("/api/user/getuser",getAllUser)
     fastify.get("/api/user/userprofile/:user_id",UserProfile)
  }
// const router=fastify()

// router.post("/newuser",Creatuser)
// router.post("/login",Login)
// router.post("/resetpassword",Resetpassword)
// router.post("/forgetpassword",Forgetpassword)
// router.put("/updateuser",UpdateUser)
// router.get("/searchuser",AdvenceSearch)
// // router.get("/verifytoken",verifyToken,UserVerify)
// router.get("/getuser",getAllUser)
// router.get("/userprofile/:user_id",UserProfile)

export default routes

import {
    OtherUser_Details
  } from '../Controllers/OtherUserController.js';

  async function routes(fastify, options) {
    fastify.get("/api/another_user/details/:post_id", OtherUser_Details)
  }
  
  
  export default routes
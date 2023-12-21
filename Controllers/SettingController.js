import admin from "firebase-admin"
import ServiceAccount from "../Utiles/serviceAccount.json" assert {type: "json"}
import User from "../Models/UserLogin.js"
import ProfilePic from "../Models/Profilepicmodel.js"
import { UserProfilePic } from "../Utiles/Utiles.js";

// admin.initializeApp({
//     credential: admin.credential.cert(ServiceAccount),
//     storageBucket: 'gs://voter-29270.appspot.com',
// });


const storage = admin.storage();
const bucket = storage.bucket();

// export const User_Profile_PicUpload = async (request, res) => {
//     const file = request.file;
//     const { user_id } = request.params;

//     try {
//         let response = await User.findOne({ user_id: user_id });
//         let profile_present = await ProfilePic.findOne({ user_id: user_id });

//         if (response && (response.user_id === user_id || (profile_present && profile_present.profile_img !== ""))) {
//             const fileName = Date.now() + '-' + file.originalname;
//             const fileUpload = bucket.file(fileName);

//             // Check if the existing profile image file exists before deleting
//             if (profile_present && profile_present.profile_img) {
//                 try {
//                     await bucket.file(profile_present.profile_img).delete();
//                     console.log("Existing file deleted successfully");
//                 } catch (deleteError) {
//                     console.error("Error deleting existing file:", deleteError);
//                     res.status(500).send({ message: "Error deleting existing file", error: deleteError });
//                     return;
//                 }
//             }

//             const blobStream = fileUpload.createWriteStream({
//                 metadata: {
//                     contentType: file.mimetype,
//                 },
//             });

//             blobStream.end(file.buffer);

//             // blobStream.on('finish', async () => {
//                 try {
//                     // Update or create ProfilePic in the database
//                     if (!profile_present) {
//                         // If profile is not present, create a new one
//                         profile_present = new ProfilePic({
//                             profile_img: fileUpload.name,
//                             user_id: user_id,
//                         });
//                         await profile_present.save();
//                         res.status(200).send({ message: "Profile pic uploaded successfully" ,user_pic:`https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/${fileUpload.name}?alt=media`});
//                         console.log("Profile pic created successfully");
//                     } else {
//                         // If profile is present, update the existing one
//                         profile_present.profile_img = fileUpload.name;
//                     }

//                     await profile_present.save();
//                     console.log("Profile pic uploaded successfully");
//                     res.status(201).send({ message: "Profile pic Update successfully",user_pic:`https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/${fileUpload.name}?alt=media` });
//                 } catch (dbError) {
//                     console.error("Database error:", dbError);
//                     res.status(500).send({ message: "Database error", error: dbError });
//                 }
//             // });

//             blobStream.on('error', (uploadError) => {
//                 console.error("File upload error:", uploadError);
//                 res.status(500).send({ message: "File upload error", error: uploadError });
//             });
//         } else {
//             res.status(400).send({ message: "User not found or unauthorized access" });
//         }
//     } catch (err) {
//         console.error("Server error:", err);
//         res.status(500).send({ message: "Server error", error: err });
//     }
// };

///Upload profile pic
export const UploadProfilePic=async(req,res)=>{
    try {
        const {profile_img}=req.body
        const {user_id}=req.body
        let response = await User.findOne({ user_id: user_id });
 
      const imageId = await ProfilePic.findOne({ user_id });
      if(response && (response.user_id === user_id)){
        if(!imageId){
            const imagepost = new ProfilePic({
                user_id: user_id,
                profile_img:profile_img
            })
            await imagepost.save();
      
            res.status(200).send({ message: 'Image created successfully' });
          }else{
            imageId.user_id=user_id,
            imageId.profile_img=profile_img
            await imageId.save();
      
            res.status(201).send({message:'Image updated successfully'});
          }
      }
     
  
    }catch(err){
    console.log(err);
  }
  }

  //get profile pic
  export async function GetProfileImg(req, res) {
    try {
     
      const {user_id} = req.params;
    
      const user = await ProfilePic.findOne({ user_id: { $in: user_id } });
let gander=user && user.sex
      if (!user) {
        let profile_img =gander==="1"? 'https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/boypic.jpg?alt=media&token=6d9dc8a7-8c16-48d6-8df2-8e37c6cef89b':'https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/girlpic.jpg?alt=media&token=9227e456-c6ea-414f-87a0-991bce8b81a2'
        return res.status(200).send({message: "Image not found", status: false,user_img:profile_img})
      }
      else {
        console.log(user.profile_img,"user.data");
        res.status(200).send({ message: "Image not found", status: false, user_img: user.profile_img })
        // res.send(image.data);
      }
  
  
    } catch (error) {
      console.error('Error retrieving image:', error);
      res.status(500).send('An error occurred');
    }
  }
  

export const Userdetails = async (req, res) => {
    try {
        const { user_id } = req.params
        let response = await User.findOne({ user_id: user_id })
        let userpic = await UserProfilePic(user_id,response.sex)
        let user_data = {
            user_name: response.name,
            user_pic: userpic,
            sex:response.sex,
            user_id:response.user_id
        }
        res.status(200).send({ data: user_data })
    } catch (err) {
        res.status(400).send({ messsage: "User not found" })
    }


}
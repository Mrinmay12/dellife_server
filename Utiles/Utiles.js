import ProfilePic from "../Models/Profilepicmodel.js"; 
export function generateId(){
    return Date.now().toString(36)+Math.random().toString(36).substring(2,5)
}

export const UserProfilePic = async (userIds,sex) => {
   
    let user_gander=sex===undefined?"1":sex
    try {
        const user = await ProfilePic.findOne({ user_id: { $in: userIds } });
        if (!user) {
            let profile_img =user_gander==="1"? 'https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/boypic.jpg?alt=media&token=6d9dc8a7-8c16-48d6-8df2-8e37c6cef89b':'https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/girlpic.jpg?alt=media&token=9227e456-c6ea-414f-87a0-991bce8b81a2'
            return profile_img
          }else{
           return  user.profile_img 
          }

    } catch (error) {
        console.error(`Error fetching user data: ${error}`);
        return {};
    }
};


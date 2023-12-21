import Post from "../Models/Postmodel.js";
import User from '../Models/UserLogin.js';
import admin from "firebase-admin"
import ServiceAccount from "../Utiles/serviceAccount.json" assert {type: "json"}
import { UserProfilePic } from "../Utiles/Utiles.js";

admin.initializeApp({
    credential: admin.credential.cert(ServiceAccount),
    storageBucket: 'gs://voter-29270.appspot.com',
});

const storage = admin.storage();
const bucket = storage.bucket();

export const CreatPost = async (request, res, next) => {
    const file = request.file;
    // const name = request.body.name
    const user_id = request.body.user_id
    const post_title = request.body.post_title
    const color_code = request.body.color_code
    const textstyle = request.body.textstyle

    const fileName = Date.now() + '-' + file.originalname;
    // console.log(name, fileName);
    if (file.originalname !== undefined) {
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });
        try {
            if (blobStream) {
                const data = new Post({
                    post_img: fileUpload.name,
                    user_id: user_id,
                    post_title,
                    color_code,
                    textstyle
                })
                await data.save()
                res.status(200).send({ message: "Post create successfully" })
                blobStream.end(file.buffer);
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media`;
                res.code(200).send({ mess: "ok", url: publicUrl, name: fileUpload.name })
            }
        } catch (err) {
            res.status(500).send({ error: 'Something went wrong!' });
        }
    } else {
        try {
            const data = new Post({
                user_id: user_id,
                post_img: "",
                post_title,
                color_code,
                textstyle

            })
            await data.save()
            res.status(200).send({ message: "Only Post create successfully" })
        } catch (err) {
            res.status(500).send({ error: 'Something went wrong!' });
        }
    }


}

const Userdetail = async (userIds) => {
    try {
        const users = await User.find({ user_id: { $in: userIds } });
        const userMap = {};
        users.forEach((user) => {
            userMap[user.user_id] = { name: user.name, email: user.sex };
        });
        return userMap;
    } catch (error) {
        console.error(`Error fetching user data: ${error}`);
        return {};
    }
};

export const GetAllPost = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / pageSize);
        const skip = (Number(page) - 1) * pageSize;
        console.log(skip);
        // Fetch posts sorted by updatedAt in descending order with selected fields
        const posts = await Post.find({}, 'post_title textstyle username color_code createdAt user_id post_img')
            // .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean();

        // Get unique user IDs from posts
        const userIds = [...new Set(posts.map((post) => post.user_id))];
        const userMap = await Userdetail(userIds);

        const sortedPosts = posts.sort((a, b) => {
            const colorOrder = { red: 1, blue: 2, black: 3 };
            return colorOrder[a.color_code] - colorOrder[b.color_code];
        });


        const userdata = await Promise.all(sortedPosts.map(async (post) => {
            const userProfilePic = await UserProfilePic(post.user_id,userMap[post.user_id] ? userMap[post.user_id].sex : "1");
            return {
                Title: post.post_title,
                Textstyle: post.textstyle,
                Username: post.username,
                Postimage: post.post_img,
                Color: post.color_code,
                createdAt: post.createdAt,
                // user_id: post.user_id,
                post_id: post._id,
                user_name: userMap[post.user_id] ? userMap[post.user_id].name : 'Unknown User',
                user_pic: userProfilePic
            }
        }))
        // userdata.sort((a, b) => colorOrder[a.Color] - colorOrder[b.Color]);

        res.status(200).send({ data: userdata, totalPages: totalPages });
    } catch (error) {
        res.status(400).send({ message: `Error fetching data: ${error}` });
    }
};

export const GetPerticularPost = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { action, user_id } = req.query;
        let post = await Post.findOne({ _id: post_id })
        if (action === "delete" && user_id === post.user_id) {
            try {
                await Post.findByIdAndDelete({ _id: post_id })
                res.status(300).send({ message: "Post Delete" })
            } catch (err) {
                res.status(301).send({ message: "Only admin delete post" })
            }

        } else {

            const userMap = await Userdetail(post.user_id);
            let user_pic = await UserProfilePic(post.user_id, userMap[post.user_id] ? userMap[post.user_id].sex : "1")
            let post_data = {
                Title: post.post_title,
                Textstyle: post.textstyle,
                Username: post.username,
                Postimage: post.post_img,
                Color: post.color_code,
                createdAt: post.createdAt,
                // user_id: post.user_id,
                post_id: post._id,
                user_name: userMap[post.user_id] ? userMap[post.user_id].name : 'Unknown User',
                user_pic: user_pic
            }
            res.status(200).send({ post: post_data })
        }

    } catch (err) {
        res.status(400).send({ message: "Post not found" })
    }

}

export const PostUpdate = async (req, res) => {
    try {
        const { post_id, user_id } = req.params;
        const { post_title, color_code, textstyle } = req.body
        const post_update = await Post.findOne({ _id: post_id })
        if (user_id === post_update.user_id) {

            post_update.post_title = post_title,
                post_update.color_code = color_code,
                post_update.textstyle = textstyle

            post_update.save()
            res.status(200).send({ message: "Post Update" })
        } else {
            res.status(400).send({ message: "Only admin Post Update" })
        }
    } catch (err) {
        res.status(400).send({ message: "Post not Updated" })
    }

}

export const GetUserPost = async (req, res) => {
    const { user_id } = req.params
    try {
        let user_post = await Post.find({ user_id: user_id })
        res.status(200).send({ user_post })
    } catch (err) {
        res.status(400).send({ message: "No post Found" })
    }
}

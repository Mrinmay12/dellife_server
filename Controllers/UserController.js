import User from '../Models/UserLogin.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import { generateId } from '../Utiles/Utiles.js';
// const secretKey = crypto.randomBytes(32).toString('hex');
const secretKey = "VoterApp9787"
export const Creatuser = async (req, res, next) => {
    const { email, password, age, name, sex } = req.body;
    let username = name.split(' ')[0]
    let user_id = username + generateId() + new Date().getSeconds()
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).send({ error: 'User already exists' });
        }
        // Generate a short-lived token 


        const token = jwt.sign({ userId: user_id }, secretKey, { expiresIn: '87600h' });
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            age,
            email,
            password: hashedPassword,
            sex: sex,
            user_id: user_id,

        });

        await newUser.save(); 

        res.status(201).send({ message: 'User created successfully', user_id: user_id, token: token });

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            // Configure your email service provider here
            // For example, for Gmail:
            service: 'Gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.Password,
            }
        });

        // Define the email options
        const mailOptions = {
            from: 'your-email@gmail.com', 
            to: email,
            subject: 'Welcome to First Connect',
            // text: `Your OTP is ${otp}`
            html: `
            <div style="display: grid;grid-template-columns:100px 100px 100px">
            <img src="https://myvoter.cu.ma//static/media/logo.6306b0c8133695da8295.png" alt="Embedded Image" style="height: 60px; width: 60px;border-radius: 50px;object-fit: cover;">
            <div style="margin-left:-25px;padding-top:16px;font-size:18px;font-family:'georgia';font-weight:bold;text-align:center">VoterApp</div>
            </div>        
            <div style=" background-color: #58dfad; width: 100%;height:100px; border-radius: 10px;text-align: center;">
      <h2 style="color: white;padding-top: 25px;"> HI ${username} welcome to VoterApp</h2>
      </div>
          `
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ error: 'Failed to send email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).send({ message: 'Email sent' });
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send({ error: 'Invalid password' });
        }
        // Generate a short-lived token 

        const token = jwt.sign({ userId: user.user_id }, secretKey, { expiresIn: '87600h' });
        // Password is correct, user is authenticated
        res.status(200).send({ message: 'Login successful', token, user_id: user.user_id });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

export const Forgetpassword = async (req, res) => {
    const { email } = req.body;

    // Generate a random OTP
    function generateOTP() {
        const otpLength = 6;
        const digits = '0123456789';
        let otp = '';

        for (let i = 0; i < otpLength; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }

        return otp;
    }
    const otp = generateOTP();

    // Find the user by email and update the reset token
    try {
        const user = await User.findOneAndUpdate({ email }, { resetToken: otp });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            // Configure your email service provider here
            // For example, for Gmail:
            service: 'Gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.Password,
            }
        });

        // Define the email options
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Your OTP is ${otp}`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ error: 'Failed to send email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).send({ message: 'Email sent' });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal server error' });
    }

}

export const Resetpassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Find the user by email and reset the password
    try {
        const user = await User.findOne({ email, resetToken: otp });

        if (!user) {
            return res.status(404).send({ error: 'Invalid OTP or email' });
        }

        // Update the password and clear the reset token
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        await user.save();

        res.status(200).send({ message: 'Password reset successful' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

export const UpdateUser = async (req, res) => {
    const { user_id } = req.body
    const { name, age } = req.body;
    const finduser = await User.findOne({ user_id: user_id });
    try {
        finduser.name = name;
        finduser.age = age;
        await finduser.save();
        res.status(200).send('User updated successfully');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }

}

export const getAllUser = async (req, res) => {
    try {
        // const users = await User.find({}, 'name user_id').lean();
        const users = await User.find({}, { _id: 0, name: 1, user_id: 1 }).sort({ createdAt: -1 }).lean();

        if (!users) {
            return res.status(404).send({ error: 'No users found' });
        }

        res.status(200).send({ data: users });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching user data' });
    }
}

export const AdvenceSearch = (req, res) => {
    const { search } = req.query;
    if (search === "") {
        res.send([])
    } else {
        const regex = new RegExp(search, "i");
        User.find({ $or: [{ name: regex }, { user_id: regex }] }).then((response) => {
            res.send(response.slice(0, 10))
        }).catch(err => {
            console.log(err);
        })
    }


}

// export const UserVerify = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         let data=await User.findOne({user_id:userId})
//         console.log(data,"data");
//         if (data) {
//             res.send({ user_id: userId });
//         } else {
//             return res.status(403).send({ message: 'Invalid token', logout: true });
//         }
//     } catch (error) {
//         res.status(500).send({ error: 'An error occurred' });
//     }
// };

// export function verifyToken(req, res, next) {
//     const token = req.headers.authorization;
//     if (!token) {
//         return res.status(401).send({ message: 'Token not provided' });
//     }

//     jwt.verify(token, secretKey, (err, decoded) => {
//         if (err) {
//             return res.status(403).send({ message: 'Invalid token', logout: true });
//         }

//         req.user = decoded;
//         next();
//     });
// }
export const verifyTokenAndUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).send({ message: 'Token not provided' });
        }

        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                return res.status(403).send({ message: 'Invalid token', logout: true });
            }

            const userId = decoded.userId;

            try {
                const user = await User.findOne({ user_id: userId });

                if (user) {
                    req.user = user;
                    next();
                } else {
                    return res.status(403).send({ message: 'Invalid token', logout: true });
                }
            } catch (error) {
                console.error('Error finding user:', error);
                res.status(500).send({ error: 'An error occurred while finding user' });
            }
        });
    } catch (error) {
        console.error('Error verifying token and user:', error);
        res.status(500).send({ error: 'An error occurred during token and user verification' });
    }
};
export const UserProfile = async (req, res) => {
    let { user_id } = req.params
    try {
        let user_details = await User.findOne({ user_id },{ _id: 0, name: 1, user_id: 1 })
        res.status(200).send({user_details})

    } catch (err) {
        console.log(err);
    }

}
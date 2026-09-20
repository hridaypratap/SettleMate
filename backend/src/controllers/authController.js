const { email } = require("zod");
const User = require("../models/User")
const { signupSchema, loginSchema} = require("../validators/authValidator")
const bcrypt = require("bcrypt")
const { generateAccessToken , generateRefreshToken } = require("../services/authService")
const jwt = require("jsonwebtoken")

const signup = async (req, res) => {
    try {
        

        const result = signupSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                 message:"Invalid Signup Data",
                 errors: result.error.issues
            });
        }
        const data = result.data;
        
        // duplicate Email check
       const existingUser = await User.findOne({email: data.email});
        
       if(existingUser){
            return res.status(409).json({
            message:"Email Already Registered"
            })
        }


        const hpass = await bcrypt.hash(data.password,12);
        data.password = hpass;
        
        const newUser = new User(data)

        await newUser.save();
        console.log("Data Saved")
        return res.status(201).json({
            message:"User Registered successfully"
        })
        


        
    } catch (error) {
        console.log(error)
    }

}


const login = async (req,res) =>{
    try {
        const result = loginSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({
                message: "Invalid Login Data",
                errors: result.error.issues
            });
        }
        const data = result.data;
        
        const existingUser = await User.findOne({email: data.email});

        if(!existingUser){
            return res.status(401).json({
            message:"Please Signup Or Create account first"
            })
        }
        // checking pass using plain pass to bcrypt and stored hashed pass
        const isPasswordCorrect = await bcrypt.compare(data.password , existingUser.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid email or password",

            })
        }
        // Generating JWT Tokens 
        const accessToken = generateAccessToken(existingUser._id);  //Access token → returned to the client so it can be used in Authorization: Bearer ...
        const refreshToken = generateRefreshToken(existingUser._id); //Refresh token → stored in an httpOnly cookie, not exposed to frontend JavaScript.

        // sending cookie

        res.cookie("refreshToken",refreshToken,{
            httpOnly: true,                                    // httpOnly: true → browser JavaScript cannot access the refresh token
            secure: process.env.NODE_ENV === "production",     // secure: true in production → only sent over HTTPS
            sameSite: "strict",                                 // sameSite: "strict" → helps protect against CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000                    // maxAge → cookie lasts 7 days
        });

        //Now return the access token to the client.

        return res.status(200).json({ message: "Login successful", accessToken });




        
    } catch (error) {
        console.error("Login Error" , error);
        res.status(500).json({
            message: "Internal Server Error"
        });
        
    }
}


const refresh = async (req , res) =>{
    try {
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken){
            return res.status(401).json({
                messege: "Refresh token not found"
            })

            

        }

        const decoded = jwt.verify(refreshToken , process.env.JWT_REFRESH_SECRET)
        const accessToken = generateAccessToken(decoded.userId)

        return res.status(200).json({
            accessToken
        })

        
    } catch (error) {
        console.error("Refresh Error :" , error)

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        })
        
    }
}

const me = async (req , res) =>{
    try {
        
        const user = await User.findById(req.userId)

        if(!user){
            return res.status(404).json({
                message: "User data not Found"
            })
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })


                
    } catch (error) {
        console.error("Profile Data Fetching Error :" , error)

        return res.status(500).json({
            message: "Internal Server Error"
        })
        
    }
}








module.exports = { signup,login,refresh,me }
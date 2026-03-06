const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blacklist.model")


// control post register request
// Post api = /api/auth/register
async function userRegisterController(req, res) {
    const { email, password, name } = req.body // data from client

    const isExists = await userModel.findOne({  // this will check whether the email already exits in database or not to register new account
        email: email
    })

    if (isExists) { // if yes then do this
        return res.status(422).json({
            message: "User email already exits",
            status: "Failed"
        })
    }

    // if no create account and give jwt value to create  account
    const user = await userModel.create({
        email, password, name
    })


    //  Create a login token that stores the user's id, here payload is user id and id is coming from database
    //keeps it secure using a secret key, consider it like a stamp to make the user valid
    // this token will expire in 3 days

    const token = jwt.sign({ userId: user._id, }, process.env.JWT_SECRET, { expiresIn: "3d" })

    // Store the JWT token in a cookie so the browser sends it automatically
    // with every request and the user stays logged in.

    res.cookie("token", token)
    res.status(201).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        }, token
    })

    await emailService.sendRegistrationEmail(user.email,user.name)
}



/**
 * - Control Post login request
 * - Post API = /api/auth/login 
 */
async function userLoginController(req, res) {

    const {email, password } = req.body 

    const user = await userModel.findOne({
        email: email
    }).select("+password") // adding +password to make select field in password to true.

    if (!user) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
        return res.status(401).json({
            message: " Password is INVALID"
        })
    }

    const token = jwt.sign({ userId: user._id, }, process.env.JWT_SECRET, { expiresIn: "3d" })

    res.cookie("token", token) // Server sends Set-Cookie header
    res.status(200).json({ //Browser stores token automatically
        user: { //Next requests me browser sends token automatically
            id: user._id,
            email: user.email,
            name: user.name
        }, token
    })

}

/**
 * User Logout Controller
 * /api/auth/logout
 */

async function userLogoutController(req,res){

    // first find the token
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    //if not found that means user is already is logged out
    if(!token){
        return res.status(200).json({
            message:"User Logged out Successfully."
        })
    }

    res.clearCookie("token") // clearing cookie

    // save token in db
    await tokenBlackListModel.create({
        token:token
    })

    // return response
    return res.status(200).json({
        message:"User logged out successfully."
    })
}
module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}

// flow of the program (Register)
// account created
// jwt generated
// cookie set
//user become auto logged in like in instagram , amazon etc

// flow of the program(login)
// email ,password verfied
// new jwt token generated
// replace the new jwt token with old jwt token 

// 

//res.status(422) Request understood but data is invalid (like wrong email format or missing fields)
// res.status(201)   Request successful and a new resource (like a new user) was created


const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blacklist.model")




// in this middleware we are going to verify the user, using cookiee which will come automatically from the browser with user's every request
async function authMiddleware(req,res,next){
    //verifying token which is with either request cookie request header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({token})

    if(isBlacklisted){
        return res.status(401).json({
            message:"Unauthorizes access,token is INVALID"
        })
    }

    try{
        // Verify the token using JWT secret and get the decoded data (which contains userId) which will tell which user is making the request
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        
        // Find the logged-in user from database using the userId from token
        const user = await userModel.findById(decoded.userId) 

        // Attach the user object to the request so next routes can access the logged-in user
        req.user = user
         
        // Move to the next middleware or controller
        return next()
    }
    
    catch(err){
        return res.status(401).json({
            message:"Unauthorized access, token in invalid"
        })
    }

}


async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({token})

    if(isBlacklisted){
        return res.status(401).json({
            message:"Unauthorizes access,token is INVALID"
        })
    }

    try{
         const decoded = jwt.verify(token,process.env.JWT_SECRET) 
         const user = await userModel.findById(decoded.userId).select("+systemUser") // here we will also check if the user is the system user or not

         if(!user.systemUser){
            return res.status(403).json({
                message:"Forbidden access,not a systemUser"
            })
         }

        req.user = user

        return next()
         
     
    }
    catch(err){
        return res.status(401).json({
            message:"unauthorised acces, token is INVALID"
        })

    }

    
}
module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}

// Note👉 Server sets cookie → browser stores it → browser sends it with every request → backend reads it from req.cookies.
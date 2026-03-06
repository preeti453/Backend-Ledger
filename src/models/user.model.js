const mongoose = require("mongoose")
const bcrypt = require("bcryptjs") //  this package  will use to hash the password

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required:[true,"Email is required for creating a user profile"], // means email is necessary to create a profile and if user start without email then will get this error
        trim:true, // does not want any gap between the letters
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"],// if pattern doesn't match send this msg
       unique:[true, "Email already exits"]
    },

    name:{
        type:String,
        required:[true,"Name is required for creating an account"],
    },

    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minlength:[6,"Minimum 6 characters required"],
        select :false // password will not show when we fetch user data unless we ask for it manually
    },


    //systemUser = this user is the app itself, not a real person,systemUser wil provide the initial funding for tansaction in any user Account
    // used when system does work automatically(no human involved)
    // immutable  = cannot be changed later
    // select false = hidden from normal queries
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false

    }


},{
    timestamps:true // automatically adds createdAt and updatedAt fields
})


userSchema.pre("save",async function (next) { 
    //this runs before saving the user and converts the password into a one way hashed password
    // so even if data gets leaked , the real password cannot be seen

    if(!this.isModified("password")){  // if password is not modifies , skip hashing so that it prevents rehashing to the already hashed password
            return 
    }

    // convert plain password to the secure hash
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash // replace original password to the hashed one

    return  // continue saving the user


})

//// This method is used during login to check if the entered password is correct
// this function will compare the password given by the user and the already existing hashed password in the database
// if the hash of both password matches it return true otherwise false
userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema) //👉 “Create a model called user using userSchema, so I can perform database operations.”

module.exports = userModel

/**
 * 👉 We check cookies before showing account because the cookie contains the JWT token, and the token tells us which user is making the request. Without it, the server cannot identify the user securely.
 */
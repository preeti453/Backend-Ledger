const mongoose = require("mongoose")

// this model is is created to blacklist the token of the logout user
// if we dont blacklist token then it is possible to make false payment with the same token by the hackers or anyone so 
// blacklisting token is required is protect the false payment
const tokenBlackListSchema = new mongoose.Schema({
    token:{
        type :String,
        required:[true,"Token is required to blacklist. "],
        unique:[true,"Token is already blacklisted."]
    },

},{
    timestamps:true
})

// this is TTL (time to live) index
// Token will be automatically deleted from the database 3 days after the createdAt time.
tokenBlackListSchema.index({createdAt:1},{
    expireAfterSeconds: 60*60*24*3 // 3days
})

const tokenBlackListModel = mongoose.model("tokenBlackList",tokenBlackListSchema)

module.exports = tokenBlackListModel

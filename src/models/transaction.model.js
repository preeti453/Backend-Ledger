const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"account",
         required:[true,"Transaction must be required with a from account"],
         index :true //index is very helpful here if we want to check all the transaction from this account
    },
    toAccount:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"account",
         required:[true,"Transaction must be required with a to account"],
         index :true 
    },

    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            Message:"Status can be either Pending,Completed,Failed or Reversed"
        },
        default:"PENDING" // by default  status will be pending and shows completed only after transaction is completed
    },

    amount:{
        type:Number,
        required:[true,"Amount is required for transaction"],
        min:[0,"Transaction amount cannot be negative"]
    },

    // 👉 Idempotency in transactions ensures that multiple identical payment requests result in only one financial operation, preventing duplicate debits.
    idempotencyKey:{// this is used to record track on transaction
        type:String,
        required:[true,"Idempotency key is required to make transaction"],
        unique:true,
        index:true
    }
},{
     timestamps:true
})

//Idempotency key
// retry request means using same idempotency key which is first goes with the user's request.
// This key will come from frontend and then save in db
// key already used → return old transaction
// new key → process payment and store key

const transactionModel = mongoose.model("Transaction",transactionSchema)

module.exports = transactionModel
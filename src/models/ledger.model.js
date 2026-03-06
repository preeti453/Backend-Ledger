const mongoose = require("mongoose")


// Ledger is an immutable record(history) of all money movements. It is like a passbook in bank
// ledger stored record like who sent money, who received money , how much, when, type(credit/debit)
const ledgerSchema = new mongoose.Schema({
    account:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"account",
         required:[true,"Ledger must be associated with an account"],
         index:true,
         immutable:true // to make the all the field of ledger record unchangeable
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        immutable:true
    },

    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with a transaction"],
        immutable:true,
        index:true
    },

    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either CREDIT or DEBIT"
        }
    }
})

// If developer or anyone try to modify or delete ledger record this error will occur 
function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}
 // in all these cases same ledger error will occur
ledgerSchema.pre("findOneAndUpdate",preventLedgerModification)
ledgerSchema.pre("updateOne",preventLedgerModification)
ledgerSchema.pre("deleteOne",preventLedgerModification)
ledgerSchema.pre("remove",preventLedgerModification)
ledgerSchema.pre("deleteMany",preventLedgerModification)
ledgerSchema.pre("findOneAndDelete",preventLedgerModification)
ledgerSchema.pre("deleteMany",preventLedgerModification)
ledgerSchema.pre("findOneAndReplace",preventLedgerModification)

const ledgerModel = mongoose.model("ledger",ledgerSchema)

module.exports = ledgerModel
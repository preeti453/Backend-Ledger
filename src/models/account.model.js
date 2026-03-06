const mongoose = require("mongoose")
const ledgerModel = require("./ledger.model")

//This schema creates an account linked to a user and restricts its status to ACTIVE, FROZEN, or CLOSED.
const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // stores the id of the user who owns this account {coming from userModel} 
        ref: "user", // links this field to the userModel (creates relationship)
        required: [true, "Account must be associated to a user"],
        index: true // adding index for fast searching 

    },
    status: { // tells the status of the account
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"], // only these values are allowed no random text allowed
            message: "Status can be either Active ,Frozen or Closed",


        },
        default: "ACTIVE"

    },

    currency: {
        type: String,
        required: [true, "Currency is required for creating a account"],
        default: "INR" // bydefault currency will be Indian Rupee
    }
}, {
    timestamps: true
})

// We do NOT store the balance directly in the Account document
// because balance should be calculated from all transactions (credit + debit).
// This prevents wrong balance if someone edits the balance manually
// and keeps the data consistent and secure.
// instead we store balance in a separate transaction collection and sum it when we need balance.

accountSchema.index({ user: 1, status: 1 })  // creating compound index in two fields of the schema for fast searching of an account


// this method will help to get the balance of the fromuser 
accountSchema.methods.getBalance = async function () {

    const balanceData = await ledgerModel.aggregate([  // aggregate is a mongoDb pipeline system which processes data step by step like filter + calculation
    
        // $,match = fiter account
        { $match: { account: this._id } },// this will provide all the ledger record of the fromUserAccount
        {
            $group: { //group data and calcualte 
                _id: null,
                totalDebit: {
                    $sum: { // add values
                        $cond: [ // use to add conditions like if else
                            { $eq: ["$type", "DEBIT"] }, // eq means = equal and here total debit amount is add 
                            "$amount",
                            0 // this is else part
                        ]
                    }
                },

                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] }, // here total credit amount is add
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },

        { 
            $project: { // shape final output
                _id: 0, 
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }  // then subtract total debit from total credit 
            }
        }
    ])

    if (balanceData.length == 0){
        return 0 // if balance is zero that means no ledger record is found -> new account , no transactions 
    }

    return balanceData[0].balance // cause aggregate returns a array so here means{[balance:111]}

}


const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel
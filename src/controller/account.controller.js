const accountModel = require("../models/account.model")


// this controller will create account using userId and send account in response
async function createAccountController(req, res) {

    const user = req.user // user_id is stored in user here

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })
}


// this controller will list all the accounts of the particular user
async function getUserAccountController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id })

    res.status(200).json({
        accounts
    })
}


// this controller will get the balance of the user

async function getUserBalanceController(req, res) {

    const { accountId } = req.params // fetch account Id from req parameters

    const account = await accountModel.findOne({
        _id: accountId, // here we will check if the account which is requesting query is exist in our database or not
        user: req.user._id // and check if the user is using his someoneelse's account or his own
    })

    console.log("accountId from params:", accountId)
    console.log("logged in userId:", req.user._id)

    if (!account) {
        return res.status(404).json({
            message: "Account not found."
        })
    }

    const balance = await account.getBalance()

    return res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}




module.exports = {
    createAccountController,
    getUserAccountController,
    getUserBalanceController
}
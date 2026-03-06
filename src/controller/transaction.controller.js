const transactionModel = require("../models/transaction.model")
const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const mongoose = require("mongoose")
const email = require("../services/email.service")



async function createTransaction(req, res) {

    /**
     * VALIDATE USER REQUEST
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body // all these four will come from user side


    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount , toAccount,amount, idempotencyKey are required field"
        })
    } // if any of these fields are missing then transaction cannot happen


    // now here we will check if the given fromAccount and toAccount are valid accounts or not means if they exist in our database or not
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


    /**
     * VALIDATE IDEMPOTENCYKEY
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({ // 👉 It returns a transaction document (object) from MongoDB
        idempotencyKey: idempotencyKey
    })


    // If idempotency key already exists in DB, it means this transaction
    // was already created earlier (maybe success, pending, failed, etc.)

    if (isTransactionAlreadyExists) {

        // If transaction is already completed successfully
        // do NOT process again to avoid double money deduction
        // just return the old transaction
        if (isTransactionAlreadyExists.status == "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        // If transaction is still in progress
        // tell user to wait instead of retrying again and again
        if (isTransactionAlreadyExists.status == "PENDING") {
            return res.status(200).json({
                message: "Transaction is still being processed",
            })
        }

        // If transaction failed earlier
        // user can retry with SAME idempotency key or create a new one
        if (isTransactionAlreadyExists.status == "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry",
            })
        }

        // If money was deducted but later reversed (rollback/refund case)
        // allow user to retry the transaction
        if (isTransactionAlreadyExists.status == "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry",
            })
        }

    }

    /**
     * check account status  if idempotency is not found on db means this is new request and start process transaction, for this one needs to check the status of the account
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status!== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }


    /**
     * Derive sender balance from ledger 
     */

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance.Current balance is ${balance}.Requested balance is ${amount}`
        })
    }

    // if balance is greater than the requested amount then create transaction

    /**
     * create Transaction (PENDING)
     */

    // mongo db provides these two functions to maintain the Acid property of the transaction 
    
    let transaction;

    try{
   
    const session = await mongoose.startSession()
    session.startTransaction() // now from here all the operation either happen at once or no operation happen

    // creating transaction entry directly on db
    const transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }],{session}))[0]


    // here ledger entries for credit and debit will create.
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"

    }], { session })

     await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })() // timeout is created to delay the credit amount entry with some time.

    const CreditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"

    }], { session })

    // after transaction status will be changed to COMPLETE

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


    await session.commitTransaction()
    session.endSession() // after commiting the session then session will get end

    /**
     * email send
     *
     */

    await email.sendTransactionSuccessEmail(req.user.email, req.user.name, amount, toAccount)
    res.status(201).json({
        message: "Transaction completed successfully.",
        transaction: transaction
    })}
    catch(err){
       return res.status(400).json({
        message:"Transaction is PENDING due to some issue , please retry again after sometime."
       })
    }

}

// tranaction is made by the system in this function so we need toAccout here
async function createInitialFundTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    // checking if all these fields are present or not
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(401).json({
            message: "toaccount , amount , idempotencyKey are required fields "
        })
    }

    // if present then check the toAccount is exist in our db or not 
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    //if not return error
    if (!toUserAccount) {
        return res.status(400).json({
            message: "toAccount is invalid"
        })
    }

    // create transaction 

    // first find from user account from account db having systemUser condition true .
    const fromUserAccount = await accountModel.findOne({

        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account is not found."
        })
    }

    // now here transaction start
    const session = await mongoose.startSession()
    session.startTransaction()

    // this transaction is intitally created in the server not direclty into the db
    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })


    // here ledger entries for credit and debit will create.
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"

    }], { session })


    const CreditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"

    }], { session })

    // after transaction status will be changed to COMPLETE

    transaction.status = "COMPLETED"
    await transaction.save({ session }) // here we will save this transaction session

    await session.commitTransaction()
    session.endSession() // after commiting the session then session will get end

    res.status(201).json({
        message: "Transaction completed successfully.",
        transaction: transaction
    })


}
module.exports = {
    createTransaction,
    createInitialFundTransaction

}

// res.status(400) = used when the data coming from client side is wrong
// this file mainly has two works 1. creating server instance and 2. config server means ( to check about the middlewares and API's)

const express = require("express")


const cookieParser = require('cookie-parser')

const app = express() // creating app instance

app.use(express.json()) // now this middleware can read the request body 
app.use(cookieParser())


/**
 *  Routes
 */
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRouter = require("./routes/transaction.routes")

app.get("/",(req,res)=>{
    res.send("Ledger services is up and running.")
})

/**
 * User Routes
 */
app.use("/api/auth",authRouter) // whenever a request starts with api/auth send it to authRouter to handle.
app.use("/api/accounts",accountRouter)
app.use("/api/transactions",transactionRouter)


module.exports = app // exporting app file
const express = require("express")
const urlRoute = require("./routes/url.route.js")
const staticRouter = require("./routes/staticRouter.route.js")
const userRoute = require('./routes/user.route.js')
const path = require("path")

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// view engine setup
app.set("view engine","ejs")
app.set("views", path.join(__dirname, "views"))

// routes
app.use("/url",urlRoute)
app.use("/", staticRouter)
app.use("/user", userRoute)

// 404 HANDLER
app.use((req, res) => {
    res.status(404).send("Page not found")
})


// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("ERROR:", err)
    res.status(500).send("Internal Server Error")
})


module.exports = app
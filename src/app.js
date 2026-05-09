const express = require("express")
const urlRoute = require("./routes/url.route.js")
const staticRouter = require("./routes/staticRouter.route.js")
const userRoute = require('./routes/user.route.js')
const { errorHandler, notFound } = require("./middleware/error.middleware.js")
const cookieParser = require("cookie-parser")
const { restrictToLoggedInUserOnly, checkAuth }  = require("./middleware/auth.middleware.js")
const path = require("path")
const helmet = require("helmet")

const app = express()

// security headers
app.use(helmet())

// parsing
app.use(express.urlencoded({extended: false}))
// cookies
app.use(cookieParser())
// static files
app.use(express.static(path.join(__dirname, "../public")))

// view engine setup
app.set("view engine","ejs")
app.set("views", path.join(__dirname, "views"))

// routes
app.use("/url",restrictToLoggedInUserOnly, urlRoute)
app.use("/user", userRoute)
app.use("/",checkAuth, staticRouter)

app.use(notFound)

app.use(errorHandler)

module.exports = app
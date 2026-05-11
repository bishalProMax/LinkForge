const express = require("express")
const urlRoute = require("./routes/url.route.js")
const staticRouter = require("./routes/staticRouter.route.js")
const userRoute = require('./routes/user.route.js')
const { errorHandler, notFound } = require("./middleware/error.middleware.js")
const cookieParser = require("cookie-parser")
const { authenticateUser}  = require("./middleware/auth.middleware.js")
const path = require("path")
const helmet = require("helmet")

const app = express()

// security headers
app.use(helmet({
contentSecurityPolicy: {
  directives: {
        defaultSrc: [
          "'self'"
        ],

        scriptSrc: [

          "'self'",

          "https://challenges.cloudflare.com",

          "https://cdn.jsdelivr.net",
        ],

        styleSrc: [

          "'self'",

          "'unsafe-inline'",

          "https://cdn.jsdelivr.net",
        ],

        fontSrc: [

          "'self'",

          "https://cdn.jsdelivr.net",
        ],

        frameSrc: [

          "'self'",

          "https://challenges.cloudflare.com",
        ],

        imgSrc: [

          "'self'",
          "data:",
        ],
      },
    },
  })
);

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
app.use("/url",authenticateUser, urlRoute)
app.use("/user", userRoute)
app.use("/", staticRouter)

app.use(notFound)

app.use(errorHandler)

module.exports = app
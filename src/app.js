import express from "express";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import authenticateUser from "./middleware/auth.middleware.js";
import path from "path";
import helmet from "helmet";
import urlRoute from "./routes/url.route.js";
import staticRouter from "./routes/staticRouter.route.js";
import userRoute from "./routes/user.route.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default app;
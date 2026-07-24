import express from "express";
import { errorHandler, notFound } from "./shared/middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import urlRoute from "./modules/url/url.route.js";
import adminUserRoute from "./modules/user/user.route.js";
import pageRouter from "./modules/page/page.route.js";
import userRoute from "./modules/auth/auth.route.js";
import { fileURLToPath } from "url";
import oauthRoutes from "./modules/auth/auth.route.js";
import passport from "passport";
import "./infrastructure/configs/passport.config.js";
import requestLogger from "./shared/middlewares/requestLogger.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

app.use(requestLogger); 

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],

      scriptSrc: [
        "'self'",
        "https://challenges.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com",
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
      ],

      fontSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://fonts.gstatic.com",
      ],

      frameSrc: [
        "'self'",
        "https://challenges.cloudflare.com",
      ],

      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://developers.google.com",
      ],

      connectSrc: [
        "'self'",
      ],
    },
  },
}));

app.use(passport.initialize());

// parsing
app.use(express.urlencoded({extended: false}))
// cookies
app.use(cookieParser())
// static files
app.use(express.static(path.join(__dirname, "public")))

// view engine setup
app.set("view engine","ejs")
app.set("views", path.join(__dirname, "views"))

// routes
app.use("/url", urlRoute)
app.use("/user", userRoute)
app.use("/admin", adminUserRoute)
app.use("/", pageRouter)
app.use("/auth", oauthRoutes)
app.use(notFound)

app.use(errorHandler)

export default app;
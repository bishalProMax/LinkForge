import express from "express";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import passport from "passport";
import { errorHandler, notFound } from "./shared/middlewares/error.middleware.js";
import requestLogger from "./shared/middlewares/requestLogger.middleware.js";
import "./infrastructure/configs/passport.config.js";
import urlRoute from "./modules/url/url.route.js";
import adminRoute from "./modules/admin/admin.route.js";
import pageRouter from "./modules/page/page.route.js";
import authRoute from "./modules/auth/auth.route.js";
import userRoute from "./modules/user/user.route.js";
import qrRoute from "./modules/qr/qr.route.js";
import analyticsRoute from "./modules/analytics/analytics.route.js";
import bulkRoute from "./modules/bulk/bulk.route.js";
import aiRoute from "./modules/ai/ai.route.js";

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
        "https://res.cloudinary.com",
      ],
    },
  },
}));

app.use(passport.initialize());

// parsing
app.use(express.urlencoded({extended: false}))
app.use(express.json());
// cookies
app.use(cookieParser())
// static files
app.use(express.static(path.join(__dirname, "public")))

// view engine setup
app.set("view engine","ejs")
app.set("views", path.join(__dirname, "views"))

// routes
app.use("/url", urlRoute)
app.use("/admin", adminRoute)
app.use("/", pageRouter)
app.use("/auth", authRoute)
app.use("/user", userRoute)
app.use("/qr", qrRoute);
app.use("/analytics", analyticsRoute);
app.use("/bulk", bulkRoute);
app.use("/ai", aiRoute);
app.use(notFound)

app.use(errorHandler)

export default app;
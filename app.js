require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const prisma = require("./lib/prisma");
const router = require("./routers/routers");
const {
  localStrategy,
  serializeSession,
  deserializeSession,
} = require("./authenticators/authenticators");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 10000;

app.set("trust proxy", 1);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
    },
    secret: `${process.env.SECRET}`,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // 2 minutes in milliseconds
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

passport.use(localStrategy);
passport.serializeUser(serializeSession);
passport.deserializeUser(deserializeSession);

app.use(passport.session());
app.use("/", router);
app.use(errorHandler);

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App listening on port ${PORT}`);
});

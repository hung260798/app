var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var dotenv = require("dotenv");
dotenv.config();

// var indexRouter = require("./routes/index");
// var usersRouter = require("./routes/users");
const { default: mongoose } = require("mongoose");
const { MONGO_URL } = require("./config");
var app = express();

mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 3000 }).catch((err) => {
  console.log(err);
  process.exit(1);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/users", usersRouter);

var myRoutes = ["categories", "customers", "employees", "orders", "products"];
for (let route of myRoutes) {
  app.use(`/${route}`, require("./routes/" + route));
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

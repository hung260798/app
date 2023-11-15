const passport = require("passport");
var { Strategy, ExtractJwt } = require("passport-jwt");
const Customer = require("../models/Customer");
const Admin = require("../models/Admin");
const Token = require("../models/Token");

const { Authenticator } = passport;

var userAuth = (exports.userAuth = new Authenticator());
var adminAuth = (exports.adminAuth = new Authenticator());

userAuth.use(
  new Strategy(
    {
      secretOrKey: process.env.JWT_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const { customerId } = payload;
        const user = await Customer.findById(customerId);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

adminAuth.use(
  new Strategy(
    {
      secretOrKey: process.env.JWT_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const { adminId } = payload;
        const user = await Admin.findById(adminId);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

var checkToken = (exports.checkToken = async function (req, res) {
  try {
    const authHeader = req.get("authorization");
    const token = authHeader.split(" ").pop();
    let rs = await Token.findOne({ token });
    if (!rs) throw Error("Unauthorized");
    next();
  } catch (error) {
    res.send({ err: error.message });
  }
});

exports.userAuthMiddlewares = [
  checkToken,
  userAuth.authenticate("jwt", { session: false }),
];

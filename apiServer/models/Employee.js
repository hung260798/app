var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema(
  {
    firstName: String,
    lastName: String,
    birthday: Date,
    gender: String,
    phone: String,
    email: String,
    profilePicture: String,
  },
  {
    virtuals: {
      fullname: {
        get() {
          return this.firstName + " " + this.lastName;
        },
      },
    },
  }
);


module.exports = model("Employee", schema);

var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthday: Date,
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      uppercase: true,
    },
    phone: { type: String, required: true },
    email: { type: String },
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

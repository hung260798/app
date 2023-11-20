var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

const schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: {
      type: String,
      default: function () {
        return this.firstName + " " + this.lastName;
      },
    },
    phone: { type: String, required: true },
    email: { type: String },
    avatar: String,
    birthday: { type: Date },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    accountPassword: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    cart: {
      type: [
        {
          id: ObjectId,
          name: String,
          quantity: Number,
          price: Number,
          discount: Number,
        },
      ],
      default: [],
    },
  },
  {
    virtuals: {
      fullname: {
        get() {
          return this.firstName + " " + this.lastName;
        },
        set(fullname) {
          const [fname, lname] = fullname.split(" ");
          this.firstName = fname;
          this.lastName = lname;
        },
      },
    },
  }
);

module.exports = model("Customer", schema);

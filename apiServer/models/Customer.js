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
    username: String,
    phone: String,
    email: String,
    avatar: String,
    birthday: Date,
    gender: String,
    accountPassword: String,
    isVerified: Boolean,
    cart: {
      type: [
        {
          id: ObjectId,
          name: String,
          quantity: Number,
          price: Number,
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

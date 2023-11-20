const { default: mongoose, Schema, model, Types } = require("mongoose");

const schema = new Schema(
  {
    _id: Types.ObjectId,
    firstName: String,
    lastName: String,
    birthday: Date,
    gender: String,
    avatar: String,
    // phone: String,
    // email: String,
    cart: [
      {
        id: Types.ObjectId,
        name: String,
        price: Number,
        discount: Number,
        quantity: Number,
      },
    ],
  },
  {
    autoCreate: false,
    autoIndex: false,
  }
);

const CustomerView = model("CustomerView", schema, "customerView");
(async () => {
  await mongoose.connection.dropCollection("customerView");
  await CustomerView.createCollection({
    viewOn: "customers",
    pipeline: [
      {
        $project: {
          phone: 0,
          email: 0,
          cart: 0,
          accountPassword: 0,
        },
      },
    ],
  });
})();

module.exports = CustomerView;

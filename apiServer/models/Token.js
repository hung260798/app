/* var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  customerId: ObjectId,
  adminId: ObjectId,
  token: String,
  expiredAt: Date,
});

module.exports = model("Token", schema);
 */

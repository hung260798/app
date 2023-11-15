var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var md, schema;

schema = new Schema({
  username: String,
  password: String,
  type: String,
});

module.exports = model("Admin", schema);

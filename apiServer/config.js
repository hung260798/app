const UPLOAD_DIR = "public/uploads";
const DB_NAME = "online_shop_test";
const DB_HOST = "127.0.0.1:27017";
const MONGO_URL = "mongodb://" + DB_HOST + "/" + DB_NAME;

module.exports = {
  UPLOAD_DIR,
  MONGO_URL,
};

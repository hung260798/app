const path = require("path");
const { unlink } = require("fs/promises");
const multer = require("multer");
const { UPLOAD_DIR } = require("../config");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const extesion = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extesion);
  },
});

exports.uploadFile = multer({ storage });

exports.deleteFile = async function (filename) {
  const filepath = path.join(UPLOAD_DIR, filename);
  return await unlink(filepath);
};

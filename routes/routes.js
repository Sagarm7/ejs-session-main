const express = require("express");
const fs = require("fs");
const filename = "./db.json";
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
require("dotenv").config();
const multer = require("multer");
const Router = express.Router();

//! MULTER CONFIG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + "/../public/images");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + ".png");
    },
  });
  const upload = multer({ storage });
  Router.post("/uploadfile",upload.single("myFile"),(req, res) => {
      const file = req.file;
      let avatar = "/images/" + file.filename;
      let data = fs.readFileSync(filename);
      let db = JSON.parse(data);
      try {
        db.users.forEach(async (user) => {
          if (user.username == req.session.user.username) {
            user.avatar = avatar;
            await writeFile(filename, JSON.stringify(db, null, "\t"));
          }
        });
        res.status(200).json({ message: "Profile Updated Successfully" });
      } catch (err) {
        res.status(400).json();
      }
    },
    (error, req, res, next) => {
      res.status(400).json({ error: error.message });
    }
  );
  
module.exports = Router;
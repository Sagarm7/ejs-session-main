const express = require("express");
const Router = express.Router();
const fs = require("fs");
const filename = "./db.json";
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const bcrypt = require("bcryptjs");
const shortid = require("shortid");
const salt = 10;
const cookie = require("cookie-parser");


Router.use(cookie())
const cookies = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/");
    }
  };




Router.get("/login", (req, res) => {
  res.render("index");
});
Router.get("/", (req, res) => {
  let data = fs.readFileSync(filename);
  let movies = JSON.parse(data);
  movies = movies.movies;
  // console.log(req.session.user);
  let isLoggedIn = false;
  if (req.session.user) {
    isLoggedIn = true;
    res.render("home", { page: "home", isLoggedIn, user: req.session.user, movies });
  } else {
    res.render("home", { page: "home", isLoggedIn, movies });
  }
});
Router.get("/about", (req, res) => {
  let isLoggedIn = false;
  if (req.session.user) {
    isLoggedIn = true;
    res.render("about", { page: "about", isLoggedIn, user: req.session.user });
  } else {
    res.render("about", { page: "about", isLoggedIn });
  }
});
Router.get("/services", (req, res) => {
  let isLoggedIn = false;
  if (req.session.user) {
    isLoggedIn = true;
    res.render("services", { page: "services", isLoggedIn, user: req.session.user });
  } else {
    res.render("services", { page: "services", isLoggedIn });
  }
});

Router.get("/profile",  (req, res) => {
  console.log(req.session.user);
  res.render("profile", { page: "profile", isLoggedIn: true, user: req.session.user });
});
//! signup post request

Router.post("/signup", async (req, res) => {
  let data = fs.readFileSync(filename);
  let db = JSON.parse(data);
  let { name, username, email, password } = req.body;
  let userId = shortid.generate();
  let avatar = "/images/default.png";
  let checkEmail = db.users.map((user) => {
    return user.email == email;
  });
  let checkUsername = db.users.map((user) => {
    return user.username == username;
  });
  if (checkEmail.indexOf(true) > -1 || checkUsername.indexOf(true) > -1) {
    res.status(401).json({ message: "Already exists" });
  } else {
    try {
      let hashedPassword = await bcrypt.hash(password, salt);
      db.users.push({ userId, name, username, email, password: hashedPassword, avatar });
      await writeFile(filename, JSON.stringify(db, null, "\t"));
      req.session.user = {
        userId,
        email,
        name,
        username,
        avatar,
      };
      res.status(200).json({ message: "Account created successfully." });
    } catch (err) {
      res.status(400).json({});
    }
  }
});
Router.post("/login", async (req, res) => {
  let data = fs.readFileSync(filename);
  let db = JSON.parse(data);
  let { username, password } = req.body;
  let user = db.users.filter((user) => {
    return user.username == username;
  });
  console.log(user);
  if (user.length) {
    let isMatch = await bcrypt.compare(password, user[0].password);
    if (isMatch) {
      console.log("Success");
      res.cookie("username", user[0].username);
      req.session.user = {
        userId: user[0].userId,
        email: user[0].email,
        name: user[0].name,
        username: user[0].username,
        avatar: user[0].avatar,
      };
      res.status(200).json({ message: "Login Successful" });
    } else {
      console.log("Invalid Password");
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } else {
    res.status(400).json({ message: "Invalid Credentials" });
  }
});



Router.post("/logout",  async (req, res) => {
  console.log("Logging out");
  await req.session.destroy();
  res.status(200).json({ message: "Logged out" });
});
module.exports = Router;

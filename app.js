const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");



app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const authRoutes2 = require("./routes/routes");
app.use("/", authRoutes2);



const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server has started at http://localhost:" + PORT);
});

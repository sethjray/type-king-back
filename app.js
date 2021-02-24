/** @format */

require("dotenv").config();
console.log("MODE:", process.env.NODE_ENV);
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")
  require("dotenv").config();

require("./mongooseClient");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");

//routes
const userRoutes = require("./routes/users");

var app = express();

//middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use("/api/users", userRoutes);

//error
app.use((err, res) => {
    if (err.name === "ValidationError") {
      var valErrors = [];
      Object.keys(err.errors).forEach((key) =>
        valErrors.push(err.errors[key].message)
      );
      res.status(422).send(valErrors);
    }
});
  
//dev port
//don't change
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));

module.exports = app;
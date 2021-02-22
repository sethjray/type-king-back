const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () =>
  console.log("MongoDB Database connected!")
);
mongoose.connection.on("error", (err) => console.log(err));

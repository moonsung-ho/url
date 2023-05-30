const express = require("express");
const app = express();
const port = 3000;

require("dotenv").config();

const mongoose = require("mongoose");
mongoose
  .connect(
    `mongodb+srv://moonsungho:${process.env.MONGODB_PW}@urlshortener.ju9kyl1.mongodb.net/?retryWrites=true&w=majority`,
    {
      // useNewUrlPaser: true,
      // useUnifiedTofology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB conected"))
  .catch((err) => {
    console.log(err);
  });

const urlSchema = new mongoose.Schema({
  url: String,
  to: String
});
const model = mongoose.model("url", urlSchema);

app.get("/shorten", (req, res) => {
  model.find({ to: req.query.to }).then((result) => {
    console.log(result);
    if (result.length === 0) {
      model.create({ url: req.query.url, to: req.query.to });
      res.json({ status: "successed" });
    } else {
      res.json({ status: "failed" });
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/");
});

app.get("/*", (req, res) => {
  console.log(req.params);
  model
    .findOne({ to: req.params[0] })
    .then((result) => {
      res.redirect(result.url);
    })
    .catch((error) => {
      res.redirect("/?type=urldoesnotexist");
    });
});

app.listen(port, () => {
  console.log(`app working on ${port}`);
});

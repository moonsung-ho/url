const express = require("express");
const app = express();
const https = require("https");
const port = 3000;
const fs = require("fs");

require("dotenv").config();

const mongoose = require("mongoose");
mongoose
  .connect(
    `mongodb+srv://moonsungho:${process.env.MONGODB_PW}@urlshortener.ju9kyl1.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("MongoDB conected"))
  .catch((err) => {
    console.log(process.env.MONGODB_PW);
    console.log(err);
  });

const urlSchema = new mongoose.Schema({
  url: String,
  to: String,
  clicked: Number,
});
const model = mongoose.model("url", urlSchema);

app.get("/shorten", (req, res) => {
  model.find({ to: req.query.to }).then((result) => {
    console.log(result);
    if (result.length === 0) {
      model.create({ url: req.query.url, to: req.query.to, clicked: 0 });
      res.json({ status: "successed" });
    } else {
      res.json({ status: "failed" });
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/");
});

app.get("/*/stats", (req, res) => {
  model
    .findOne({ to: req.params[0] })
    .then((result) => {
      res.send(
        `현재까지 ${result.url}로 향하는 단축 URL
        "${result.to}"은(는) ${result.clicked.toString()}번 열렸습니다.`
      );
    })
    .catch((error) => {
      res.redirect("/?type=urldoesnotexist");
      console.log(error);
    });
});

app.get("/*", (req, res) => {
  console.log(req.params);
  model
    .findOne({ to: req.params[0] })
    .then((result) => {
      model
        .updateOne(
          { to: req.params[0] },
          { $set: { clicked: result.clicked + 1 } }
        )
        .then(() => {
          console.log("clicked updated to", result.clicked + 1);
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect(result.url);
    })
    .catch((error) => {
      res.redirect("/?type=urldoesnotexist");
    });
});

app.listen(port, () => {
  console.log(`HTTP working on ${port}`);
});

const options = {
  key: fs.readFileSync(__dirname + "/certs/cemo.site.key"),
  cert: fs.readFileSync(__dirname + "/certs/cemo.site.pem"),
};

https.createServer(options, app).listen(3001, () => {
  console.log("HTTPS working on 3001");
});

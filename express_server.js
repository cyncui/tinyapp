const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};

  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL
  }
  res.send("URL received!"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  // console.log("longURL:", urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

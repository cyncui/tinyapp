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

// list of my urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// creating new short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls`);
});

// displaying the create new url form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render("urls_show", templateVars)
});

// redirecting to the actual URL
app.get('/u/:shortURL', (req, res) => {
  const redirection = urlDatabase[req.params.shortURL];
  res.redirect(redirection);
});

// editing an URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL].longURL = req.body.updatedURL;
  res.redirect("/urls");
})

// deleting an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});

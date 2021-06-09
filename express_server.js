const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "one@example.com",
    password: "abc"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "two2@example.com",
    password: "123"
  }
}

app.get("/", (req, res) => {
  res.send("hello!");
});

// logging in
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render("urls_index", templateVars);
});

// registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render("urls_registration", templateVars);
});

// adding newly registered user to user objects
app.post("/register", (req, res) => {
  if (req.body.email = "" && req.body.password = "") {
    res.status(404);
  } if ()
  const userID = generateRandomString();

  users[userID] = {
    userID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);

  res.cookie('user_id', userID);
  res.redirect("/urls");
});

// list of my urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

// displaying the create new url form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// redirecting to the actual URL
app.get('/u/:shortURL', (req, res) => {
  const redirection = urlDatabase[req.params.shortURL];
  res.redirect(redirection);
});

// creating new short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

// deleting an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// editing an URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

// logging in and saving the cookie
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// logging out and clearing cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});

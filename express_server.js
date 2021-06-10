// config
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["secret1", "secret2"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

// functions
const {
  findEmail,
  generateRandomString,
  urlsForUser
} = require('./helperFunctions');

// variables
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

///////////////////////////////////////////////////////////////
/*
routing
*/

// homepage
app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// list of my urls
app.get('/urls', (req, res) => {
  if (req.session.userID) {
    const userUrls = urlsForUser(req.session.userID, urlDatabase);
    const templateVars = {
      urls: userUrls,
      user: users[req.session['user_id']]
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  };
});

// displaying the create new url form
app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    const templateVars = {
      user: users[req.session['user_id']]
    };

    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  };
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session['user_id']]
  };
  res.render("urls_show", templateVars);
});

// redirecting to the actual URL
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

// creating new short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

// deleting an URL if it belongs to the user
app.post("/urls/:shortURL/delete", (req, res) => {
  const userUrls = urlsForUser(req.session.userID, urlDatabase);
  const shortURL = req.params.shortURL;

  if (req.session.userID && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    const errorMessage = "oops! you don't have permission to do that."
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// editing an URL if it belongs to the user
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL][req.body.longURL];

  if (req.session.userID && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
  } else {
    const errorMessage = "oops! you don't have permission to do that."
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
  };
  res.render("urls_login", templateVars);
});

// logging in
app.post("/login", (req, res) => {
  const loggedInUser = findEmail(req.body.email, users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (loggedInUser && bcrypt.hashSync(req.body.password, hashedPassword)) {
    res.cookie("user_id", loggedInUser.userID);
    res.redirect("/urls");
  } else {
    const errorMessage = 'incorrect password! are you sure you entered it correctly? 🤔';
    res.status(403).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
  };
  res.render("urls_register", templateVars);
});

// registering
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findEmail(req.body.email, users)) {
      const userID = generateRandomString();
      const hashedPassword = bcrypt.hashSync(req.body.password,  10);

      users[userID] = {
        userID,
        email: req.body.email,
        password: hashedPassword
      };

      req.session.user_id = userID;
      res.redirect('/urls');
    } else {
      const errorMessage = 'cannot create an account with an email that is already in use.';
      res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
    }
  } else {
    const errorMessage = 'you left your email or password empty! :( please make sure both fields are filled in.';
    res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// logging out and clearing cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});

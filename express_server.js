// config
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

app.use(express.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: "session",
  keys: ["secret keys"]
}));

app.set("view engine", "ejs");

// functions
const {
  generateRandomString,
  urlsForUser,
  getUserByEmail
} = require('./helpers');

// variables
const urlDatabase = {};
const users = {};

/*
routing below
*/

// homepage - redirects to /urls if logged in, /login otherwise
app.get('/', (req, res) => {
  if (!users[req.session.userID]) {
    res.redirect('/login');
    return;
  }

  res.redirect('/urls');
  return;
});

// urls index page - shows urls that belong to the user if logged in
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const usersUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: usersUrls, user: users[userID] };

  if (!users[userID]) {
    res.redirect('/login');
    return;
  }
  res.render('urls_index', templateVars);
  return;
});

// new url creation - adds new url to database & redirects to the short url page
app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    const errorMessage = 'you have to be logged in to do that!';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
    return;
  }

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID
  };

  res.redirect(`/urls/${shortURL}`);
  return;
});

// login page - redirects to urls index page if logged in
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };
  
  if (!req.session.userID) {
    res.render("urls_login", templateVars);
    return;
  }

  
  res.redirect('/urls');
  return;
});

// logging in - redirects to urls page if credentials are correct
app.post("/login", (req, res) => {
  const loggedInUser= getUserByEmail(req.body.email, users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (loggedInUser && bcrypt.hashSync(req.body.password, hashedPassword)) {
    req.session.userID = loggedInUser.userID;
    res.redirect('/urls');
    return;
  } else {
    const errorMessage = 'incorrect password! are you sure you entered it correctly? 🤔';
    res.status(403).render('urls_error', {user: users[req.session.userID], errorMessage});
    return;
  }
});

// registration page - redirects to urls if already logged in
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
  };
  if (!users[req.session.userID]) {
    res.render("urls_register", templateVars);
    return;
  }

  res.redirect('/urls');
  return;
});

// registering - redirects to urls page upon successful registeration
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      const hashedPassword = bcrypt.hashSync(req.body.password,  10);

      users[userID] = {
        userID,
        email: req.body.email,
        password: hashedPassword
      };

      req.session.userID = userID;
      res.redirect('/urls');
      return;
    } else {
      const errorMessage = 'cannot create an account with an email that is already in use.';
      res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
      return;
    }
  } else if (!req.body.email || !req.body.password) {
    const errorMessage = 'you left your email or password empty! :( please make sure both fields are filled in.';
    res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
    return;
  }
});

// new url creation page - validates if user logged in before displaying page
app.get("/urls/new", (req, res) => {
  if (users[req.session.userID]) {
    const templateVars = {
      user: users[req.session.userID]
    };

    res.render("urls_new", templateVars);
    return;
  } else {
    res.redirect('/login');
    return;
  };
});

// short url page - shows details about the url if it belongs to the currently logged in user
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const usersUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urlDatabase,
    usersUrls,
    shortURL,
    user: users[userID]
  };

  if (!urlDatabase[shortURL]) {
    const errorMessage = "this doesn't exist! are you sure you have the right place?";
    res.status(404).render('urls_error', {user: users[userID], errorMessage});
    return;
  } else if (!userID || !usersUrls[shortURL]) {
    const errorMessage = "you're not allowed to see this!! please log in first.";
    res.status(401).render('urls_error', {user: users[userID], errorMessage});
    return;
  } else {
    res.render("urls_show", templateVars);
    return;
  }
});

// deleting an url if it belongs to the user
app.post("/urls/:shortURL/delete", (req, res) => {
  const usersUrls = urlsForUser(req.session.userID, urlDatabase);
  const shortURL = req.params.shortURL;

  if (users[req.session.userID] && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  } else {
    const errorMessage = "oops! you don't have permission to do that."
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
    return;
  }
});

// editing a longURL if it belongs to the user
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL][req.body.longURL];

  if (users[req.session.userID] && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
    return;
  } else {
    const errorMessage = "oops! you don't have permission to do that."
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
    return;
  }
});

// redirecting to the actual url (the long one)
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
    return;
  }
});

// logging out and clearing the session's cookies - redirects to urls index page
app.post("/logout", (req, res) => {
  req.session = null;
  res.clearCookie('session.sig');
  res.redirect("/");
});

// server listen message!
app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});

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
const urlDatabase = {};
const users = {};

/*
routing
*/

// homepage - redirects to /urls if logged in, /login otherwise
app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// urls index page - shows urls that belong to the user if logged in
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

// new url creation page - validates if user logged in before displaying page
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

// new url creation - adds new url to database & redirects to the short url page
app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const errorMessage = 'you have to be logged in to do that!';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }

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
  } else if (!userID || !usersUrls[shortURL]) {
    const errorMessage = "you're not allowed to see this!! please log in first.";
    res.status(401).render('urls_error', {user: users[userID], errorMessage})
  } else {
    res.render("urls_show", templateVars);
  }
});

// redirecting to the actual url (the long one)
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

// deleting an url if it belongs to the user
app.post("/urls/:shortURL/delete", (req, res) => {
  const usersUrls = urlsForUser(req.session.userID, urlDatabase);
  const shortURL = req.params.shortURL;

  if (req.session.userID && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    const errorMessage = "oops! you don't have permission to do that."
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// editing a longURL if it belongs to the user
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

// login page - redirects to urls index page if logged in
app.get("/login", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  }

  const templateVars = {
    user: users[req.session['user_id']],
  };

  res.render("urls_login", templateVars);
});

// logging in - redirects to urls page if credentials are correct
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
  if (req.session.userID) {
    res.redirect('/urls');
  }

  const templateVars = {
    user: users[req.session['user_id']],
  };
  res.render("urls_register", templateVars);
});

// registering - redirects to urls page upon successful registeration
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

// logging out and clearing the session's cookies - redirects to urls index page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});

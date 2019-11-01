const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const { emailLookUp } = require("./helpers");
const { generateRandomString } = require("./helpers");
const { findID } = require("./helpers");
const { urlsForUser } = require("./helpers");
const { checkPasswords } = require("./helpers");
const { urlDatabase } = require("./objectDatabase");
const { users } = require("./objectDatabase");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["rewqasdcxzmnbvlkjghptoyiutre3432185769531fhdsakfdshsafd"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Get Requests
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  if (req.session.user_id === undefined) {
    res.render("newUserHomePage", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  const longURL = urlObject.longURL;
  urlDatabase[shortURL] = { longURL: longURL, user: req.session.user_id };
  let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  if (longURL === undefined) {
    return res.statusCode(404).send("Link not Found");
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

// POST requests
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: req.body.longURL, user: users[req.session.user_id] };
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]["user"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("please login to delete!");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]["user"]) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL] = { longURL: req.body.longURL, user: req.session.user_id };
    res.redirect("/urls");
  } else {
    res.send("log in to edit!");
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (emailLookUp(userEmail, userPassword, users) === false && checkPasswords(userPassword, userEmail)) {
    req.session.user_id = findID(userEmail, users);
    res.redirect("/urls");
  } else {
    res.status(403).render("errorPage.ejs");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = undefined;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const handledPassword = bcrypt.hashSync(userPassword, 10);
  const randomUserID = generateRandomString();
  if (emailLookUp(userEmail, userPassword, users)) {
    users[randomUserID] = { id: randomUserID, email: userEmail, password: handledPassword };
    req.session.user_id = randomUserID;
    res.redirect("/urls");
  } else {
    res.status(403).render("errorPage.ejs");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
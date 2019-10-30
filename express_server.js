const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs" );

function generateRandomString() {
  let randomNum = 0;
  const randomArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", 
    "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", 
    "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", 
    "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", 
    "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", 
    "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", 
    "Z" ];
  let randomString = "";
  for (let i = 0; i <= 6; i++) {
    randomNum = Math.floor((Math.random() * (randomArray.length)));
    randomString += randomArray[randomNum];
  }
  return randomString;
};

function emailLookUp(res, email, password, users) {
  if (email === "" || password === "") {
    return res.status(400).send("Input a email and password ya goof!");
  } 
  let usersArray = Object.values(users);
    for (let i = 0; i < usersArray.length; i++) {
      if (usersArray[i]["email"] === email) {
        return res.status(400).send("Input a email and password ya goof!");
      }
    }
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.cookies["randomUserID"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies["randomUserID"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, user: req.cookies["randomUserID"]};
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies["randomUserID"]};
  res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, user: req.cookies["randomUserID"] };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.cookies["randomUserID"]};
  res.render("login", templateVars);
});


app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});


// app.post("/login", (req, res) => {
//   res.cookie("username", req.body.username);
//   res.redirect("/urls");
//   let templateVars = { user: req.cookies["randomUserID"] }
//   res.render("urls_index", templateVars);
// });

app.post("/logout", (req, res) => {
  (res.clearCookie('randomUserID', req.body["randomUserID"]));
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let randomUserID = generateRandomString();
  emailLookUp(res, userEmail, userPassword, users);
  users[randomUserID] = { id: randomUserID, email: userEmail, password: userPassword };
  res.cookie("randomUserID", randomUserID);
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 

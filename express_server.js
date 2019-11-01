const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["rewqasdcxzmnbvlkjghptoyiutre3432185769531fhdsakfdshsafd"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

function emailLookUp(email, password, users) {
  if (email === "" || password === "") {
    return false
  } 
  let usersArray = Object.values(users);
    for (let i = 0; i < usersArray.length; i++) {
      if (usersArray[i]["email"] === email) {
        return false;
      }
    }
  return true;
};

function findID (email, users) {
  let usersArray = Object.values(users);
  for (let i = 0; i < usersArray.length; i++) {
    if (usersArray[i]["email"] === email) {
      let id = usersArray[i]["id"]
      return id;
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
  b6UTxQ: { longURL: "https://www.tsn.ca", user: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user: "aJ48lW" }
}; 

function urlsForUser(id) {
  let obj = {};
  for (const i in urlDatabase) {
    if (id === urlDatabase[i].user) {
      obj[i] = urlDatabase[i];
    }
  }
  return obj;
};

function checkPasswords(password, email) {
  let passwordDatabase = "";
  for (const i in users) {
    if (email === users[i]["email"]){
      passwordDatabase += users[i]["password"];
    }
  }
  console.log(password, passwordDatabase);
  return bcrypt.compareSync(password, passwordDatabase);
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  console.log(req.session.user_id);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = { user: users[req.session.user_id] }
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  console.log("edit page");
  let shortURL = req.params.shortURL;
  let urlObject = urlDatabase[shortURL];
  let longURL = urlObject.longURL;
  urlDatabase[shortURL] = { longURL: longURL, user: req.session.user_id }
  let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.session.user_id] };
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
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let urlObject = urlDatabase[shortURL];
  let longURL = urlObject.longURL;
  let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});


app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
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
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (emailLookUp(userEmail, userPassword, users) === false && checkPasswords(userPassword, userEmail)) {
    req.session.user_id = findID(userEmail, users)
    res.redirect("/urls");
  } else {
    res.status(403).send("Incorrect Username or Password");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = undefined;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const handledPassword = bcrypt.hashSync(userPassword, 10);
  let randomUserID = generateRandomString();
  if (emailLookUp(userEmail, userPassword, users)) {
    users[randomUserID] = { id: randomUserID, email: userEmail, password: handledPassword };
    req.session.user_id = randomUserID;
    res.redirect("/urls")
  } else {
    res.status(400).send("input a valid email and password");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 

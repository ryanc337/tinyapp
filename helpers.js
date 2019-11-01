const { urlDatabase } = require("./objectDatabase");
const { users } = require("./objectDatabase");
const bcrypt = require("bcrypt");

// Look up users by email and check if they have inputed a valid password
function emailLookUp(email, password, users) {
  if (email === "" || password === "") {
    return false;
  }
  let usersArray = Object.values(users);
  for (let i = 0; i < usersArray.length; i++) {
    if (usersArray[i]["email"] === email) {
      return false;
    }
  }
  return true;
};

// generate a random string for user_id and for shortURL
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

// find Users by ID
function findID(email, users) {
  let usersArray = Object.values(users);
  for (let i = 0; i < usersArray.length; i++) {
    if (usersArray[i]["email"] === email) {
      let id = usersArray[i]["id"];
      return id;
    }
  }
}

// Only show urls for a given user
function urlsForUser(id) {
  let obj = {};
  for (const i in urlDatabase) {
    if (id === urlDatabase[i].user) {
      obj[i] = urlDatabase[i];
    }
  }
  return obj;
};

// Check if the hashed password matches the inputted password
function checkPasswords(password, email) {
  let passwordDatabase = "";
  for (const i in users) {
    if (email === users[i]["email"]) {
      passwordDatabase += users[i]["password"];
    }
  }
  return bcrypt.compareSync(password, passwordDatabase);
};

module.exports = { emailLookUp, generateRandomString, findID, urlsForUser, checkPasswords };
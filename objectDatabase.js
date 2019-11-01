// Database for users
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

// Database for urls & user_id of url
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user: "aJ48lW" }
}; 

module.exports = { urlDatabase, users };
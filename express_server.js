const { searchUsersByEmail, searchDataBaseByUser, generateRandomString} = require("./helper");

const express = require("express");
const cookieSession = require("cookie-session");

const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "cookiemonster",
    keys: ["my secret key", "yet another secret key"],
  })
);

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "a12" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "a123" },
};

const users = {
  a12: {
    id: "a12",
    email: "a@123.com",
    password: "$2a$10$dBTxeK9j.2dntmrf/2kfeepyi2lgqeGcFcqzPVWP3Cj4txeBA.UC.",
  },
  a123: {
    id: "a123",
    email: "b@123.com",
    password: "$2a$10$dBTxeK9j.2dntmrf/2kfeepyi2lgqeGcFcqzPVWP3Cj4txeBA.UC.",
  },
};

/////////////////////////////////////////////When you goto url_new
app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];

  if (!user) {
    return res.redirect("/login");
  } else {
    const templateVars = { email: user.email };
    res.render("urls_new", templateVars);
  }
});

////////////////////////////////////////////When you goto URL index
app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];

  if (!user) {
    res.status(400).json("Must be logged to access urls");
  }

  if (user) {
    const userData = searchDataBaseByUser(user.id, urlDatabase);
    const templateVars = { urls: userData, email: user.email };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { urls: {}, email: null };
    res.render("urls_index", templateVars);
  }
});

////////////////////////////////////////////When you goto SHOW URLS
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];

  if (!user) {
    return res.status(400).json("You must be logged in");
  }else if(user.id !== urlDatabase[req.params.shortURL].userID){
    return res.status(400).json("You do not have permision to access that URL");
  } else if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).json("URL doesnt exist");
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      email: user.email,
    };
    res.render("urls_show", templateVars);
  }
});

////////////////////////////////////Redirects you to acutal website
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
   res.status(400).send("URL doesnt exist");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(`https://${longURL}`);
  }
});

///////////////////////////////////////////////////Render login.ejs template
app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { email: users.email };
  
  if (user) {
    return res.redirect(`/urls`);
  } else {
    res.render("login", templateVars);
  }
});

////////////////////////////////////////////Render register.ejs template
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { email: users.email };
  
  if (user) {
    return res.redirect(`/urls`);
  } else {
    res.render(`register`, templateVars);
  }
});

//////////////////////////////////////////////////adding of url
app.post("/urls", (req, res) => {
 
  const user = req.session["user_id"];
 
  
  if (!user) {
    return res.status(400).json("Must be logged in to post URLS");
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL: longURL, userID: user };
  return res.redirect("/urls/" + shortURL);
});

////////////////////////////////////////////////////// Delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;

  if (req.session["user_id"] !== urlDatabase[urlToDelete].userID) {
    return res.status(400).json("Bad Request");
  }
  delete urlDatabase[urlToDelete];
  return res.redirect("/urls/");
});

//////////////////////////////////////////////////////////Update URLS
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;

  if (req.session["user_id"] !== urlDatabase[shortURL].userID) {
    return res.status(401).json("Bad Request");
  }
  urlDatabase[shortURL] = { longURL: newURL, userID: req.session["user_id"] };
  return res.redirect(`${shortURL}`);
});

////////////////////////////////////////// Endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  if (!email || !password) {
    return res.status(403).json("Email and or password can not be blank");
  }
  const user = searchUsersByEmail(email, users);

  if (!user) {
    return res.status(403).json("No user with that email exists");
  }

  const passwordMatched = bcrypt.compareSync(password, user.password);

  if (user && passwordMatched) {
    req.session.user_id = user.id;
    return res.redirect(`/urls/`);
  }
  return res.status(403).json("User found but incorrect password entered");
});

////////////////////////////////////////// Endpoint to handle a POST to /login
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect(`/login`);
});

//////////////////////////////////////////////////Registration handler
app.post("/register", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  //making sure email or password is not blank
  if (!email || !password) {
    return res.status(400).json("Email or password can not be blank");
  }
  //check to see if user already exists
  const user = searchUsersByEmail(email, users);

  if (user) {
    return res.status(400).json("A user has already registed with that email");
  }
  const id = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  return res.redirect(`/urls`);
});

app.get("/", (req, res) => {
  return res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.json("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = { users, urlDatabase };

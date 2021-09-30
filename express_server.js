const express = require("express");
const cookieParser = require('cookie-parser');

const bcrypt = require('bcryptjs');


const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: "a12"},
  "9sm5xK": {longURL:"http://www.google.com", userID: "a12"}
};

const users = {
  "a12": {
    id: "a12",
    email: "a@123.com",
    password: "abc"
  },
  "a123": {
    id: "a123",
    email: "b@123.com",
    password: "abc"
  }
};

const searchDataBaseByUser = (userID) => {
  const newUrlDatabase = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['userID'] === userID) {
      newUrlDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return newUrlDatabase;
};
   
const searchUsersByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};


/////////////////////////////////////////////When you goto url_new
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect('/login');
  } else {
    const templateVars = {email: user.email};
    res.render("urls_new", templateVars);
  }
});

////////////////////////////////////////////When you goto URL index
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars;
  
  if (user) {
    let userData = searchDataBaseByUser(user.id);
    templateVars = { urls: userData, email: user.email };
  } else {
    templateVars = {urls:{}, email:undefined};
  }
  res.render("urls_index", templateVars);
});
    
////////////////////////////////////////////When you goto SHOW URLS
app.get("/urls/:shortURL", (req, res) =>{
   const user = users[req.cookies["user_id"]];
   //console.log("this is the data ", users[req.cookies["user_id"]])
   if (!user) {
    return res.redirect('/login');
  } else {
    console.log("userdata base ",urlDatabase);
    const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], email: user.email};
    res.render("urls_show", templateVars);
  }
});

////////////////////////////////////Redirects you to acutal website
app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  return res.redirect(longURL);
});

//////////////////////////////////////////////////adding of url
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {longURL: longURL, userID: user};
  console.log(urlDatabase[shortURL]);
  return res.redirect('/urls/' + shortURL);
});

////////////////////////////////////////////////////// Delete urls
app.post("/urls/:shortURL/delete", (req,res) => {
  const urlToDelete = req.params.shortURL;
  if (req.cookies['user_id'] !== urlDatabase[urlToDelete].userID) {
    return res.status(400).json('Bad Request');
  }
  delete urlDatabase[urlToDelete];
  return res.redirect('/urls/');
});

////////////////////////////////////////////////////////////////Update URLS
app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.body)
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  // urlDatabase[shortURL] = newURL;

  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    return res.status(401).json('Bad Request');
  }
  urlDatabase[shortURL] = {longURL:newURL, userID:req.cookies["user_id"]};
  // console.log(urlDatabase);
  return res.redirect(`/urls/`);
});
  
////////////////////////////////////////// Endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  
  
  
  if (!email || !password) {
    return res.status(403).json("Email and or password can not be blank");
  }
  const user = searchUsersByEmail(email);
  if (!user) {
    return res.status(403).json("No user with that email exists");
  }
  
  const passwordMatched = bcrypt.compareSync(password, user.password);
  if (user && passwordMatched) {
    res.cookie('user_id', user.id);
    return res.redirect(`/urls/`);
  }
  return res.status(403).json("User found but incorrect password entered");
});
   
////////////////////////////////////////// Endpoint to handle a POST to /login
app.post("/logout", (req, res) => {
  //const user = users[req.cookies["user_id"]];//////////////////////////
  //res.clearCookie("email", users.email)
  res.clearCookie("user_id");
  return res.redirect(`/login`);
});

///////////////////////////////////////////////////Render login.ejs template
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {email: users.email};
  
  if (user) {
    return res.redirect(`/urls`);
  } else {
    res.render('login', templateVars);
  }
});

////////////////////////////////////////////Render register.ejs template
app.get("/register", (req, res) => {
  
  const user = users[req.cookies["user_id"]];
  const templateVars = {email: users.email};
  
  if (user) {
    return res.redirect(`/urls`);
  } else {
    res.render(`register`, templateVars);
  }
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
  const user = searchUsersByEmail(email);
  
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

  res.cookie('user_id', id);
  return res.redirect(`/urls`);
});

app.get("/", (req, res) => {
  return res.json("Hello!");
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

const generateRandomString = () => {
  let sixRanLetters = '';
  const letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSdTtUuVvWwXxYyZz';
  const letterNum = letters.length;
  
  for (let i = 0; i < 6; i++) {
    sixRanLetters += letters.charAt(Math.floor(Math.random() * letterNum));
  }
  return sixRanLetters;
};
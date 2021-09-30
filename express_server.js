const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
//const bodyParser = require("body-parser");
//const { render } = require("ejs");
//const { response } = require("express");
//app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


const searchUsersByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// const searchUsersByPassword = (password) => {
//   for (const userPass in Password)
// }



app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {email: user.email};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, email: undefined };
  if (user) {
    templateVars = { urls: urlDatabase, email: user.email };
  }

  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) =>{
  const user = users[req.cookies["user_id"]];
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: user.email};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});


// Delete urls
app.post("/urls/:shortURL/delete", (req,res) => {

  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect('/urls/');
});

//Update URLS
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/`);
});

// Endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  
  const email = req.body["email"];
  const password = req.body["password"];

  const user = searchUsersByEmail(email);
  

  if (!email || !password) {
    return res.status(403).send("Email and or password can not be blank");
  }

  if (!user) {
    return res.status(403).send("No user with that email exists");
  }

  if (user && user.password === password) {
    res.cookie('user_id', user.id);
    res.redirect(`/urls/`);
  }


  return res.status(403).send("User found but incorrect password entered");


});

// Endpoint to handle a POST to /login
app.post("/logout", (req, res) => {
  //const user = users[req.cookies["user_id"]];//////////////////////////
  //res.clearCookie("email", users.email)
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

//Render register.ejs template
app.get("/login", (req, res) => {
  
  const templateVars = {email: users.email};
  
  console.log("Login ");
  
  res.render('login', templateVars);
});







//Render register.ejs template
app.get("/register", (req, res) => {
  //const user = users[req.cookies["user_id"]];//////////////////////
  const templateVars = {email: users.email};
  res.render(`register`, templateVars);
});

//Registration handler
app.post("/register", (req, res) => {
  
  const email = req.body["email"];
  const password = req.body["password"];
  //console.log(req.body)
 
  //making sure email or password is not blank
  if (!email || !password) {
    return res.status(400).send("Email or password can not be blank");
  }
  //check to see if user already exists
  const user = searchUsersByEmail(email);

  if (user) {
    return res.status(400).send("A user has already registed with that email");
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password,
  };

  //console.log(users)
  //sets cookie with loging
  res.cookie('user_id', id);
  res.redirect(`/urls`);
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


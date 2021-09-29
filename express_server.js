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

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) =>{
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
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
  const userName = req.body.username;
  res.cookie('username', userName);
  res.redirect(`/urls/`);
});

// Endpoint to handle a POST to /login
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
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
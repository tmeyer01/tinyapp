const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const { render } = require("ejs");
const { response } = require("express");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) =>{
  console.log(req.params);
  //console.log("=======> ", req)
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  
  res.redirect('/urls/' + shortURL);
  //res.status(200).send("Ok");         // Respond with 'Ok' (we will replace this)
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
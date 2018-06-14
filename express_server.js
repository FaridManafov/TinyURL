var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var randomstring = require("randomstring");
var cookieparser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieparser())

app.set("view engine", "ejs");  

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

// Hello!
app.get("/", (req, res) => {
  res.end("Hello!");
});

// registration form get
app.get('/register', (req, res) => {
  res.render("urls_registration")
})

//registration form post
app.post('/register', (req, res) => {
  randomID = randomstring.generate(6);

  if (req.body.email == "" || req.body.password == "" || users.hasOwnProperty(req.body.email)){
    res.status(400);
    res.send('Error 400 Bad Paramater')

  } else {
      newUser = {
      id: randomID, 
      email: req.body.email, 
      password: req.body.password
    }
    users[randomID] = newUser
    res.cookie("user_id", randomID)
    console.log(users)
    res.redirect("/urls")
  }
});

//
app.get("/urls", (req, res) => {
    let templateVars = {urls : urlDatabase}
    res.render('urls_index', templateVars)
})

// RNG saver
app.post("/urls", (req, res) => {
  // console.log(urlDatabase[random]);  // debug statement to see POST parameters
  randomShortUrl = randomstring.generate(6);
  urlDatabase[randomShortUrl] = req.body.longURL;
  console.log(urlDatabase);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  
});

//redirection
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// body parser

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//~~~~~~~~

// :id grabber of shortURL that displays short and long urls

app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)


});
//login
app.post("/login", (req, res) => {
  
  console.log(req.body.username)
  res.cookie("username", req.body.username)
  let templateVars = {
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
    urls : urlDatabase
  };
  res.render("urls_index", templateVars);

})

//logout

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

//update
app.post("/urls/:shortURL/update", (req, res) => {
  console.log(req.body)
  urlDatabase[req.params.shortURL] = req.body["updatedLink"]
  console.log(req.body["updatedLink"])
  res.redirect("/urls")
})
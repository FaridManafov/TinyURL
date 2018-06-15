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
  shortURLExample: {
    user_id: "userRandomID",
    longURL: "http://www.google.com"
  },

  shortURLExample2: {
    user_id: "user2RandomID",
    longURL: "http://www.google.com"
  },

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
    password: "dishwasher-funk",
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

  if (req.body.email == "" || req.body.password == "" || users.hasOwnProperty(req.body.email) === true){
    res.status(400);
    res.send('Error 400 Bad Paramater')

  } else {
      newUser = {
      id: randomID, 
      email: req.body.email, 
      password: req.body.password,
      urls: ""
    }
    users[randomID] = newUser
    res.cookie("user_id", randomID)
    res.redirect("/urls")
  }
});



//
app.get("/urls", (req, res) => {
    let templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
    res.render('urls_index', templateVars)
})



// New TinyUrl link poster saver
app.post("/urls", (req, res) => {
  // console.log(urlDatabase[random]);  // debug statement to see POST parameters
  if (req.cookies["user_id"]) {
    randomShortUrl = randomstring.generate(6);
    urlDatabase[randomShortUrl] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
  
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
  let templateVars = {
    shortURL: req.params.id, 
    user: users[req.cookies["user_id"]],
    longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)


});

//login page get
app.get("/login", (req, res) => {
  res.render("urls_login")
})

//login post
app.post("/login", (req, res) => {
  for (user_id in users){
    if(req.body.email === users[user_id].email){
      if(req.body.password === users[user_id].password){
        //return into /urls with the email and password
        res.cookie("user_id", users[user_id].id);
        res.redirect("/urls");
        return ;
      } else {
        res.status("403");
        res.render("403Error");
        return ;
      }
    } 
  }
  res.status("403");
  res.render("403Error");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].user_id === req.cookies.user_id) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls")
})

//update edit
app.post("/urls/:shortURL/update", (req, res) => {
  if (urlDatabase[req.params.shortURL].user_id === req.cookies.user_id) {
    urlDatabase[req.params.shortURL] = req.body["updatedLink"]
  }
  res.redirect("/urls")
})
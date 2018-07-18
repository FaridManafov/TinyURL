var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var randomstring = require("randomstring");
var cookiesession = require("cookie-session");
const bcrypt = require("bcrypt");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookiesession({
    name: "user_id",
    keys: ["urlDatabase"]
  })
);

app.set("view engine", "ejs");

const urlDatabase = {
  shortURLExample: {
    user_id: "userRandomID",
    longURL: "http://www.youtube.com"
  },
  shortURLExample2: {
    user_id: "user2RandomID",
    longURL: "http://www.google.com"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function urlsForUser(id) {
  pulledLoggedInUser = {};
  for (shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].user_id) {
      pulledLoggedInUser[shortURL] = {
        user_id: urlDatabase[shortURL].user_id,
        longURL: urlDatabase[shortURL].longURL
      };
    }
  }
  return pulledLoggedInUser;
}

// Hello!
app.get("/", (req, res) => {
  res.redirect('/urls')
});

// form get
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

//registration form post
app.post("/register", (req, res) => {
  randomID = randomstring.generate(6);
  hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let userExists = false;

  if (req.body.email === "" || req.body.password === "") {
    console.log(req.body.email);
    res.status(400);
    res.send("Error 400 Bad Paramater");
  } else {
    for (property in users) {
      //this is making a new user everytime you register since it sends a request on each user
      if (users[property].email === req.body.email) {
        userExists = true;
      }
    }

    if (userExists === true){
      console.log(users[property], "this is already existing");
      res.status(400);
      res.send("Error 400 User already exists");
    } else {
      newUser = {
        id: randomID,
        email: req.body.email,
        password: hashedPassword
      };
      console.log(newUser, "this is passed");
      users[randomID] = newUser;
      req.session.user_id = randomID;
      res.redirect("/urls");
    }
  }
  
});

//login templateVars
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// New TinyUrl link poster saver
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    randomShortUrl = randomstring.generate(6);
    urlDatabase[randomShortUrl] = {
      user_id: req.session.user_id,
      longURL: req.body.longURL
    };
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//redirection
app.get("/u/:shortURL", (req, res) => {
  let site = urlDatabase[req.params.shortURL].longURL;
  res.redirect(site);
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

// :id grabber of shortURL that displays short and long urls
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    user: users[req.session.user_id],
    longURL: urlDatabase[req.params.id].longURL
  };
  if (urlDatabase[req.params.id].user_id !== req.session.user_id) {
    res.status(400);
    res.send("You do not have permission to edit this URL");
  }
  res.render("urls_show", templateVars);
});

//login page get
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//login post
app.post("/login", (req, res) => {
  for (user_id in users) {
    if (req.body.email === users[user_id].email) {
      if (bcrypt.compareSync(req.body.password, users[user_id].password)) {
        //return into /urls with the email and password
        req.session.user_id = users[user_id].id;
        res.redirect("/urls");
        // return;
      } else {
        res.status("403");
        res.render("403Error");
        // return;
      }
    }
  }
  res.status("403");
  res.render("403Error");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
    console.log(urlDatabase[req.params.shortURL]);
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//update edit
app.post("/urls/:shortURL/update", (req, res) => {
  if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
    urlDatabase[req.params.shortURL].longURL = req.body["updatedLink"];
  }
  res.redirect("/urls");
});

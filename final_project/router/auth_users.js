const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  // check if the username is valid and returns boolean
  let usersWithSameName = users.filter( user => {return user.username == username});
  if (usersWithSameName.length > 0){
    return true;
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'your-secret-key', { expiresIn:  60 * 60});
  
      req.session.authorization = {
        accessToken,username
      }
      return res.status(200).send("User successfully logged in; Welcome! " + username);
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let review = req.query.review;
  let isbn = req.query.isbn
  let username = req.session.authorization.username;

  // no review is provided
  if (!review){
    return res.status(400).json({ message: "Review cannot be empty." });
  }

  // if isbn is not valid
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (books[isbn].reviews[username]){
    // update existing review
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully." });
  }else{
    // add review to books
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully." });
  }
});

// remove book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // remove key value pair
  delete books[isbn].reviews[username];
  res.status(200).send("User (" + username + ") review is successfully deleted. Current Reviews for Book#" + isbn + ":" + JSON.stringify(books[isbn].reviews));
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

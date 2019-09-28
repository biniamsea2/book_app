'use strict';

// ==== Dependancies =====//
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3001;
app.set('view engine', 'ejs');
app.use(express.static('public'));
require('ejs');

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));



// ======= MiddleWare =========//
app.use(express.urlencoded({extended: true}));


//==== app.listen =========//
app.listen(PORT, () => {console.log(`listening on ${PORT}`)});


//===== Routes =======//
app.get('/', showSaved)
//search will display home page.
app.get('/search', search)
//searches route displays search results.
app.post('/searches', searchForBook)
app.post('/books/:id', saveBook)


//catch for all un-specified route requests
// app.use('*', catchAll)







//===== Global Variables ======//
// const booksArr = [];


// ====== Constructor Function =======/

function Book(info){
  this.title = info.volumeInfo.title || 'Title not available'
  this.author = info.volumeInfo.authors || 'Author not available'
  this.summary = info.volumeInfo.description || 'No description provided'
  this.thumbnail=info.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
  this.book_id = info.id
}






// ===== Callback Functions for Routes ======//
function search(request, response){
  response.render('./pages/searches/new')
    .catch(error => {
      handleError(error, response)
    })
}

function searchForBook(request, response){
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  console.log(request.body.search)
  const searchingby = request.body.search[1];
  const searchingFor = request.body.search[0]
  if(searchingby === 'title'){
    const query = `intitle:${searchingFor}`
    url += query;
  }else if(searchingby==='author'){
    const query = `inauthor:${searchingFor}`
    url += query;
  }
  //testing api request
  console.log(url)
  //Now superagent uses the formatted url for api request
  superagent.get(url)
    .then(result => {
      console.log('got results')
      const bookResults = result.body.items;
      console.log('received ', bookResults.length, ' results')
      const formattedBooks = bookResults.splice(0, 10).map(banana => {

        const regex = /^(https)\S*/gi
        if (regex.test(banana.selfLink)) {
          let book = new Book(banana)
          return book
        }
      })
      // console.log('results include: ', formattedBooks)
      console.log('total results: ',formattedBooks.length)
      response.render('./pages/searches/show', {books:formattedBooks})
    }).catch(error => {
      handleError(error, response)
    })
}

function showSaved(request, response) {
  console.log('I am inside of ShowSaved')
  let sql = `SELECT * FROM books;`;
  //difference
  return client.query(sql).then(sqlResults => response.render('pages/index', {sqlKey:sqlResults.rows}))
    .catch(error => {
      handleError(error, response)
    })
}




//show detailed page for specified book id
function specificBook(request, response) {
  let sql = 'SELECT * FROM books WHERE book_id = $1;';
  console.log('the params is: ', request.params);
  let values = [request.params.id];

  return client.query(sql, values).then(result => {
    console.log('result is: ', result)
    let tempArr = [];
    tempArr.push(result.rows[0])
    console.log('tempArr is: ', tempArr)
    response.render('pages/detail', { sqlResults: tempArr })
  })
    .catch(error => {
      handleError(error, response)
    })
}

//save targetted book (from results) to database
function saveBook(request, response){
  const selectedBook = request.body
  const specificBookId = request.params.id;
  console.log('specificBookId is: ',specificBookId)
  // console.log(selectedBook.book_id)
  // console.log('Attempting to save book')
  console.log('things received: ',selectedBook)
  let sql='INSERT INTO books (author, title, book_id, image_url, summary) VALUES ($1, $2, $3, $4, $5);';
  let sqlArray = [selectedBook.author, selectedBook.title, specificBookId, selectedBook.thumbnail, selectedBook.summary]

  client.query(sql, sqlArray).then(sqlResults => {
    let sqlResponse = sqlResults.rows;
    response.render('pages/detail', {sqlResults:[selectedBook]});
  }).catch(error => {
    handleError(error, response)
  })
}




// ===== Handle Error Function ======//

function handleError(error, response){
  response.status(500).render('pages/error');
  console.error(error)
}

//==== Catch -All =====/
function catchAll(request, response) {
  console.log('inside search')

  response.render('./pages/error')
}

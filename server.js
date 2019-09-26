'use strict';

// ==== Dependancies =====//
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
require('dotenv').config();
require('ejs');
app.use(cors());
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;



const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));



// ======= MiddleWare =========//
app.use(express.static('/public'));
app.use(express.urlencoded({extended: true}));


//==== app.listen =========//
app.listen(PORT, () => {console.log(`listening on ${PORT}`)});


//===== Routes =======//
// need to create link to /search
app.get('/search', search)
app.get('/', showSaved)
app.post('/searches', searchForBook)
app.get('/books/:id', specificBook)




//catch for all un-specified route requests
app.get('*', catchAll)







//===== Global Variables ======//
// const booksArr = [];


// ====== Constructor Function =======/

function Book(info){
  this.title = info.volumeInfo.title;
  this.author = info.volumeInfo.authors[0];
  this.summary = info.volumeInfo.summary;
  this.thumbnail=info.volumeInfo.imageLinks.thumbnail;
  this.book_id = info.id
}






// ===== Callback Functions for Routes ======//
function search(request, response){
  response.render('./pages/searches/new')
}

function searchForBook(request, response){
  // console.log(request.body)
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  console.log(request.body.search)
  const searchingby = request.body.search[1];
  const searchingFor = request.body.search[0]
  if(searchingby === 'title'){
    const query = `+intitle:${searchingFor}`
    url= url+query;
  }else if(searchingby==='author'){
    const query = `+inauthor:${searchingFor}`
    url = url+query;
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
      console.error(error)
      response.redirect('*')
    })
}

function showSaved(request, response) {
  let sql = `SELECT * FROM books;`;
  client.query(sql)
    .then(sqlResults => {
      let sqlResponse = sqlResults.rows;
      response.render('./pages/index', {sqlKey:sqlResponse});
    })
}

//show detailed page for specified book id
function specificBook(request, response) {
  let sql = 'SELECT * FROM books WHERE book_id = $1;';
  console.log('the params is: ', request.params);
  let values = [request.params.book_id];

  return client.query(sql, values).then(result => {
    response.render('pages/searches/new', { books: result.rows[0] })
  })
    .catch(error => {
      handleError(error, response)
    })

}





// ===== Handle Error Function ======//

function handleError(error, response){
  response.render('pages/error');
  console.error(error)
}

//==== Catch -All =====/
function catchAll(request, response) {
  response.render('./pages/error')
}

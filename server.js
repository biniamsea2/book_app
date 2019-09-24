'use strict';

// ==== Dependancies =====//
const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
require('ejs');

const superagent = require('superagent');

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('./public'));

// ======= MiddleWare =========//
app.use(express.urlencoded({extended: true}));


//==== app.listen =========//
app.listen(PORT, () => {console.log(`listening on ${PORT}`)});


//===== Routes =======//
app.get('/', search)
app.post('/searches', searchForBook)







// ====== Constructor Function =======/

function Book(info){
  this.title = info.volumeInfo.title;
  this.author = info.volumeInfo.authors[0];
  this.description = info.volumeInfo.description;
}





// ===== Prototype ======



// ===== Callback Functions for Routes ======//
function search(request, response){
  response.render('../public/views/pages/index')
}

function searchForBook(request, response){
  // console.log(request.body)
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  const searchingFor = request.body.search[1]
  if(request.body.search[0] === 'title'){
    const query = `+intitle:${searchingFor}`
    url= url+query;
  }else{
    const query = `+inauthor:${searchingFor}`
    url = url+query;
  }

  //Now superagent uses the formatted url for api request
  superagent.get(url)
    .then(result => {
      console.log('got results')
      // console.log(result.body.items[0])
      const bookResults = result.body.items;
      const formattedBooks = bookResults.splice(0, 10).map(banana => {
        console.log('reduced to 10')
        console.log(bookResults)
        const regex = /^(https)\S*/gi
        if(regex.test(banana.selfLink)){
          return new Book(banana)
        }
      })
      response.send(formattedBooks)
    })
}

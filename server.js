'use strict';

const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

require('ejs');
app.set('view engine', 'ejs');


app.use(cors());
app.use(express.static('./public'));

app.listen(PORT, () => {console.log(`listening on ${PORT}`)});


app.get('/', (request, response) => {
  response.render('../public/views/pages/index');
})

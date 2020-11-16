// server/index.js => 백엔드 시작점

const express = require('express');
const app = express();


//몽고 DB 연결하기
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://boram:abcd1234@boilerplate.zldcz.mongodb.net/<dbname>?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));


//포트 연결
const port = 4000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));


//route
app.get('/', (req, res) => res.send('Hello World!'));
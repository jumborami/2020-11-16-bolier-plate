// server/index.js => 백엔드 시작점

const express = require('express');
const app = express();
//const bodyParser = require('body-parser'); // body데이터를 분석(parse)해서 req.body로 출력해준다 => deprecated 인 듯?
const { User } = require('./models/User'); // 유저모델 가져오기
const config = require('./config/key'); //key.js 내용 저장 (mongoose.connect를 위한 mongoURI 정보)


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//몽고 DB 연결하기
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));


//포트 연결
const port = 4000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));


//route
app.get('/', (req, res) => res.send('Hello World!'));
app.post('/register', (req, res) => {
	//회원 가입할 때 필요한 정보들을 clinet에서 가져오면
	//그것들을 데이터베이스에 넣어준다
	const user = new User(req.body);
	user.save((err, userInfo) => { //save()는 몽고디비의 메서드 / req.body정보를 user모델에 저장
		if(err) return res.json({ success: false, err}); //에러가 나면 제이슨형식으로 돌려줄 내용
		return res.status(200).json({ success: true }); //성공하면 돌려줄 내용
	}); 
})
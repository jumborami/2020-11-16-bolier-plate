// server/index.js => 백엔드 시작점

const express = require('express');
const app = express();
//const bodyParser = require('body-parser'); // body데이터를 분석(parse)해서 req.body로 출력해준다 => deprecated 인 듯?
const config = require('./config/key');      //key.js 내용 저장 (mongoose.connect를 위한 mongoURI 정보)
const cookieParser = require('cookie-parser'); // 토큰을 쿠키에 저장하기 위한 cookie-parser
const { User } = require('./models/User');     // 유저모델 가져오기
const { auth } = require('./middleware/auth'); // auth 미들웨어 가져오기

const cors = require('cors');
let cors_origin = [`http://localhost:3000`];
app.use(
	cors({
		origin: cors_origin,
		credentials: true
	})
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); //cookieParser 사용 가능

//몽고 DB 연결하기
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));


//포트 연결
const port = 4000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));



//route
//루트
app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/hello', (req, res) => {
	res.send("안녕하세요")
})

//레지스터
app.post('/api/users/register', (req, res) => {
	//회원 가입할 때 필요한 정보들을 clinet에서 가져오면
	//그것들을 데이터베이스에 넣어준다
	const user = new User(req.body);

	//저장하기 전에 비밀번호를 암호화해서 저장하는 것이 필요 (User.js)
	user.save((err, userInfo) => { //save()는 몽고디비의 메서드 / req.body정보를 user모델에 저장
		if(err) return res.json({ success: false, err}); //에러가 나면 제이슨형식으로 돌려줄 내용
		return res.status(200).json({ success: true }); //성공하면 돌려줄 내용
	}); 
});

//로그인
app.post('/api/users/login', (req, res) => {

	//요청받은 이메일을 디비에서 찾는다 / findOne()은 몽고디비에서 제공하는 메서드
	User.findOne({ email: req.body.email }, (err, user) => {
		if(!user) { //메일이 없다면
			return res.json({
				loginSuccess: false,
				message: "없는 이메일입니다."
			});
		};

		//메일이 디비에 있다면, 요청받은 비번과 디비의 비번이 맞는지 확인한다 (User.js에 작성한 comparePassword 메서드 사용)
		user.comparePassword(req.body.password, (err, isMatch) => { //isMatch => 비번이 맞다면 들어올 정보
			if(!isMatch)
				return res.json({ loginSuccess: false, message: "비밀번호가 다릅니다."});
			
			//비번이 맞다면 토큰을 생성한다 (User.js에 작성한 generateToken 메서드 사용)
			user.generateToken((err, user) => {
				if(err) return res.status(400).send(err);

				// user에 저장해서 받아온 토큰을 어디에 저장할까? - 쿠키, 로컬스토리지, 세션 다 가능
				res.cookie('x_auth', user.token) //개발창의 application의 cookies 에 x_auth 라는 이름으로 토큰이 저장된다(client 측)
				.status(200) //성공했다는 의미
				.json({ loginSuccess: true, userID: user._id }); //성공하면 띄울 내용
			});
		});
	});
});

//인증 (auth.js, User.js)
app.get('/api/users/auth', auth, (req, res) => { //auth 미들웨어를 거쳐서 가게 할 것임 (auth.js)

	//여기까지 미들웨어를 통과해왔다는 얘기는 authentication이 true라는 말
	res.status(200).json({ //디비에 있는 것 중 필요한 정보만 클라이언트에게 전달하면 됨
		_id: req.user._id,
		isAdmin: req.user.role === 0 ? false : true,
		isAuth: true,
		email: req.user.email,
		name: req.user.name,
		lastname: req.user.lastname,
		role: req.user.role,
		image: req.user.image
	});
});

//로그아웃
app.get('/api/users/logout', auth, (req, res) => {
	//findOneAndUpate() => 찾아서 데이터를 업데이트 시키는 메서드?
	User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
		//auth를 통해 가져온 req.user._id를 찾고, 그 토큰을 지워준다
		if(err) return res.json({ success: false, err });
		return res.status(200).send({ success: true });
	});
});
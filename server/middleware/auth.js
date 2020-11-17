// 인증 처리를 하는 곳

const { User } = require('../models/User');

let auth = (req, res, next) => {

	// 클라이언트 쿠키에서 토큰을 가져온다
	let token = req.cookies.x_auth;

	console.log(token);

	// 가져온 토큰을 복호화한 후 디비에서 유저를 찾는다 (User.js에 작성한 findByToken 스태틱 사용)
	User.findByToken(token, (err, user) => {
		if(err) throw err
		if(!user) return res.json({ isAuth: false, error: true });
		req.token = token; //req에 토큰과 유저를 넣어서 auth 미들웨어를 지나고 콜백에서 이 req를 사용할 수 있게 한다
		req.user = user;
		next();
	});
};


module.exports = { auth };
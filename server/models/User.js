//몽구스를 이용해서 유저스키마 생성하기

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	name: {
		type: String,
		maxlength: 50
	},
	email: {
		type: String,
		trim: true, //빈칸 없애줌
		unique: 1
	},
	password: {
		type: String,
		minlength: 5
	},
	lastname: {
		type: String,
		maxlength: 50
	},
	role: {
		type: Number,
		default: 0
	},
	image: String,
	//유효성 관리를 할 수 있는 토큰
	token: {
		type: String
	},
	//토큰 유효 기간
	tokenExp: {
		type: Number
	}
});


// 스키마는 모델로 감싸준다
const User = mongoose.model('User', userSchema); //모델의 이름, 스키마

module.exports = { User };
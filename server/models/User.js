//몽구스를 이용해서 유저스키마 생성하기

const mongoose = require('mongoose'); //mongo DB 를 편하게 사용하기 위해 mongoose 가져오기
const bcrypt = require('bcrypt');     //비밀번호 암호화를 위해 bcrypt 가져오기
const saltRounds = 10;                //bcrypt -> 10자리인 salt
const jwt = require('jsonwebtoken');  //토큰 생성을 위해 jsonwebtoken 가져오기

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


//유저 정보 저장하기 전에 비밀번호 암호화하기 ( bcrypt 이용 )
//mongoose의 메서드 => pre()
userSchema.pre('save', function( next ){ //저장하기 전에 펑션을 줘서 뭔가를 하게 한 후, next를 통해 save로 보냄
	
	//선언한 변수 user에 유저스키마 정보가 담긴다
	var user = this; 
	
	//password 가 변경될 때만 암호화한다
	if(user.isModified('password')) {
		bcrypt.genSalt(saltRounds, function(err, salt) {
			if(err) return next(err); //err가 났다면 넥스트 해서 save로 가서 에러 출력
			bcrypt.hash(user.password/*암호화안된 패스워드*/, salt, function(err, hash) { //hash에 암호화된 비번이 들어온다
				if(err) return next(err);
				user.password = hash; //암호화안된 plain password 를 암호화된 비번인 hash 로 바꿔준다
				next();
			});
		});
	} else { //비밀번호를 변경하지 않은 경우. next()를 해주어야 머물지 않고 save로 넘어간다
			next();
	}
});


//로그인 시 사용할 메서드 (비번 일치 여부 확인 (bcrypt 사용))
userSchema.methods.comparePassword = function(plainPassword, cb) {

	//그냥 비번(plainPassword)와 암호화된 비번 비교 => 그냥 비번을 암호화해서 확인해야 한다
	bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
		if(err) return cb(err); //에러가 난다면 콜백에 에러 리턴
		cb(null, isMatch);      //일치하다면 콜백을 주는데 에러없고(널) isMatch(true?)
	});
};


//로그인 시 사용할 메서드 (비번 일치 확인 후 토큰 생성 (jsonwebtoken 사용))
userSchema.methods.generateToken = function(cb) {
	var user = this;

	//user._id + 'secretToken' = token 생성
	var token = jwt.sign(user._id.toHexString(), 'secretToken'); //_id는 디비에 들어오는 _id이다
	user.token = token; //user의 token에 생성된 token을 넣는다
	user.save(function(err, user) {
		if(err) return cb(err); //에러가 있다면 콜백으로 에러 전달
		cb(null, user);         //유저에 저장이 잘 됐다면 에러는 없고(널) user정보 전달
	});
};


// 스키마는 모델로 감싸준다
const User = mongoose.model('User', userSchema); //모델의 이름, 스키마


// 내보내기
module.exports = { User };
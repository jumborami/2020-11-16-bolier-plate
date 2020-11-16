//비밀 정보 관리
//환경변수 process.env.NODE_ENV
// 로컬 환경에서 개발 중 => development
// 배포(deploy) 후 => production (heroku사용)

if(process.env.NODE_ENV === 'production') { //production이라면
	module.exports = require('./prod'); //prod.js에서 익스포트
} else {
	module.exports = require('./dev');
}


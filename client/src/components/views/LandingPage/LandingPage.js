import React, { useEffect } from 'react'
import axios from 'axios';

function LandingPage(props) {

	useEffect(() => { //landing page 들어오자마자 실행.
		axios.get('http://localhost:4000/api/hello') //서버에 get 요청 보냄
		.then(response => console.log(response.data)) //서버에서 받은 응답 콘솔에 표시
	}, [])

	const onClickHandler =() => {
		axios.get(`http://localhost:4000/api/users/logout`)
		.then(response => {
			if(response.data.success) {
				props.history.push("/login")
			} else {
				alert('로그아웃 실패')
			}
		})
	}

	return (
		<div style={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100vh'}}>
			<h2>시작 페이지</h2>	

			<button onClick={onClickHandler}>
				로그아웃
			</button>
		</div>
	)
}

export default LandingPage

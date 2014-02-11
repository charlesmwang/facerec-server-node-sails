
module.exports = {

	status:{
		UnknownError:{
			code:300, 
			message:{
				status:'Unknown Error.'
			}
		},

		LoginError:{
			code:400, 
			message:{
				status:'Invalid Username or Password.'
			}
		},

		LoginSuccess:{
			code:300,
			message:{
				status:"Successfully Logged In."
			}
		},

		SignUpSuccess:{
			code:400,
			message:{
				status:'Successfully Signed Up.'
			}
		},

		SignUpError:{
			code:400,
			message:{
				status:'Failed to Sign Up.'
			},
			username:{
				message:'Username is already taken.',
			},
			email:{
				message:'Email is already taken.'
			}
		}
	}

};

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
			code:200,
			message:{
				status:"Successfully Logged In."
			}
		},
		
		LoginDuplicate:{
			code:200,
			message:{
				status:"User is already logged in."
			}
		},
		
		LogoutSuccess:{
			code:200,
			message:{
				status:"Successfully logged out."
			}
		},
		
		LogoutFailed01:{
			code:513,
			message:{
				status:"Failed to logout."
			}
		},
		
		LogoutFailed02:{
			code:421,
			message:{
				status:"Not logged in."
			}
		},

		SignUpSuccess:{
			code:201,
			message:{
				status:'Successfully Signed Up.'
			}
		},

		SignUpError:{
			code:512,
			message:{
				status:'Failed to Sign Up.'
			},
			username:{
				message:'Username is already taken.',
			},
			email:{
				message:'Email is already taken.'
			}
		},
		
		RegisterPersonSuccess:{
			code:201,
			message:{
				status:'Successfully created person.'
			}
		},
		
		PersonAlreadyExist:{
			code:200,
			message:{
				status:'This person already exist in your people list.'
			}
		},
		
		FaceAddedSuccess:{
			code:201,
			message:{
				status:'Face has been added successfully!'
			}
		},
		
		PersonDoesNotExist:{
			code:514,
			message:{
				status:'This person does not exist in your people list.'
			}
		},
		
		UserDoesNotExist:{
			code:515,
			message:{
				status:'User does not exist with this username.'
			}
		},
		
		CannotFindSessionOrToken:{
			code:516,
			message:{
				status:'Cannot find session id or token.'
			}
		},
		
		NotAuthorized:{
			code:517,
			message:{
				status:"Cannot authorize",
			}
		}
	}

};
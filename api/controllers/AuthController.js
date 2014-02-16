/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var status = require('../services/StatusCode').status;

module.exports = {

	/*This method login users and store the session variables to the database.
	**If the client does not have a session, it uses the username and current time as a token.
	*/
	login:function(req,res){
		console.log("SERVER LOG: login access");
		username = req.body.username;
		password = req.body.password;
		//Check if the username and password is not null
		if(username && password)
		{
			console.log("SERVER LOG: Parameters Found");
			//lower case the username value
			username = username.toLowerCase();
			
			//Perform Validation
			User.findOneByUsername(username)
			.done(function(err, user){
				if(err)
				{	
					console.log("SERVER LOG: Unknown Error: User was not found?");
					return res.json(status.UnknownError.message, status.UnknownError.code);
				}
				if(!user)
				{
					console.log("SERVER LOG: Login Error: User was not found?");
					return res.json(status.LoginError.message, status.LoginError.code);
				}
				
				console.log("SERVER LOG: Storing Session");
				//Check Session and store it
				var aToken;
				if(req.session.id)
				{
					console.log("SERVER LOG: Using Session Token");
					aToken = req.session.id
				}
				else
				{
					//If session does not exist, look for token in request body				
					if(req.body.token)
					{
						console.log("SERVER LOG: Finding token in the json");
						aToken = req.body.token;
					}
					else
						res.send('Missing Token');//TODO Add something here
				}
				console.log(aToken);
				//Search for token in the database
				console.log("SERVER LOG: Checking token in the database to check whether the user is already logged in");
				AccessToken.findOne({token:aToken})
				.done(function(err, access_token){				
					//If it does not exist, validate the user
					if(err || !access_token){
						console.log("SERVER LOG: Token not found, validate the user");
						return validate(req, res, user, password);
					}
					else{
						console.log("SERVER LOG: Token existed, make the token expiration longer");
						//If it exists, check the expiration and delete the AccessToken
						var now = new Date();
						var expiration = new Date(access_token.expiration);
						if(now > expiration)
						{
							access_token.destroy(function(err){
								if(!err){
									//If no error proceed relogin and add new expiration
									console.log("SERVER LOG: Recreating Token");
									return validate(req, res, user, password);

								}
								else
								{
									return res.json(status.UnknownError.message, status.UnknownError.code);
								}
							});
						}
						else
						{
							//If not expired, finish
							console.log("SERVER LOG: Login Duplicate");
							return res.json(status.LoginDuplicate.message, status.LoginDuplicate.code);
						}
					}
				});
				//
				

			});
		}
		else
			return res.json(status.UnknownError.message, status.UnknownError.code);
	},

	logout:function(req,res){
		//Check if the user has session
		console.log("SERVER LOG: access logout");
		if(req.session.id || req.body.session)
		{
			console.log("SERVER LOG: Checking Token");
			//Take whichever session as access token
			var atoken;
			if(req.session.id)
				atoken = req.session.id;
			else			
				atoken = req.body.session;
			
			//Check if the access token exists
			AccessToken.findOneByToken(atoken)
			.done(function(err, token){
				if(err)
				{
					console.log("SERVER LOG: Unknown Error " + err);
					return res.json(status.UnknownError.message, status.UnknownError.code);
				}
				else
				{
					if(token)
					{
						//Delete the access token from the Database
						console.log("SERVER LOG: Token Found and Destroying it");
						token.destroy(function(err){
							if(err)
							{
								console.log("SERVER LOG: Unknown Error " + err);
								return res.json(status.UnknownError.message, status.UnknownError.code);
							}
							else
							{
								console.log("SERVER LOG: Successfully Logged Out");
								return res.json(status.LogoutSuccess.message, status.LogoutSuccess.code);
							}
						});	
					}
					else
					{
						console.log("SERVER LOG: Cannot Logged Out because user is not logged in");
						return res.json(status.LogoutFailed02.message, status.LogoutFailed02.code);
					}
				}
			})
			
		}
	},
	
	signup:function(req,res){
		console.log("SERVER LOG: signup access");
		if(req.body.username && req.body.password && 
			req.body.firstname && req.body.lastname && req.body.email)
		{
			console.log("SERVER LOG: Creating User with username " + req.body.username);
			//Create a user with these fields
			User.create({
				username:  req.body.username,
				password:  req.body.password,
				firstname: req.body.firstname,
				lastname:  req.body.lastname,
				api_key:   'XXXXXXXXXXX',
				email:     req.body.email,
				group:     'admin',
			})
			.done(function(err, user){	
				if(err)
				{
					console.log("SERVER LOG: Signup Error Detected");
					console.log("SERVER LOG: Ending signup");
					console.log(err);
					return res.json(status.SignUpError.message, status.SignUpError.code);
				}
				if(!user)
				{
					console.log("SERVER LOG: Signup Error Detected");
					console.log("SERVER LOG: Ending singup");
					return res.json(status.SignUpError.message, status.SignUpError.code);
				}
				else
				{
					console.log("SERVER LOG: Signup Success Detected");
					console.log("SERVER LOG: Ending singup");
					return res.json(status.SignUpSuccess.message, status.SignUpSuccess.code); 
				}
			});			
		}
		else
		{
			console.log("SERVER LOG: Unknown Error Detected in signup");
			console.log("SERVER LOG: Ending singup");
			return res.json(status.UnknownError.message, status.UnknownError.code);
		}
	},
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}

  
};

//This is a helper function that validates the password
function validate(req, res, user, password)
{
	user.validatePassword(password, function(err, result){
		if(err) { return res.json(status.UnknownError.message, status.UnknownError.code); }
		if(result)
		{
			//Using UTC Time
			var date = new Date();
			var atoken = req.session.id;
			sessionExist = true;
			if(!atoken)
			{
				console.log('Session Not Found');
				atoken = new Buffer(user.username + date.toISOString()).toString('base64');
				sessionExist = false;
			}
			date.setHours(date.getHours()+3);
			//date.setSeconds(date.getSeconds()+5);
			AccessToken.create({
				UserId:user.id,
				expiration:date.toString(),
				token:atoken,
			})
			.done(function(err, token){
				if(err)
				{ 			
					return res.json(status.UnknownError.message, status.UnknownError.code); 
				}
				if(token)
				{
					//return res.json(status.LoginSuccess.message, status.LoginSuccess.code);
					return res.json({access_token:token.token}, status.LoginSuccess.code);
				}
				else
				{
					console.log('Help');
				}
			});
		}
		else
		{
			return res.json(status.LoginError.message, status.LoginError.code);
		}
	});
}

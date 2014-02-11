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
				
		username = req.body.username;
		password = req.body.password;
		//Check if the username and password is not null
		if(username && password)
		{
			//lower case the username value
			username = username.toLowerCase();
			
			//Perform Validation
			User.findOneByUsername(username)
			.done(function(err, user){
				if(err)
				{					
					return res.json(status.UnknownError.message, status.UnknownError.code);
				}
				if(!user)
				{
					return res.json(status.LoginError.message, status.LoginError.code);
				}
				
				//Check Session and store it
				var aToken;
				if(req.session.id)
				{
					aToken = req.session.id
				}
				else
				{
					//If session does not exist, look for token in request body				
					if(req.body.token)
						aToken = req.body.token;
					else
						res.send('Missing Token');
				}
				console.log(aToken);
				//Search for token in the database
				AccessToken.findOne({token:aToken})
				.done(function(err, access_token){				
					//If it does not exist, validate the user
					if(err || !access_token){
						return validate(req, res, user, password);
					}
					else{
						//If it exists, check the expiration and delete the AccessToken
						var now = new Date();
						var expiration = new Date(access_token.expiration);
						if(now > expiration)
						{
							access_token.destroy(function(err){
								if(!err){
									//If no error proceed relogin and add new expiration
									return validate(req, res, user, password);

								}
								else
								{
									return res.send('Unknown error');
								}
							});
						}
						else
						{
							//If not expired, finish
							return res.send('Still Logged In');
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
		if(req.session.id || req.body.session)
		{
			var atoken;
			if(req.session.id)
				atoken = req.session.id;
			else			
				atoken = req.body.session;
				
			AccessToken.findOneByToken(atoken)
			.done(function(err, token){
				if(err)
				{
					return res.send('Error');
				}
				else
				{
					if(token)
					{
						token.destroy(function(err){
							if(err)
								return res.send('Error');
							else
								return res.send('logout');
						});	
					}
					else
					{
						return res.send('Error 11');
					}
				}
			})
			
		}
	},
	
	signup:function(req,res){
		if(req.body.username && req.body.password && 
			req.body.firstname && req.body.lastname && req.body.email)
		{

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
					console.log(err);
					return res.json(status.SignUpError.message, status.SignUpError.code);
				}
				if(!user)
				{
					return res.json(status.SignUpError.message, status.SignUpError.code);
				}
				else 
				{
					return res.json(status.SignUpSuccess.message, status.SignUpSuccess.code);
				}
			});			
		}
		else{
			return res.json(status.UnknownError.message, status.UnknownError,code);
		}
	},
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}

  
};

function validate(req, res, user, password)
{
	user.validatePassword(password, function(err, result){
		if(err)
		{
			return res.json(status.UnknownError.message, status.UnknownError.code);
		}
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
					return res.json(status.LoginSuccess.message, status.LoginSuccess.code);
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

/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var status = require('../services/StatusCode').status;
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  /*if (req.session.authenticated) {
    return next();
  }*/
	  console.log("SERVER LOG: isAuthenticated.js");
	  if(req.body.username || req.param('username'))
	  {
		  console.log("SERVER LOG: Check username is supplied in the parameter.");
		  //Change the username to lowercase
		  var username;
		  if(req.body.username)
			  username = req.body.username.toLowerCase();
		  else
			  username = req.param('username').toLowerCase();
			  
		  console.log("SERVER LOG: Find user using the username supplied. " + "[" + username + "]");
		  //Search for user using username in the body
		  User.findOneByUsername(username)
		  .done(function(err, user){
			  //If no user exists, stop
			  if(err)
			  {
				  console.log("SERVER LOG: Unknown Error.")
				  return res.json(status.UnknownError.message, status.UnknownError.code);
			  }
			  if (!user)
			  {
				  console.log("SERVER LOG: User cannot be found.")
				  return res.json(status.UserDoesNotExist.message, status.UserDoesNotExist.code);
			  }
			  else
			  {
				  //Delete Expired Tokens if exist
				  console.log("SERVER LOG: Found user and check for expired token if exists.");
				  var now = new Date();				  
				  AccessToken.findByUserId(user.id)
				  .done(function(err, tokens){
					  if(err)
					  {
						  console.log("SERVER LOG: Unknown Error.");
						  return res.json(status.UnknownError.message, status.UnknownError.code);
					  }					  
					  if(tokens)
					  {
						  console.log("SERVER LOG: Token was found and deleting expired token.");
						  for(var i = 0; i < tokens.length; i++)
						  {							  
							  //Delete expired token
							  var exp = new Date(tokens[i].expiration);
							  if(now > exp)
							  {
								  tokens[i].destroy(function(err){
									  if(err)
									  {
										  console.log("SERVER LOG: Unknown Error.");
										  return res.json(status.UnknownError.message, status.UnknownError.code);
									  }
								  });	
							  }
						  }
					  }
				  });
				  console.log("SERVER LOG: Finding token from user.")
				  //Find if the user can proceed next
				  var aToken;
				  if(req.session.id)
				  	aToken = req.session.id;
				  else if(req.body.token)
					aToken = req.body.token;
				  else
				  {
					  return res.json(status.CannotFindSessionOrToken.message, status.CannotFindSessionOrToken.code);
				  }
				  console.log("SERVER LOG: Find same token if exist.")
				  AccessToken.findOneByToken(aToken)
				  .done(function(err, access_token){
					  if(err)
					  {
						  console.log("SERVER LOG: Unknown Error.");
						  return res.json(status.UnknownError.message, status.UnknownError.code);
					  }
					  if (!access_token)
					  {
						  console.log("SERVER LOG: Cannot find token in the database.")
						  return res.json(status.NotAuthorized.message, status.NotAuthorized.code);
					  }
					  var expiration = new Date(access_token.expiration);
					  console.log("SERVER LOG: Checking Expiration and current user");
					  if(access_token.UserId == user.id && now < expiration)
					  {
							  console.log("SERVER LOG: Valid user.");
							  return next();
					  }
					  else
					  {
						  console.log("SERVER LOG: Cannot Authorize this user.");
						  return res.json(status.NotAuthorized.message, status.NotAuthorized.code);
					  }
				  });
			  }
		  });
	  }
	  else
	  {
		  console.log("SERVER LOG: User cannot be found.")
		  return res.json(status.UserDoesNotExist.message, status.UserDoesNotExist.code);
	  }
	  
	  
  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
 // return res.forbidden('You are not permitted to perform this action.');
};

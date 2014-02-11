/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  /*if (req.session.authenticated) {
    return next();
  }*/
	  console.log('here');
	  if(req.body.username || req.param('username'))
	  {
		  console.log('here1');		  
		  //Change the username to lowercase
		  var username;
		  if(req.body.username)
			  username = req.body.username.toLowerCase();
		  else
			  username = req.param('username');
		  //Search for user using username in the body
		  User.findOneByUsername(username)
		  .done(function(err, user){
			  //If no user exists, stop
			  if(err || !user){
				  console.log('here2');
				  return res.forbidden('Invalid');
			  }
			  else{
				  //Delete Expired Tokens if exist
				  console.log('here3');
				  var now = new Date();
				  AccessToken.findByUserId(user.id)
				  .done(function(err, tokens){
					  console.log('here4');
					  if(tokens)
					  {
						  console.log('here5');
						  for(var i = 0; i < tokens.length; i++)
						  {
							  console.log('here6');
							  //Delete expired token
							  var exp = new Date(tokens[i].expiration);
							  if(now > exp)
							  {
								  console.log('here6.5');
								  tokens[i].destroy(function(err){
									  console.log('here7');
									  if(err){}
									  else{}
								  });	
							  }
						  }
					  }
				  });
				  console.log('here8');
				  //Find if the user can proceed next
				  var aToken;
				  if(req.session.id)
				  	aToken = req.session.id;
				  else if(req.body.token)
					aToken = req.body.token;
				  else
				    return res.forbidden('Error');
				console.log('here9');
				  AccessToken.findOneByToken(aToken)
				  .done(function(err, access_token){
							  console.log('here10');
					  if(err || !access_token)
					  {
							  console.log('here11');
						  return res.forbidden('Not Allowed');
					  }
					  var expiration = new Date(access_token.expiration);
					  console.log(access_token);
					  if(access_token.UserId == user.id && now < expiration)
					  {
							  console.log('here12');
							  return next();
					  }
					  else
					  {
						  console.log('here13');
						  return res.forbidden('Not Allowed');
					  }
				  });
			  }
		  });
	  }
	  else
	  {
		  return res.forbidden('No Username');
	  }
	  
	  
  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
 // return res.forbidden('You are not permitted to perform this action.');
};

module.exports = function(req, res, next) {
	if(req.body.username || req.param('username'))
	{
		console.log('here1');		  
		//Change the username to lowercase
		var username;
		if(req.body.username)
		  username = req.body.username.toLowerCase();
		else
		  username = req.param('username');
	  
		  var aToken;
		  if(req.session.id)
		  	aToken = req.session.id;
		  else if(req.body.token)
			aToken = req.body.token;
		  else
		    return res.forbidden('Error');
			User.findByUsername(username)
			.done(function(err, user){
				AccessToken.findOneByToken(aToken)
				.done(function(err, token){
				  if(err)
				  {
					  return res.forbidden('Invalid Token');
				  }
				  else
				  {
					  if(token.UserId == user.id || user.group === 'admin')
					  {
						  next();
					  }
					  else
					  {
						  return res.forbidden('Invalid Here');
					  }
				  }
				});	
			});
	}
	else
	{
	  res.forbidden('Invalid Username');
	}
};
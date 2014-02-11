/**
 * FaceController
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

var cv = require('opencv');

module.exports = {
    
	//add face to the database and perform training
	add:function(req,res){
		//First check the JSON includes the required fields
		if(req.body.username && req.body.image && req.body.imageformat
			&& req.body.email)
			{				
				username = req.body.username;
				email = req.body.email;
				User.findOneByUsername(username)
				.done(function(err, user){
					if(err || !user)
					{
						res.send('Error');
					}
					else
					{
						//If user was found proceed to the next step
						
					}
				});
			}
	},
	
	

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to FaceController)
   */
  _config: {}

  
};

function train()
{
	
}
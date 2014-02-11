/**
 * PersonController
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

module.exports = {
    
  
	register:function(req,res){
		
		if(req.body.firstname && req.body.lastname 
			&& req.body.email && req.body.username)
			{
				User.findOneByUsername(req.body.username.toLowerCase())
				.done(function(err, user){
					if(err || !user){
						return res.send('Error1');
					}
					Person.create({
						firstname:req.body.firstname,
						lastname:req.body.lastname,
						email:req.body.email,
						UserId:user.id
					})
					.done(function(err, person){
						if(err || !person){
							return res.send('Error2');
						}
						else
						{
							return res.send('Created Person');
						}
					});
				});
			}
		else{
			return res.send('Error3');
		}
	},
	
	update:function(req,res){
		
	},
	
	view:function(req,res){
		if(req.param('username'))
		{
			User.findOneByUsername(req.param('username'))
			.done(function(err, user){
				Person.find()
				.where({UserId:user.id})
				.done(function(err, people){
					if(err)
						return res.send('Error');
					else
						return res.json(people);
				});
			});
		}
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PersonController)
   */
  _config: {}

  
};

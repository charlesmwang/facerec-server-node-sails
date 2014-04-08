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

var status = require('../services/StatusCode').status;

module.exports = {
    
  
	register:function(req,res){
		console.log("SERVER LOG: register - person");
		if(req.body.firstname && req.body.lastname 
			&& req.body.email && req.body.username)
			{
				console.log("SERVER LOG: Finding user");
				User.findOneByUsername(req.body.username.toLowerCase())
				.done(function(err, user){
					if(err)
					{
						return res.json(status.UnknownError.message, status.UnknownError.code);
					}
					if(!user)
					{
						return res.json(status.UserDoesNotExist.message, status.UserDoesNotExist.code);
					}
					
					//Check if the user has this person created before
					Person.findOne({
						UserId:user.id,
						email:req.body.email.toLowerCase()
					})
					.done(function(err, person){
						if(err)
						{
							return res.json(status.UnknownError.message, status.UnknownError.code);
						}
						if(!person)
						{
							Person.create({
								firstname:req.body.firstname,
								lastname:req.body.lastname,
								email:req.body.email,
								UserId:user.id
							})
							.done(function(err, person){
								if(err)
								{
									return res.json(status.UnknownError.message, status.UnknownError.code);
								}
								if(!person)
								{
									return res.json(status.UnknownError.message, status.UnknownError.code);
								}
								else
								{
									if(req.body.facebook && req.body.facebook.length > 0)
									{
										Service.create({
											service:'Facebook',
											username:req.body.facebook,
											PersonId:person.id,
										})
										.done(function(err, service){
											if(err || !service)
											{
												return res.json(status.UnknownError.message, status.UnknownError.code);
											}
											else
											{
												return res.json(status.RegisterPersonSuccess.message, status.RegisterPersonSuccess.code);												
											}
										});
									}
									else
									{
										return res.json(status.RegisterPersonSuccess.message, status.RegisterPersonSuccess.code);										
									}
								}
							});
						}
						else
						{
							return res.json(status.PersonAlreadyExist.message, status.PersonAlreadyExist.code);
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
						return res.json(people,200);
				});
			});
		}
	},
	
	list:function(req,res){
		if(req.param('username'))
		{
			//Search for access token
			//AccessToken.findOneByToken()
			User.findOneByUsername(req.param('username').toLowerCase())
			.done(function(err, user){
				Person.find()
				.where({UserId:user.id})
				.done(function(err, people){
					if(err)
						return res.send('Error');
					else
					{
						//Filter some stuff
						for(i = 0; i < people.length; i++)
						{
							delete people[i].id;
							delete people[i].UserId;
							delete people[i].createdAt;
							delete people[i].updatedAt;
						}
						return res.json(people,200);
					}
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

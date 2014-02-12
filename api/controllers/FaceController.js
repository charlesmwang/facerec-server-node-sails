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

var cv = require('opencv'); //opencv bindings
var gm = require('gm'); //graphicsmagick
var fs = require('fs'); //File System
var crypto = require('crypto'); //Used for hashing filename

module.exports = {
    
	//add face to the database and perform training
	add:function(req,res){
		//First check the JSON includes the required fields
		if(req.body.username && req.body.image && req.body.imageformat
			&& req.body.email)
			{				
				username = req.body.username;
				User.findOneByUsername(username)
				.done(function(err, user){
					if(err || !user)
					{
						//If user does not exist
						res.send('Error');
					}
					else
					{
						//If user was found proceed to the next step
						email = req.body.email;
						//Checking if the email exist in the user's people database
						Person.findOne({
							'email':email,
							'UserId':user.id,
						})
						.done(function(err, person){
							if(err || !person)
							{
								//person does not exist
								res.send('Error');
							}
							else
							{
								//This funciton has a callback
								//This function hashes the filename, decode the base64 image, 
								//save the image to the public image directory,	convert and resize the image the pgm,
								//create a face object, and perform training
								addHelper(user, person, req.body.image, req.body.imageformat, function(err){
									if(err)
									{
										res.send('Error');										
									}
									else
									{
										res.send('Success');
									}
								});
							}
						});
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

function train(user, callback)
{
	err = null;
	//Initialize Empty Faces
	faces = [];
	//Check User Group
	if(user.group == admin)
	{
		Face.findAll()
		.done(function(err, faces){
			trainHelper(faces, function(error){
				if(error){
					err = 'bad';
					callback(err);
					return
				}				
			});	
		});
	}
	else
	{
		//TODO fix this
		//Find by friends.id, user.id, 
		Face.findByUserId(user.id)
		.done(function(err, faces){
			trainHelper(faces, function(error){
				if(error){
					err = 'bad';
					callback(err);
					return;
				}
			});
		});
	}
}

//Don't like the @ symbol included in the folder name
function emailToFolderName(m_email)
{
	return m_email.replace('@',"_at_").replace('.','_dot_');
}

//Add Function Helper
//Store Image to System
/*This function will create a face object, decode the base64 image, 
 *save the image, convert to pgm, and perform training.
*/
function addHelper(user, person, base64_image, imageformat, callback)
{
	err = null;
	//Hashing to a unique filename using time
	hashedFileName = hashFilename();
	//Make sure person's folder exist with name.
	personImageFolderPath = './public/images/' + emailToFolderName(person.email);
	//TODO If not create a folder & add config
	if(!fs.existsSync(personImageFolderPath))
	{
		fs.mkdir(personImageFolderPath);
	}
	imageFileNameWithoutExt = hashedFileName; //Improve naming
	imageFileLocation = personImageFolderPath + '/' + imageFileNameWithoutExt; //ImageFileLocation
	
	//Write the image file to the person's folder and decode the image using base64								
	fs.writeFile(imageFileNameWithoutExt + req.body.imageformat, req.body.image, 'base64', function(err){
		if(err)
		{
			return callback(err);
		}
		//TODO Use opencv to crop the face better and rotate
		
		//Convert the image to pgm, resize, and save
		//TODO the gm argument can change
		else
		{
			gm(imageFileNameWithoutExt + imageformat)
			.setFormat('pgm')
			.resize(92, 112, "!")
			.write(imageFileNameWithoutExt + 'pgm',function(err){
				//If error occured when writing the file stop
				if(err)
				{
					return callback(err);
				}
				else
				{
					Face.create({
						PersonId:person.id,
						UserId:user.id,
						pgm_path:imageFileNameWithoutExt + '.pgm',
						image_path:ImageFileNameWithoutExt + imageformat,
					})
					.done(function(err, face){
						if(err)
						{
							return callback(err);
						}
						else
						{
							train(user, function(err){
								if(err)
								{
									return callback(err);
								}
								else
								{
									return;
								}
							});
						}
					});
				}
			});
		}
	});
}

//Hashing Filename using date
function hashFilename()
{
	var date = new Date();
	var isoDate = date.toISOString();
	var shasum = crypto.createHash('sha1');
	return shasum.update(isoDate).digest('hex');
}


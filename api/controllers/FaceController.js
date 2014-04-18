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
var status = require('../services/StatusCode').status;

module.exports = {
    
	//add face to the database and perform training
	add:function(req,res){
		//First check the JSON includes the required fields
		console.log("SERVER LOG: Access /faces/add");
		if(req.body.username && req.body.image && req.body.imageformat
			&& req.body.email)
			{	
				console.log("SERVER LOG: Finding Username");
				username = req.body.username.toLowerCase();
				User.findOneByUsername(username)
				.done(function(err, user){
					if(err)
					{
						return res.json(status.UnknownError.message, status.UnknownError.code);
					}
					if(!user)
					{
						console.log("SERVER LOG: Cannot Find Username");
						//If user does not exist
						return res.json(status.UserDoesNotExist.message, status.UserDoesNotExist.code);
					}
					else
					{
						//If user was found proceed to the next step
						email = req.body.email.toLowerCase();
						console.log("SERVER LOG: Finding a Person");
						//Checking if the email exist in the user's people database
						Person.findOne({
							'email':email,
							'UserId':user.id,
						})
						.done(function(err, person){
							if(err || !person)
							{
								console.log("SERVER LOG: Cannot Find a person");
								//person does not exist
								res.json(status.PersonDoesNotExist.message, status.PersonDoesNotExist.code);
							}
							else
							{
								console.log("SERVER LOG: Perform Add Helper");
								//This funciton has a callback
								//This function hashes the filename, decode the base64 image, 
								//save the image to the public image directory,	convert and resize the image the pgm,
								//create a face object, and perform training
								addHelper(user, person, req.body.image, req.body.imageformat, function(err){
									if(err)
									{
										console.log("SERVER LOG: Found Error");
										res.send('Error');
									}
									else
									{
										console.log("SERVER LOG: Successfully Added and Trained");
										res.send(status.FaceAddedSuccess.message, status.FaceAddedSuccess.code);
									}
								});
							}
						});
					}
				});
			}
		else
		{
			console.log('SERVER LOG: Error Start');
			return res.send('Error');
		}
	},
	
	recognize:function(req,res){
		console.log("SERVER LOG: Access /faces/recognize");
		if(req.body.username && req.body.image && req.body.imageformat)
		{
			recognizeImplementation(req.body.username, req.body.image, req.body.imageformat, req.body.trackingID, function(err, data){
				if(err)
				{
					res.json(err.message, err.code);
				}
				else
				{
					res.json(data, 200);
				}
			});
		}
		else
		{
			res.json(status.UnknownError.message, status.UnknownError.code);
		}
	
	},
	
	//Socket.IO implementation
	test:function(req,socket){
		socket.on('fun', function(data){
			socket.emit('world', {name:"Makoto",message:"Yo my friend!"});
		});
		
		socket.on('recognize', function(data){
			if(data.username && data.image && data.imageformat)
			{
				console.log("TrackingID: " + data.trackingID);
				recognizeImplementation(data.username, data.image, data.imageformat, data.trackingID, function(err, identity, image){
									
					if(err)
					{
						//console.log(err);
						//identity can contain trackingID
						//console.log(identity);
						socket.emit('RecError', identity);						
					}					
					else
					{
						socket.emit('identified', identity);
					}
					if(image && image.path && image.format)
					{
											
						setTimeout(function(){
							var originalImage = image.path + image.format;
							var pgmImage = image.path + ".pgm";							
							//console.log(originalImage);
							//console.log(pgmImage);
							fs.unlink(originalImage.toString(), function(){});
							fs.unlink(pgmImage.toString(), function(){});
						}, 500);
					}					

				});	
			}
			else
			{
				socket.emit('RecognitionError', status.UnknownError);
			}
		});
	},


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to FaceController)
   */
  _config: {}

  
};

function recognizeImplementation(username, image, imageformat, trackingID, callback){
	console.log("SERVER LOG: Finding User");
	username = username.toLowerCase();
	User.findOneByUsername(username)
	.done(function(err, user){
		if(err)
		{
			console.log("SERVER LOG: Error occurred");
			return callback(status.UnknownError, null);
		}
		else if(!user)
		{
			console.log("SERVER LOG: Cannot find user");
			return callback(status.UserDoesNotExist, null);
		}
		else
		{
			//TODO pass in already converted image
			//Decode base64 image, do a for loop for number of faces, etc.
			//
			
			//Save that image
			//TODO use config
			console.log("SERVER LOG: Check tmp path exist");
			tmpPath = './.tmp/';
			if(!fs.existsSync(tmpPath))
			{
				fs.mkdirSync(tmpPath);
			}
			
			//TODO Perform further cropping
			//This methid only works for single face only
			//for(int i = 0; i < # of faces; i++)
			//{
				console.log("SERVER LOG: Hash filename");
				var imageFileLocation = tmpPath + hashFilename();
				console.log("SERVER LOG: Saving Image");							
				fs.writeFile(imageFileLocation + imageformat, image, 'base64', function(err){
					console.log("SERVER LOG: Go to recognizeHelper.");
					recognizeHelper(user, imageFileLocation, imageformat, function(err, person){
						
						//Used for deletion (cleanup)
						var image = {};
						image["path"] = imageFileLocation;
						image["format"] = imageformat;
												
						console.log(person);
						if(person)
						{
							Service.find({PersonId:person.id})
							.done(function(err, services){																					
								if(err && !services)
								{
									return callback(err, null, image);
								}
								else
								{
									if(trackingID)
									{
										console.log("This has a trackingID");
										if(services.length == 0)
										{
											var json_obj = {};
											json_obj["name"] = person.fullname();
											json_obj["firstname"] = person.firstname;
											json_obj["lastname"] = person.lastname;
											json_obj["email"] = person.email;
											json_obj["trackingID"] = trackingID;
											console.log("-----");
											console.log((json_obj))
											console.log("-----");
											
											var image = {};
											image["path"] = imageFileLocation;
											image["format"] = imageformat;
											
											return callback(err, json_obj, image);
										}

										else
										{
											var json_obj = {};
											json_obj["name"] = person.fullname();
											json_obj["firstname"] = person.firstname;
											json_obj["lastname"] = person.lastname;
											json_obj["email"] = person.email;
											json_obj["trackingID"] = trackingID;										
											for(var i = 0; i < services.length; i++)
											{
												json_obj[services[i].service] = services[i].username;											
											}
											console.log("-----");
											console.log((json_obj))
											console.log("-----");
											return callback(err, json_obj, image);
										
										}
									}
									else
									{
										if(services.length == 0)
											return callback(err, {name:person.fullname()}, image);
										else
										{
											var json_obj = {};
											json_obj["name"] = person.fullname();
											json_obj["firstname"] = person.firstname;
											json_obj["lastname"] = person.lastname;											
											json_obj["email"] = person.email;											
											for(var i = 0; i < services.length; i++)
											{
												json_obj[services[i].service] = services[i].username;												
											}									
											return callback(err, json_obj, image);
										}
									}
								}
							});
						}
						else
						{
							if(trackingID)
							{
								var json_obj = {};
								var err = status.UserDoesNotExist;
								json_obj['trackingID'] = trackingID;
								return callback(err, json_obj, image);
							}
							else
							{
								var err = status.UserDoesNotExist;
								return callback(err, null, image);
							}
						}
												
					});
				});
			//}

			
		}
	});
	
}

//Initialize FaceRecognizer variables
lbphFaceRecognizer = cv.FaceRecognizer.createLBPHFaceRecognizer(1,8,8,8,75);

//Predict
function predict(user, pgm_image, callback)
{
	//Find the most recent one
	//TODO check this
	TrainingData.find({UserId:user.id})
	.done(function(err, datum){
		if(err) { return callback(err, null); }
		else
		{
			if(datum.length > 0){
				trainingData = datum[datum.length - 1];

				lbphFaceRecognizer.loadSync(trainingData.LBPHFace_path);
				
				cv.readImage(pgm_image, function(err, im){
					if(err) { return callback(err, null); }
					lbphR = lbphFaceRecognizer.predictSync(im).id;					

					Person.findOneById(lbphR)
					.done(function(err, lperson){

						if(lperson)
						{
							console.log("Crashed 1");
							callback(err, lperson);
						}
						else
						{
							console.log("Crashed 2");							
							err = status.UserDoesNotExist;
							callback(err, null);
						}
					});
				});
			}
			else{
				return callback(err, null);
			}
		}
	});
		
}

function recognizeHelper(user, image, imageformat, callback)
{
	console.log("SERVER LOG: Inside recognize helper");
	err = null;
	console.log("SERVER LOG: Converting to PGM");
	convertToPGM(image, imageformat, function(err){
		if(err)
		{
			console.log("SERVER LOG: Error in converting");
			return callback(err, null);
		}
		else
		{
			console.log("SERVER LOG: Entering Predict");
			predict(user, image + '.pgm', function(err, name){
				
				if(err)
				{
					callback(err, null);
				}
				else
				{
					callback(err, name);
				}
												
			});
		}
	});
}

//Training Implementation
function trainHelper(faces, user, callback)
{	
	console.log("SERVER LOG: Inside trainHelper");
	var trainingData = [];
	console.log("SERVER LOG: Looping through Faces and Loading to Vector");
	for(i = 0; i < faces.length; i++){
		//TODO Fix this later
		if(!fs.existsSync(faces[i].pgm_path))
		{
			//TODO REMOVE THIS FACE
			console.log("Weird: " + faces[i].pgm_path);
		}
		else
		{
			trainingData.push([parseInt(faces[i].PersonId), faces[i].pgm_path]);
		}
	}

	var date = new Date();
	var n = date.toISOString();
	
	console.log("SERVER LOG: Creating Directory if not exist");
	faceDataDirectory = './trainingdata/' + user.username + '/';
	if(!fs.existsSync(faceDataDirectory))
	{
		fs.mkdir(faceDataDirectory);
	}

	console.log("SERVER LOG: Creating lbphface training data.");
	shasum = crypto.createHash('sha1');	
	hash_fname_lb = shasum.update(n+'_l').digest('hex') + '.xml';
    lbphFaceRecognizer.trainSync(trainingData);
    lbphFaceRecognizer.saveSync(faceDataDirectory + hash_fname_lb);
	//console.log(hash_fname_lb);
	
	//console.log("SERVER LOG: Creating Eigenface training data.");
	var shasum = crypto.createHash('sha1');
	hash_fname_ei = shasum.update(n+'_e').digest('hex') + '.xml';
    //eigenFaceRecognizer.trainSync(trainingData);
    //eigenFaceRecognizer.saveSync(faceDataDirectory + hash_fname_ei);


	//console.log("SERVER LOG: Creating Fisherface training data.");
	shasum = crypto.createHash('sha1');
	hash_fname_fi = shasum.update(n+'_f').digest('hex') + '.xml';
    //fisherFaceRecognizer.trainSync(trainingData);
    //fisherFaceRecognizer.saveSync(faceDataDirectory + hash_fname_fi);
	
	console.log("SERVER LOG: Training Data created.");
	TrainingData.create({
		EigenFace_path : faceDataDirectory + hash_fname_ei,
		FisherFace_path: faceDataDirectory + hash_fname_fi,
		LBPHFace_path  : faceDataDirectory + hash_fname_lb,
		UserId:user.id
	})
	.done(function(err, trainingdata){
		console.log("SERVER LOG: in here.");
		return callback(err);
	});
}

function train(user, callback)
{
	console.log("SERVER LOG: Inside Training");
	err = null;
	//Initialize Empty Faces
	var faces = [];
	console.log("SERVER LOG: Checking user group");	
	//Check User Group	
	if(user.group === 'admin')
	{
		console.log("SERVER LOG: Finding All Faces");
		Face.find()
		.sort('PersonId')
		.done(function(err, faces){
			if(err)
			{
				console.log("SERVER LOG: Error in finding faces");
				return callback(err);
			}
			else
			{
				console.log("SERVER LOG: Finished Finding");	
				console.log(faces.length);
				console.log(faces[0].PersonId + " " + faces[faces.length-1].PersonId)
				//TODO Check if the number of face images are greater than 2 and each person has an image.				
				if(faces.length > 1 && faces[0].PersonId != faces[faces.length-1].PersonId)
				{
					trainHelper(faces, user, function(err){
						console.log("SERVER LOG: Return in train");
						if(err)
						{
							console.log("SERVER LOG: Error in trainHelper");
							return callback(err);
						}
						else
						{
							//This means success.
							console.log("SERVER LOG: Sending null callback");
							return callback(null);
						}
					});						
				}
				else
				{
					console.log("SERVER LOG: Error in trainHelper - Not enough faces");
					var err = "Not Enough Faces";
					return callback(err);
				}
				
			}
			
		});
	}
	else
	{
		//TODO fix this
		//Find by friends.id, user.id, 
		Face.findByUserId(user.id)
		.done(function(err, user, faces){
			trainHelper(faces, function(error){
				if(error){
					var err = 'bad';
					return callback(err);
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
	console.log("SERVER LOG: Hashing Filename");
	err = null;
	//Hashing to a unique filename using time
	hashedFileName = hashFilename();
	//Make sure person's folder exist with name.
	personImageFolderPath = './assets/images/' + emailToFolderName(person.email);
	
	console.log("SERVER LOG: Checking Person's Path");
	//TODO If not create a folder & add config
	if(!fs.existsSync(personImageFolderPath))
	{
		fs.mkdir(personImageFolderPath);
	}
	imageFileNameWithoutExt = hashedFileName; //Improve naming
	imageFileLocation = personImageFolderPath + '/' + imageFileNameWithoutExt; //ImageFileLocation
	
	console.log("SERVER LOG: Writing File to " + imageFileLocation);
	//Write the image file to the person's folder and decode the image using base64								
	fs.writeFile(imageFileLocation + imageformat, base64_image, 'base64', function(err){
		if(err)
		{
			console.log("SERVER LOG: Error in writing file!");
			return callback(err); 
		}
		else
		{
			console.log("SERVER LOG: Convert PGM");
			//TODO the gm argument can change
			//TODO Use opencv to crop the face better and rotate
			//Convert the image to pgm, resize, and save
			convertToPGM(imageFileLocation, imageformat, function(err){
				if(err)
				{
					console.log("SERVER LOG: Error found in convertToPGM");
					return callback(err);
				}
				else
				{
					console.log("SERVER LOG: Creating Face");
					Face.create({
						PersonId:person.id,
						UserId:user.id,
						pgm_path:imageFileLocation + '.pgm',
						image_path:'/images/'+imageFileNameWithoutExt + imageformat,
					})
					.done(function(err, face){
						if(err)
						{
							console.log("SERVER LOG: Error in Creating Face");
							return callback(err);
						}
						else
						{
							train(user, function(err){
								if(err)
								{
									console.log("SERVER LOG: Error in Training");
									return callback(err);
								}
								else
								{
									console.log("SERVER LOG: Success in Training");
									return callback(null);
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

//Convert image to pgm
function convertToPGM(imagepath, imageformat, callback)
{
	console.log("SERVER LOG: Inside convertToPGM");
	err = null;
	console.log(imagepath);
	gm(imagepath + imageformat)
	.setFormat('pgm')
	.resize(92, 112, "!")
	.write(imagepath + '.pgm',function(err){
		return callback(err);
	});
}



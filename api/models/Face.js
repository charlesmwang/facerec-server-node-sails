/**
 * Face
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
	  PersonId:{
		  type:'int',
		  required:true
	  },
	  
	  image_path:{
		  type:'string',
		  required:true,
		  unique:true,
	  },
	  
	  pgm_path:{
		  type:'string',
		  required:true,
		  unique:true,
	  },
	  
	  UserId:{
		  type:'int',
		  required:true		  
	  },
    
  }

};

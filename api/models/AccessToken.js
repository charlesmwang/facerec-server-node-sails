/**
 * Apikey
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
	  token:{
		  type:'string',
		  required:true,
		  unique:true
	  },
	  expiration:{
		  type:'datetime',
		  required:true
	  },
	  UserId:{
		  type:'int',
		  required:true,		  
	  },	  
  }

};

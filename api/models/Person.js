/**
 * Person
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
	  firstname:{
		  type:'string',
		  minLength:1,
		  required:true,		  
	  },
	  lastname: {
		  type:'string',
		  minLength:1,
		  required:true,
	  },
	  email: {
		  type:'email',
		  minLength:1,
		  required:true
	  },
	  UserId:{
		  type:'int',
		  required:true
	  },
	  
	  fullname:function(){
		  return this.firstname + ' ' + this.lastname;
	  },
  },//End of attributes
  
  beforeValidation:function(values,next){
	  values.email = values.email.toLowerCase();
	  //Don't now this will work TODO
	  //Do check email + userid is not used
	  //
	  next();
  },
  
  beforeCreate:function(values,next){
	  values.email = values.email.toLowerCase();
	  next();
  },
  	/* e.g.
  	nickname: 'string'
  	*/
    

};

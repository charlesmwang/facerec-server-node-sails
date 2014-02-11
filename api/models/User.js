/**
 * User
 *
 * @module      :: User
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
	firstname:{
		type:'string',
		required:true,
		minLength:1
	},
	lastname:{
		type:'string',
		required:true,
		minLength:1
	},
	email:{
		type:'email',
		unique:true,
		required:true,
		minLength:1
	},
	username:{
		type:'string',
		unique:true,
		required:true,
		minLength:6,
		maxLength:20
	},
	password:{
		type:'string',
		required:true,
		minLength:6,
		maxLength:20
	},
	api_key:{
		type:'string',
		required:true,
		minLength:10		
	},
	group:{
		type:'string',
		required:true,
		minLength:1,
		maxLength:10
	},
    
	toJSON: function(){
		var obj = this.toObject();
		delete obj.password;
		return obj;
	},
	
	fullname:function(){
		return this.firstname + ' ' + this.lastname;
	},
	
    validatePassword: function(password, callback) {
        var obj = this.toObject();
        if (callback) {
            //callback (err, res)
            return bcrypt.compare(password, obj.password, callback);
        }
        return bcrypt.compareSync(password, obj.password);
    },

},//End of Attribute
	
	beforeValidation: function(values,next){
		if(values.username && values.email)
		{
			values.username = values.username.toLowerCase();
			values.email = values.email.toLowerCase();
		}
		next();
	},
	
	beforeCreate: function(values, next){
		bcrypt.hash(values.password, 10, function(err, hash){
			if(err) return next(err);
			values.password = hash;
			
			next();
		});
	},
	
};
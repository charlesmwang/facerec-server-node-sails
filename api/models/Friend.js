/**
 * Friend
 *
 * @module      :: Model
 * @description :: Ability to share database with a Friend.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
	  
	  UserId:{
		  type:'int',
		  required:true
	  },
	  
	  FriendId:{
		  type:'int',
		  required:true
	  },	  
    
  }

};

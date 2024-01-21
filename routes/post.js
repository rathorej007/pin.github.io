var mongoose  = require('mongoose');


 const postschema =  mongoose.Schema({
 
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },

  title:String,
  description:String,
  image:String,

 },{timestamps:true})

 
 module.exports = mongoose.model('Post',postschema);
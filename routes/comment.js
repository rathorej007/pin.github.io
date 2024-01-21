var mongoose  = require('mongoose');


 const commentSchema =  mongoose.Schema({
 
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
   post:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
   },
  comment:String,

 },{timestamps:true})

 
 module.exports = mongoose.model('Comment',commentSchema);
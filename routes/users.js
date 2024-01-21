var mongoose  = require('mongoose');
var passport_local = require('passport-local-mongoose');
 mongoose.connect('mongodb+srv://dev:dev123@cluster0.3j4jx52.mongodb.net/youtubevideo');
//  mongoose.connect('mongodb://127.0.0.1:27017/pin');
 

 const userschema = new mongoose.Schema({
 
  username:String,
  fullname:String,
  email:String,
  password:String,
  profileimage:String,
  contact:Number,
  boards:{
    type:Array,
    default:[]
  },
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Post',
    }
  ],
  followers:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
    }
  ],
  following:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
    }
  ],
  senderid:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"message",
    }
  ],
  reciverid:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"message",
    }
  ],
  message_id:[
    {
    
    }
  ]



 },{timestamps:true})

 
 userschema.plugin(passport_local);

 module.exports = mongoose.model('User',userschema);
var mongoose  = require('mongoose');

var messageschema = mongoose.Schema({
 
    message:{
        type:String,
    },
    senderid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiverid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
        type:String,
    },
    message_id:{
        type:String
    }

},
{timestamps:true});


module.exports = mongoose.model('message',messageschema);
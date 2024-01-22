var express = require('express');
var router = express.Router();
var passport = require('passport');
var passport_local = require('passport-local');
var userModel = require('./users');
var postModel = require('./post');
var commentModel = require('./comment');
var messageModel = require('./message');
passport.use(new passport_local(userModel.authenticate()));
var upload = require('./multer');
const message = require('./message');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {error:req.flash('error')});
});

 
router.get('/register',(req,res)=>{
 
  res.render('register');

});

router.post('/register', async (req,res)=>{
 
  var  { username,email,number,fullname} = req.body;
  var user = await new userModel({
     username,email,number,fullname
  });

   
  await userModel.register(user,req.body.password)
  .then(function(){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile');
    })
  })
});


router.post('/login', passport.authenticate('local',{

  successRedirect : "/profile",
  failureRedirect : "/",
  failureFlash: true

}), (req,res)=>{

});



router.get('/logout',(req,res,next)=>{
   
  req.logout(function(err){
     if(err) return next(err)
     res.redirect('/');
  });

});


router.get('/profile', isloggedin, async function(req,res){
  
  var user =  await userModel.findOne({username:req.session.passport.user})
              .populate('posts');

res.render('profile',{user});

})

router.get('/show/posts', isloggedin, async function(req,res){
  var user =  await userModel.findOne({username:req.session.passport.user})
              .populate('posts');

res.render('show',{user});

})

router.get('/feed',isloggedin, async function(req,res){
  var user =  await userModel.findOne({username:req.session.passport.user}).sort({ _id: -1 });
  var posts = await postModel.find()
              .populate('user')
              .sort({ _id: -1 });
              console.log(posts);
res.render('feed',{user,posts});

})

router.get('/add', isloggedin, async function(req,res){
  var user =  await userModel.findOne({username:req.session.passport.user});

res.render('add',{user});

})

router.post('/createpost',isloggedin, upload.single('image'), async (req,res)=>{
  
  var user =  await userModel.findOne({username:req.session.passport.user});
   
  var post = await postModel.create({
    user: user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename,
  });

  user.posts.push(post._id);
  user.save();
   res.redirect('/profile');
});


router.post('/addcomment', isloggedin, async (req,res)=>{
  
  var user =  await userModel.findOne({username:req.session.passport.user});
  const postId = req.body.pin_id;

  var comment = await commentModel.create({
    user:user._id,
    comment:req.body.comment,
    post:postId
  })
 
  res.redirect(`/show/${postId}`);

});


router.post('/fileupload',  isloggedin , upload.single('image'),async (req,res)=>{
 
var user =  await userModel.findOne({username:req.session.passport.user});
user.profileimage = req.file.filename;
await user.save();
res.redirect('/profile');

});

function isloggedin(req,res,next){
   
  if(req.isAuthenticated()) return next();
  res.redirect('/');

}


router.get('/show/:id',isloggedin, async (req,res)=>{
  
  var id = req.params.id
  const post = await postModel.findOne({ _id: id })
              .populate('user');
  const user_id = req.session.passport.user;
  const userdata = await userModel.findOne({username:user_id});
  const comment  = await commentModel.find({post:post._id})
                          .populate('user');
  
console.log(comment)
  res.render('full_show',{post,comment,userdata});

})

router.post('/follow/:userId', isloggedin, async (req , res) => {
 try{
    const userId = req.params.userId;
    const followerId = req.session.passport.user;
    const postId = req.body.post_id;
    const referringPage = req.get('referer'); 
  

    const user = await userModel.findById(userId);
    const follower = await userModel.findOne({username:followerId});

   
    if (!user || !follower) {
      return res.status(404).send("User not found");
    }

    if (!user.followers.includes(follower._id)) {
      user.followers.push(follower._id);
      follower.following.push(user._id);
      await user.save();
      await follower.save();
      
      return res.redirect(referringPage || '/');

      
    }
    else{
      user.followers = user.followers.filter((id) => id.toString() !== follower._id.toString());
      follower.following = follower.following.filter((id) => id.toString() !==  user._id.toString());
      
      await user.save();
      await follower.save();
      return res.redirect(referringPage || '/');
      

    }
    
    res.status(400).json({ message: 'Already following this user' });

  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
 
});

router.get('/user-profile/:id', isloggedin,async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const loggedInUserId = req.session.passport.user;
    if (requestedUserId === loggedInUserId) {
      return res.redirect('/profile'); 
    }

    const user = await userModel.findOne({ username: requestedUserId }).populate('posts');
    const loginuser = await userModel.findOne({ username: loggedInUserId });

    var messagedata = await message.find({ receiverid: loginuser._id, senderid: user._id });
    var receverdata = await message.find({ receiverid: user._id, senderid: loginuser._id });

    var message_id = null;
    if (messagedata.length > 0) {

      message_id = messagedata[0].message_id || null;
    } else if (receverdata.length > 0) {
      message_id = receverdata[0].message_id || null;
    }


    


    res.render('userprofile', { user, loginuser,message_id});
  } catch (error) {
    res.status(500).send(error);
  }
});


router.get('/message',(req,res)=>{

  res.render('message');

})

router.post('/send-message',isloggedin, async (req,res)=>{
   
 try{

   var senderid = await userModel.findOne({username:req.session.passport.user});
   var  recevierid = await userModel.findById(req.body.userid);
   const referringPage = req.get('referer'); 
     var message = await messageModel.create({
      message:req.body.message,
      senderid:senderid._id,
      receiverid:recevierid,
      message_id:req.body.message_id,
      status:0,
     });

     senderid.senderid.push(message._id);
     recevierid.reciverid.push(message._id);
     senderid.save();
     recevierid.save();


     res.redirect(referringPage || '/feed')

 }
 catch(error){
  res.send(error);
 }
});

router.get('/getData/:username',isloggedin, async (req, res) => {
  const username = req.params.username;
  try {
    const userData = await userModel.findById(username);
    const loginuser = await userModel.findOne({username:req.session.passport.user});
    const receiverdata = await messageModel.find({senderid:loginuser._id,receiverid:userData._id}).populate('receiverid').populate('senderid');
    const senderdata = await messageModel.find({senderid:userData._id,receiverid:loginuser._id}).populate('receiverid').populate('senderid');

    const mergedData = [...receiverdata, ...senderdata];

  mergedData.forEach(item => {
    item.createdAt = new Date(item.createdAt);
  });
  

  mergedData.sort((b, a) => b.createdAt.getTime() - a.createdAt.getTime());


    if (loginuser) {
      res.json({data:mergedData});
    } else {
      res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to fetch data - Replace this with your own data retrieval logic







module.exports = router;

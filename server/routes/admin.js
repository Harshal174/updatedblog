const express = require('express');
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = "../views/layouts/admin";
const jwtsecret = process.env.JWT_SECRET;


const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }

    try{
        const decoded = jwt.verify(token,jwtsecret);
        req.userId=decoded.userId;
        next();
    }catch(error){
        res.status(401).json({message:'Unauthorized'});
    }
}



router.get('/admin',async(req,res)=>{
    try{
      const locals = {
        title:"Admin",
        description:"Simple blog app created with node and express"
      }
      res.render('admin/index',{locals,layout:adminLayout});
    }catch(err){
        console.log(err);
    }
});

router.post('/admin',async(req,res)=>{
    try{
      const {username,password}=req.body;
      const user = await User.findOne({username});
      if(!user){
        return res.status(401).json({message:'Invalid Credentials'});
      }

      const isPasswordValid = await bcrypt.compare(password,user.password);
      if(!isPasswordValid){
        return res.status(401).json({message:'Invalid Credentails'});
      }
      const token = jwt.sign({userId: user._id},jwtsecret);
      res.cookie('token',token,{httpOnly:true});
      res.redirect('/dashboard');
    }catch(err){
        console.log(err);
    }
});



router.post('/register',async(req,res)=>{
    try{
      const {username,password}=req.body;
      const hashedPassword = await bcrypt.hash(password,10);
      try{
         const user = await User.create({username,password:hashedPassword});
         res.status(201).json({messgae:'User Created',user});
      }catch(error){
         if(error.code===11000){
            res.status(409).json({message:"User already in use"});
         }
         res.status(500).json({message:"Internal Server Error"});
      }
    }catch(err){
        console.log(err);
    }
});


router.get('/dashboard',authMiddleware ,async(req,res)=>{
        
    try{

        const locals={
           title:"Dashboard",
           description:"It is very descriptive"
        }

        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data,
            layout:adminLayout
        });

    }catch(err){
       console.log(err);
    }
    
})

//GET ROUTE
// ADMIN CREATE NEW POST

router.get('/add-post',authMiddleware,async(req,res)=>{
    try{
        const locals={
            title:"Add-Post",
            description:"Adding new post"
        }
        const data= await Post.find();
            res.render('admin/add-post',{
                locals,
                layout:adminLayout
            });

    }catch(err){
        console.log(err);
    }
})
//POST ROUTE
// ADMIN CREATE NEW POST

router.post('/add-post',authMiddleware,async(req,res)=>{
    try{
        try{
            const newPost = new Post({
                title:req.body.title,
                body:req.body.body  
            })
            await Post.create(newPost);
            res.redirect('/dashboard');
        }catch(err){
            console.log(err);
        }
    }catch(err){
        console.log(err);
    }
})

//GET ROUTE
// ADMIN CREATE NEW POST

router.get('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        const locals={
            title:"Edit-Post",
            description:"Adding new post"
        }
        const data=await Post.findOne({_id:req.params.id}); 
        res.render('admin/edit-post',{
             locals,
             data,
             layout:adminLayout   
        })
        // res.redirect(`/edit-post/${req.params.id}`);
    }catch(err){
        console.log(err);
    }
})


//PUT ROUTE
// ADMIN CREATE NEW POST

router.put('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        await Post.findByIdAndUpdate(req.params.id,{
            title:req.body.title,
            body:req.body.body,
            upadtedAt:Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    }catch(err){
        console.log(err);
    }
})


//DELETE
//ADMIN DELETE POST

router.delete('/delete-post/:id',authMiddleware,async(req,res)=>{
    try{
        await Post.deleteOne({_id:req.params.id});
        res.redirect('/dashboard'); 
    }catch(err){
        console.log(err);
    }
})

//GET
//admin logout
router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    // res.json({message:'logout successful'});
    res.redirect('/');
})


module.exports = router;
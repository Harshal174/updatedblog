const express = require('express');
const router = express.Router();
const Post = require("../models/Post");

//Routes
router.get('/',async (req,res)=>{

    try{
        const locals={
            title:"Node app",
            description:"Simple blog app created with node and express"
        }
       
        let perPage =10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{$sort:{createdAt:-1}}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count();
        const nextPage = parseInt(page)+1;
        const hasNextPage = nextPage <=Math.ceil(count/perPage);

       res.render('index',{
        locals, 
        data,
        current:page,
        nextPage: hasNextPage?nextPage:null,
        currentRoute:'/'
        });
    }catch(err){
        console.log(err);
    }
    
})

router.get('/post/:id',async(req,res)=>{
    try{
       
        let slug=req.params.id;

        const data = await Post.findById({_id:slug}); 
        const locals={
            title:data.title,
            description:"Simple blog app created with node and express"
        }  
        res.render('post',{locals,data,currentRoute:`/post/${slug}`});
    }catch(err){
        console.log(err);
    }
})

router.post('/search',async (req,res)=>{
    try{
      const locals={
        title:"Search",
        description:"Simple blog app created with node and express"
      };

      let searchTerm = req.body.searchTerm; 
      const searchNoSpecialChar = searchTerm.replace((/[^a-zA-Z0-9]/g));
      console.log(searchNoSpecialChar);
      const data = await Post.find({
        $or:[
            {title:{$regex:new RegExp(searchNoSpecialChar, 'i')}},
            {body:{$regex:new RegExp(searchNoSpecialChar, 'i')}}
        ]
      });
      res.render('search',{
        locals,
        data
      });
    }catch(err){
        console.log(err);
    }
})


// function insertPostData(){
//     Post.insertMany([
//         {
//             title: "Just a routine test",
//             body: "This is a new text and this is for testing"
//         }
//     ])
// }

// insertPostData();


router.get('/contact',(req,res)=>{
    res.render('contact',{currentRoute:`/contact`});
})
router.get('/about',(req,res)=>{
    res.render('about',{currentRoute:`/about`});
})



module.exports = router;

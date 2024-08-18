const express=require('express');
const app=express();
const mongoose=require("mongoose");
app.use(express.json());
mongoose.connect("mongodb+srv://221210025:aryaman14%40@cluster0.x4x702w.mongodb.net/")
const adminSchema=new mongoose.Schema({
    username:String,
    password:String
})

const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    purchasedcourses:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]

})

const courseSchema=new mongoose.Schema({
    title:String,
    description:String,
    imagelink:String,
    price:Number
})

const Admin=mongoose.model('Admin',adminSchema);
const User=mongoose.model('User',userSchema);
const Course=mongoose.model('Course',courseSchema);

function adminMiddleware(req,res ,next){
const username=req.headers.username;
const password=req.headers.password;

    Admin.findOne({
        username:username,
        password:password
    })
    .then(function (value){
        if(value)
            next();
        else{
            res.status(403).json({
                msg:"adminuser doesn't exist"
            })
        }
    })

}

function userMiddleware(req,res ,next){
    const username=req.headers.username;
    const password=req.headers.password;
    
        User.findOne({
            username:username,
            password:password
        })
        .then(function (value){
            if(value)
                next();
            else{
                res.status(403).json({
                    msg:"user doesn't exist"
                })
            }
        })
    
    }
    

    app.post("/admin/signup",(req,res)=>{
        const username=req.body.username;
        const password=req.body.password;
            Admin.create({
                username:username,
                password:password
            })
            .then(function(){
                res.json({
                    message:"admin created successfully"
                })
            })
            .catch(function(){
                res.json({
                    message:"admin not created "
                })
            })
                
    })

    app.post("/admin/courses",adminMiddleware,async (req,res)=>{
        const title=req.body.title;
        const description=req.body.description;
        const imagelink=req.body.imagelink;
        const price=req.body.price;

   const newcourse=   await  Course.create({
           title,
           description,
           imagelink,
           price 
        })

        res.json({
            message:"course created successfully", courseid:newcourse._id
        })
    })

    app.get("/admin/courses",adminMiddleware,async (req,res)=>{
        Course.find({})
        .then(function (value){
           res.json({
            courses:value
           })
        })
    })

    app.post("/user/signup",(req,res)=>{
        const username=req.body.username;
        const password=req.body.password;

        User.create({
            username,
            password
        })
        res.json({
            message:"user created successfully"
        })
    })

    app.get("/user/courses",async (req,res)=>{
        const response=await Course.find({});

        res.json({
            courses: response
        })
    })

    app.post("/user/courses/:courseId",userMiddleware,(req,res)=>{
        const courseId=req.params.courseId;
        const username=req.headers.username;

        User.updateOne({username:username},{
           "$push": {purchasedcourses : courseId}
        })

        res.json({
            message:"purchase complete"
        })

    })

    app.get("/user/purchasedcourses",userMiddleware,async (req,res)=>{
        const user=await User.findOne({
            username : req.headers.username
        });
            const courses1=await Course.find({
                _id:{
                    "$in" : user.purchasedcourses
                }
            })
            res.json({
                courses:courses1
            })
    })
app.listen(3000);
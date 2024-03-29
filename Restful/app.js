var  bodyParser = require("body-parser"), 
     methodOverride = require("method-override"),
     expressSanitizer = require("express-sanitizer"),
     mongoose = require("mongoose"),
     express = require ("express"),
     app = express();

//App Config
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method")); 
// 用这个才能在html里面用'put' action

//Mongoose Mode Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String, 
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res){
   res.redirect("/blogs"); 
});

// Index Route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){   //Send data from the database
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index", {blogs: blogs}); 
        }
    });
});

// NEW route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//CREATE Route
app.post("/blogs", function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
       if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

//SHOW Route
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else{
           res.render("show", {blog: foundBlog});
       }
   });
});


// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
})


// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
      if(err){
          res.redirect("/blogs");
      }  else {
          res.redirect("/blogs/" + req.params.id);
      }
   });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
   //destroy blog
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
   })
   //redirect somewhere
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is Running!");
});
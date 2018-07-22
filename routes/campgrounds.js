var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware")


// Show all campgrounds
router.get("/",function(req, res){
    Campground.find({}, function(err,allcampgrounds){
        if(err){
        console.log(err);
    }else{
        res.render("campgrounds/index", {campgrounds: allcampgrounds});
    }
    });
        
        
});

// Create a new campground
router.post("/",middleware.isLoggedIn, function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    // Adding in user data
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var new_camp = {name:name, image:image, description:desc, author: author};
    
    // Create cmpground and save to DB
    Campground.create(new_camp,function(err,newlyCreated)
    {
        if(err){
            console.log(err);
        }else{
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
});

// Form to create new campground
router.get("/new",middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});


// Shows info about a camp
router.get("/:id", function(req, res) {
    //find campground 
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not Found");
            res.redirect("back");
        }else{
            // render show template with found campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND
router.get("/:id/edit",middleware.checkCampgroundOwnership ,function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
    res.render("campgrounds/edit", {campground: foundCampground});
});
});

//UPDATE CAMPGROUND
router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// Destroy Cmapground
router.delete("/:id", middleware.checkCampgroundOwnership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
})
module.exports = router;
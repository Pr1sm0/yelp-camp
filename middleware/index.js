const Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    if(req['headers']['content-type'] === 'application/json'){
        return req.send({ error: 'Login required' });
    }
    req.flash("warning", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.isPaid = (req, res, next) => {
    if (req.user.isPaid) return next();
    req.flash("warning", "Please pay registration fee before continuing");
    res.redirect("/checkout");
}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    // is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                //does user own a campground?
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You don`t have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("warning", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    // is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does user own the comment?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You don`t have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("warning", "You need to be logged in to do that");
        res.redirect("back");
    }
}

module.exports = middlewareObj;
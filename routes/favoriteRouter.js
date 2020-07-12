const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors')

const Favorites  = require('../models/favorite');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(authenticate.verifyOrdinaryUser, function (req, res, next) {
        Favorites.find({'postedBy': req.user._id})
            .populate('dishes')
            .populate('postedBy')
            .exec(function (err, favorites) {
                if (err) throw err;
                res.json(favorites);
            });
    })

    .post(authenticate.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOne({'postedBy': req.user._id}, function (err, favorite) {
            if (err) throw err;
            if (!favorite) {
                Favorites.create(req.body, function (err, favorite) {
                    if (err) throw err;
                    console.log('Favorite created!');
                    favorite.postedBy = req.user._id;
                    favorite.dishes.push(req.body._id);
                    favorite.save(function (err, favorite) {
                        if (err) throw err;
                        res.json(favorite);
                    });
                });
            } else {
                var dish = req.body._id;

                if (favorite.dishes.indexOf(dish) == -1) {
                    favorite.dishes.push(dish);
                }
                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    res.json(favorite);
                });
            }
        });
    })

    .delete(authenticate.verifyOrdinaryUser, function (req, res, next) {
        Favorites.remove({'postedBy': req.user._id}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

favoriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorite/'+ req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    var userId = mongoose.Types.ObjectId(req.user._id);
	Favorites.find({ user: userId })
	.then((favorite) => {
		Favorites.update({'dishes.dishId': {'$ne': 'req.params.dishId'}}, { '$addToSet': { 'dishes': req.body } })
        favorite.save()
		.then((favorite) => {
				Favorites.find({ user: userId })
	            .populate('dishes.dishId')
	            .then((favorite) => {
	                res.statusCode = 200;
	                res.setHeader('Content-Type', 'application/json');
	                res.json(dish);
	            }, (err) => next(err));            
	    }, (err) => next(err));
	 }, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOneAndUpdate({'postedBy': req.user._id}, {$pull: {dishes: req.params.dishId}}, function (err, favorite) {
            if (err) throw err;
            Favorites.findOne({'postedBy': req.user._id}, function(err, favorite){
                res.json(favorite);
            });
        });
    });


module.exports = favoriteRouter;

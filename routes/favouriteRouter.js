const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Favourite = require('../models/favourites');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourite.find({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                if(favourites.length)
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourites[0]);
                }
                else{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(null);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourite.find({ user: req.user._id })
            .then(favs => {
                if (!favs.length) {
                    Favourite.create({ user: req.user._id, dishes: req.body })
                        .then(favourites => {
                            Favourite.findById(favourites._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err))
                }
                else {
                    Favourite.findOneAndUpdate(
                        { userID: req.body.userID },
                        { $addToSet: { dishes: req.body } },
                        { new: true }
                    )
                        .then(favs => {
                            Favourite.findById(favs._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })

                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favourites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favourite.remove({ user: req.user._id })
            .then(result => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(result);

            }
                , (err) => next(err))
            .catch((err) => next(err));
    });


favRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourite.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourite.find({ user: req.user._id })
            .then(favs => {
                if (!favs.length) {
                    Favourite.create({ user: req.user._id, dishes: [req.params.dishId] })
                        .then(favourites => {
                            Favourite.findById(favourites._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err))
                }
                else {
                    Favourite.findOneAndUpdate(
                        { userID: req.body.userID },
                        { $addToSet: { dishes: [req.params.dishId] } },
                        { new: true }
                    )
                        .then(favs => {
                            Favourite.findById(favs._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })

                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favourite/'
            + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourite.findOne({ user: req.user._id })
            .then(favs => {
                if (!favs) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs);
                }
                else {
                    Favourite.findOneAndUpdate(
                        { userID: req.body.userID },
                        { $pull: { dishes: req.params.dishId } }
                    )
                        .then(favs => {
                            Favourite.findById(favs._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })

                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = favRouter;
var _ = require('lodash'),
	express = require('express'),
    session = require('express-session'),
    fixtures = require('./fixtures'),
    bodyParser = require('body-parser'),
    shortId = require('shortid'),
    passport = require('./auth'),
    app = express();

app.use(bodyParser.json());

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/api/auth/login', function(req, res){
    passport.authenticate('local', function(err, user, info){
		if(err){ 
			return res.sendStatus(500); 
		}
		if(!user) { 
			return res.sendStatus(403);
		}
		return res.send({
				user : user
		});
		req.login(user, function(err){
			if(err){
				return res.sendStatus(500);
			}
			return res.send({
				user : user
			});
		});
	})(req, res);
});


app.get('/api/users/:userId', function(req,res){
	var userId = req.params.userId;
	var users = null;
	for(var i=0; i< fixtures.users.length; i++){
		if(fixtures.users[i].id === userId){
			users = fixtures.users[i];
		}
	}
	if(users === null){
		return res.sendStatus(404);
	}
	return res.send({
		user: users
	});
});

app.get('/api/tweets/:tweetId', function(req, res){
	var tweetID = req.params.tweetId;
	if(!tweetID){
		return res.sendStatus(400);
	}
	var tweets = null;
	tweets = _.find(fixtures.tweets, 'id', tweetID);
	if(!tweets){
		return res.sendStatus(404);
	}
	return res.send({
		tweet : tweets
	});
});

function ensureAuthentication(req, res, next){
	 if(!req.isAuthenticated()){
	 	return res.sendStatus(403);
	 }
	 return next();
}

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res){
	var tweetId = req.params.tweetId;
	if(!tweetId){return res.sendStatus(404);}
	var remove = _.remove(fixtures.tweets, 'id', tweetId);
	if(remove.length == 0){return res.sendStatus(404);}
	return res.sendStatus(200);
});

app.post('/api/users', function(req, res){
	var user = req.body.user;
	if(_.find(fixtures.users, 'id', user.id)){
		return res.sendStatus(409);
	}
	user.followingIds = [];
	fixtures.users.push(user);
	return res.sendStatus(200);
});

app.post('/api/tweets', function(req, res){
	var tweet = req.body.tweet;
	var id = shortId.generate();
	tweet.id = id;
	tweet.created = Math.round(+new Date()/1000) || 0;
	fixtures.tweets.push(tweet);
	return res.send({
			tweet : tweet
	});
});

app.get('/api/tweets', function(req, res){
	var userId = req.query.userId;

	if(!userId){
		return res.sendStatus(400);
	}

	var tweets = [];

	for(var i=0; i< fixtures.tweets.length; i++){
		if(fixtures.tweets[i].userId === userId){
			tweets.push(fixtures.tweets[i]);
		}
	}

	var sortedTweets = tweets.sort(function(t1, t2){
		if(t1.created > t2.created){
			return -1;
		}else if(t1.created === t2.created){
			return 0;
		}else{
			return 1;
		}
	});

	return res.send({
		tweets: sortedTweets
	});

});

var server = app.listen(3000, '127.0.0.1');

module.exports = server;
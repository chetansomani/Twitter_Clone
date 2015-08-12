var _ = require('lodash'),
    fixtures = require('./fixtures'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

passport.serializeUser = function(user, done){
	done(null, user.id);
}

passport.deserializeUser = function(id, done){
	var user = _.find(fixtures.users, 'id', id);
	if(!user){
		return done(null, false);
	}
    done(null, user);
}

passport.use(new LocalStrategy(
	function(username, password, done){
		var user = _.find(fixtures.users, 'id', username);
		if(!user){
			return done(null, false, { message : 'Incorrect username.' });
		}
		else
		{
			user = _.find(fixtures.users, { 'id': username, 'password' : password});
			if(!user){
				return done(null, false, { message : 'Incorrect password.' });
			}
			return done(null, user);
		}
	}
));

module.exports = passport;
const LocalStrategy = require("passport-local").Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;

var mysql = require('sql');
var crypto = require('crypto');
// var dbconfig = require('./Database');
// var connection = mysql.createConnection(dbconfig.connection);
//
// connection.query('USE ' + dbconfig.database);


var Connection = require('tedious').Connection;
var config = {
    server: 'biromiro.database.windows.net',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'biromiro', //update me
            password: 'testinG1'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'biromiro'  //update me
    }
};
var connection = new Connection(config);
connection.on('connect', function(err) {
    // If no error, then good to proceed.
    console.log("Connected");
});




module.exports = function (passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM temp_users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });
    passport.use(
        'local-signup',
        new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
                session: false

            },
            function (req, email, password, done) {
                connection.query("SELECT * FROM temp_users WHERE email = ? ",
                    [email], function (err, rows) {
                        if (err)
                            return done(err);
                        if (rows.length) {
                            return done(null, false, req.flash('signupMessage', 'That is already taken'));
                        } else {
                            var newUserMysql = {
                                email: email,
                                password: crypto.createHash('md5').update(password).digest("hex"),
                                permission: "Guest",
                                votes: 0,
                                first_name: req.body.first_name,
                                second_name: req.body.second_name
                            };
                            console.log(newUserMysql.first_name)
                            var insertQuery = "INSERT INTO temp_users (email, password,permission, votes, first_name, second_name) values (?, ?, ?, ?, ?, ?)";

                            connection.query(insertQuery, [newUserMysql.email, newUserMysql.password, newUserMysql.permission, newUserMysql.votes, newUserMysql.first_name, newUserMysql.second_name],
                                function (err, rowss) {
                                    var test = rowss.insertId.toString();
                                    connection.query("UPDATE temp_users SET uid = ? WHERE id = ?", [test, rowss.insertId],
                                        function (err, rows) {
                                            if (err)
                                                return done(err);
                                            return done(null, newUserMysql);

                                        })
                                });

                        }

                    });
            })
    );
    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
                session: false

            },
            function (req, email, password, done) {
                connection.query("SELECT * FROM temp_users WHERE email = ? AND password = MD5(?)", [email, password],
                    function (err, rows) {
                        if (err)
                            return done(err);
                        if (!rows.length) {
                            return done(null, false, req.flash('loginMessage', 'No User Found'));
                        }
                        return done(null, rows[0]);
                    });
            })
    );
    passport.use(new VKontakteStrategy({
            clientID: "7500664",
            lang: 'ru',
            clientSecret: "TEeZ0QbVyKiSy4RFFiPA",
            callbackURL: "http://biromiro.tech:3002/auth/vkontakte/callback",
            session: false

        },
        function (accessToken, refreshToken, params, profile, done) {

            var test = false;
            connection.query("SELECT * FROM temp_users WHERE vk_id = ?", [profile.id],
                function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        test = true;
                        var insertQuery = "INSERT INTO temp_users (vk_id, first_name, second_name,permission, votes) values (?,?,?,?,?)";
                        var newUserMysql = {
                            vk_id: profile.id,
                            first_name: profile.name.givenName,
                            second_name: profile.name.familyName,
                            permission: "User",
                            votes: 1,
                        };
                        connection.query(insertQuery, [newUserMysql.vk_id, newUserMysql.first_name, newUserMysql.second_name, newUserMysql.permission, newUserMysql.votes],
                            function (err, rows) {
                                var test = rows.insertId.toString();
                                connection.query("UPDATE temp_users SET uid = ? WHERE id = ?", [test, rows.insertId],
                                    function (err, rows) {
                                        if (err)
                                            return done(err);
                                    })
                                return done(null, newUserMysql);
                            });

                    }
                    if (test) {
                        connection.query("SELECT * FROM temp_users WHERE vk_id = ?", [profile.id],
                            function (err, rows) {
                                if (err)
                                    return done(err);
                                if (!rows.length) {
                                }
                                return done(null, rows[0]);
                            })
                    } else {
                        return done(null, rows[0]);
                    }
                });
        }
    ));
};

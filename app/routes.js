var mysql = require('mysql');
var dbconfig = require('../Configs/Database');
var connection = mysql.createConnection(dbconfig.connection);
// var Recaptcha = require('express-recaptcha').RecaptchaV2;
// var recaptcha = new Recaptcha('6LcdGwEVAAAAADV_dgudLjuJ9vMSoSo3RutfmrKX', '6LcdGwEVAAAAAGLuvHHD542LF9r8uXv1wZO7KPbs');
// var options = {'theme': 'dark'};
// var recaptcha = new Recaptcha('6LcdGwEVAAAAADV_dgudLjuJ9vMSoSo3RutfmrKX', '6LcdGwEVAAAAAGLuvHHD542LF9r8uXv1wZO7KPbs', options);

module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        res.render('main.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.get('/logout', function (req, res) {
        if (isLoggedIn(req)) {
            req.logout();
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    });

    app.get('/news', function (req, res) {
        res.render('news.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.get('/top_leaders', function (req, res) {

        connection.query("SELECT * FROM temp_users ORDER BY votes DESC LIMIT 10",
            function (err, rows) {
                if (err)
                    return done(err);

                res.render('roadmap.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user, users: rows});

            })

    });

    app.post('/task_create_question', function (req, res) {

        var insertQuery = "INSERT INTO temp_users (topic, short_description,location, description, type) values (?, ?, ?, ?,?)";

        connection.query(insertQuery, [req.body.topic, req.body.short_description, req.body.location, req.body.description, "question"],
            function (err, rows) {
                if (err)
                    return done(err);

                res.redirect('news.ejs');
            })

    });

    app.get('/about', function (req, res) {
        res.render('about.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.get('/map', function (req, res) {
        res.render('map.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.get('/guide', function (req, res) {
        res.render('guide.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.get('/faq', function (req, res) {
        res.render('faq.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.get('/createTask', function (req, res) {
        res.render('create_task.ejs', {login: isLoggedIn(req), user: req.user, owner: req.user});
    });

    app.post('/login', passport.authenticate('local-login', {
            failureRedirect: '/',
        }),
        function (req, res) {

            res.redirect('/' + req.user.uid);
        });

    // app.post('/', recaptcha.middleware.verify, function (req, res) {
    //     if (!req.recaptcha.error) {
    //         console.log("ERROR")
    //     } else {
    //         console.log("NO ERROR")
    //     }
    // });

    app.get('/auth/vkontakte', passport.authenticate('vkontakte'),
        function (req, res) {
            // The request will be redirected to vk.com for authentication, so
            // this function will not be called.
        });

    app.post("/upload", function (req, res, next) {

        let filedata = req.file;
        if (!filedata)
            res.send("Ошибка при загрузке файла");
        else {
            connection.query("UPDATE temp_users SET photo_upload_addres = ? WHERE uid = ?", [req.file.originalname, req.user.uid],
                function (err, rows) {

                })
            res.send("Файл загружен");
        }
    });

    const fileFilter = (req, file, cb) => {

        if (file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }

    app.get("/:id", function (request, response) {
        var test = ["news", "", "profile", "auth", "logout", "signup", "faq", "guide", "login"]
        if (!test.includes(request.params.id)) {
            connection.query("SELECT * FROM biromiro.temp_users WHERE uid = ?", [request.params.id],
                function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        response.redirect("/");
                    } else {
                        if (!isLoggedIn(request)) {
                            response.render('profile.ejs', {login: isLoggedIn(request), user: rows[0]});
                        } else {
                            if (rows[0].uid === request.user.uid) {
                                response.render('profile.ejs', {
                                    login: isLoggedIn(request),
                                    user: request.user,
                                    owner: request.user,
                                    isThisUser: true,
                                    youVoteOwner: request.user.youVoteOwner
                                });
                            } else {
                                response.render('profile.ejs', {
                                    login: isLoggedIn(request),
                                    user: rows[0],
                                    owner: request.user,
                                    isThisUser: false,
                                    youVoteOwner: request.user.youVoteOwner
                                });
                            }
                        }
                    }
                })
        }
    })

    app.get("/give_votes/:id", function (req, res) {
        var uid = req.params.id;
        if (isLoggedIn(req)) {
            if (uid !== req.user.uid) {
                if (req.user.votes > 0) {
                    var votes = req.user.votes;
                    connection.query("SELECT * FROM temp_users WHERE uid = ?", [uid],
                        function (err, rows) {
                            if (err)
                                return done(err);
                            var currentVotes = rows[0].votes;
                            var resultVotes = parseInt(currentVotes) + parseInt(votes);
                            connection.query("UPDATE temp_users SET votes = ? WHERE uid = ?", [resultVotes.toString(), uid],
                                function (err, rows) {
                                })
                            connection.query("UPDATE temp_users SET votes = ? WHERE uid = ?", ["0", req.user.uid],
                                function (err, rows) {

                                })
                            connection.query("UPDATE temp_users SET count_of_given_votess = ? WHERE uid = ?", [votes, req.user.uid],
                                function (err, rows) {
                                })
                            connection.query("UPDATE temp_users SET vote_owner_id = ? WHERE uid = ?", [uid, req.user.uid],
                                function (err, rows) {
                                })
                            res.redirect("/" + uid);
                        })
                }
            }
        }
    })
    app.get("/revert_votes/:id", function (req, res) {
        var uid = req.params.id;
        console.log("asd")
        if (isLoggedIn(req)) {
            if (uid !== req.user.uid) {
                var votes = req.user.count_of_given_votess;
                connection.query("SELECT * FROM temp_users WHERE uid = ?", [uid],
                    function (err, rows) {
                        if (err)
                            return done(err);
                        var currentVotes = rows[0].votes;
                        var resultVotes = parseInt(currentVotes) - parseInt(votes);
                        connection.query("UPDATE temp_users SET votes = ? WHERE uid = ?", [resultVotes.toString(), uid],
                            function (err, rows) {
                            })
                        connection.query("UPDATE temp_users SET votes = ? WHERE uid = ?", [votes, req.user.uid],
                            function (err, rows) {

                            })
                        connection.query("UPDATE temp_users SET count_of_given_votess = ? WHERE uid = ?", ["0", req.user.uid],
                            function (err, rows) {
                            })
                        connection.query("UPDATE temp_users SET vote_owner_id = ? WHERE uid = ?", ["", req.user.uid],
                            function (err, rows) {
                            })
                        res.redirect("/" + uid);
                    })

            }
        }

    })


    app.get('/auth/vkontakte/callback',
        passport.authenticate('vkontakte', {
            failureRedirect: '/',
        }),
        function (req, res) {
            res.redirect('/' + req.user.uid);
        });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
};

function isLoggedIn(req) {
    return !!req.user;
}


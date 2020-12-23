const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const multer  = require("multer");

app.use(fileUpload());

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
app.use(multer({storage:storageConfig}).single("filedata"));

require('./Configs/Passport')(passport);

app.use(morgan('dev')); // запись запроса в консоль
app.use(cookieParser()); // чтение cookies
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs'); // настройка ejs для представлений

app.use(session({
    secret: "cookie_secret",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(port, '127.0.0.1', function () {
    console.log('Соединение установлено. Порт ' + port);

});

// настрока express приложения
app.use(express.static('./'));
app.use('/static', express.static(__dirname + '/public'));





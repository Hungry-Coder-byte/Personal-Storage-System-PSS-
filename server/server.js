var express = require('express');
var bodyParser = require('body-parser');
var route = require('./route');

var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.all('*', function (req, res, next) {
    /**
     * Response settings
     * @type {Object}
     */
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    /**
     * Headers
     */
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin", responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});


app.set('port', process.env.PORT || 9116);

app.post('/signin_cdn', route.signinCDN);
app.post('/disk_size', route.getDiskSize);
app.post('/create_folder', route.createFolder);
app.post('/remove_folder', route.removeFolder);
app.post('/get_folders', route.getFolders);
app.post('/get_files', route.getFiles);
app.post('/get_all_disks', route.getAvailableDisk);
app.post('/create_new_cloud', route.createNewCloud);
app.post('/activate_cloud', route.activateCloud);
app.get('/auth_check/:cloud_name/:folder/:url', route.urlAuth);

var server = app.listen(app.get('port'), '0.0.0.0', function (err) {
    if (err) throw err;
    var message = 'Server is running @ http://localhost:' + server.address().port;
    console.log(message);
});

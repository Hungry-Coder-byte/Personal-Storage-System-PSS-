var DB = require('./DB').DB;

var signinCDN = function (req, res, next) {
    console.log("Inside signinCDN", req.body);
    res.send("724hkfsuydhs9dyfsdfb"); //send your auth token
}

module.exports.signinCDN = signinCDN;

const checkDiskSpace = require('check-disk-space')

var getDiskSize = function (req, res, next) {
    getCloudStorages(function (all_storages, current_selected) {
        checkDiskSpace(current_selected.cloud_path).then((diskSpace) => {
            var resData = {};
            resData.total_size = Math.floor(diskSpace.size / 1e+9);
            resData.free_size = Math.floor(diskSpace.free / 1e+9);
            resData.used_size = Math.floor(resData.total_size - resData.free_size);
            resData.all_storages = all_storages;
            resData.current_selected = current_selected;
            console.log("response from getDiskSize", resData);
            res.send(resData)
        })
    });
}

function getCloudStorages(callback) {
    DB.query("select cloud_id,cloud_name,cloud_path,initcap(for_location) as for_location,is_current,api_key,api_secret from cloud_storage order by for_location")
        .then(function (cloud_all) {
            DB.query("select cloud_id,cloud_name,cloud_path,initcap(for_location) as for_location,is_current,api_key,api_secret from cloud_storage where is_current = true")
                .then(function (current) {
                    current[0].secure_path = "https://532d342c.ngrok.io/" + current[0].cloud_name;
                    callback(cloud_all, current[0]);
                })
        })
}

module.exports.getDiskSize = getDiskSize;

var createFolder = function (req, res, next) {
    var dir = req.body.path + '/' + req.body.folder_name;
    console.log("Inside createFolder", dir);
    if (req.body.folder_name != null && req.body.folder_name != undefined) {
        createDirectory(dir, function (code, message) {
            res.status(code).send(message)
        })
    } else {
        res.status(500).send("Please provide a valid name!");
    }
}

function createDirectory(dir, callback) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        callback(200, "Directory created");
    } else {
        callback(409, "Directory already present!");
    }
}
module.exports.createFolder = createFolder;

const path = require('path');

var getFolders = function (req, res, next) {
    var path = req.body.path + "/";
    console.log("Inside getFolders", path);
    var dirs = getDirectories(path);
    console.log("dirs", dirs);
    seperatePathAndName(dirs, function (respObj) {
        console.log("Final response from getFolders", respObj);
        res.send(respObj);
    })
}

function seperatePathAndName(dirs, callback) {
    if (dirs.length > 0) {
        console.log("dirs.length", dirs.length);
        var newObj = {};
        var finalArr = [];
        for (var i = 0; i < dirs.length; i++) {
            newObj.folder_path = dirs[i];
            newObj.folder_name = dirs[i].substring(dirs[i].lastIndexOf('/') + 1, dirs[i].length);
            finalArr.push(newObj);
            newObj = {};
            // if(finalArr.length == dirs.length)
        }
        callback(finalArr);
    } else {
        callback({});
    }
}

function flatten(lists) {
    return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .map(file => path.join(srcpath, file))
        .filter(path => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath) {
    return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}
module.exports.getFolders = getFolders;

var removeFolder = function (req, res, next) {
    deleteFolderRecursive(req.body.path, function (deleted) {
        res.send("Deleted!");
    });
}

function deleteFolderRecursive(path, callback) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
        callback(1);
    }
};
module.exports.removeFolder = removeFolder;

var getFiles = function (req, res, next) {
    console.log("Inside getFiles", req.body);
    getFileInfoFromFolder(req.body.path, function (files) {
        files.sort(function (a, b) {
            return b.lastModified - a.lastModified;
        }
        );
        console.log("Response from getFiles", files);
        res.send(files);
    });
    // var files = getFilesInsideDir(req.body.path);
}
function getFilesInsideDir(srcpath) {
    var folder_name = srcpath.substring(srcpath.lastIndexOf('/') + 1, srcpath.length);
    return fs.readdirSync(srcpath)
        .map(file => path.join("", file));
}

const getFileInfoFromFolder = (route, callback) => {
    const files = fs.readdirSync(route, 'utf8');
    console.log("files", files)
    var response = [];
    if (files.length == 0)
        callback(response);
    else {
        for (let file of files) {
            getFileDetails(file, route, function (data) {
                // console.log("data is", data);
                response.push(data);
                console.log("Lenghts", response.length, files.length)
                if (response.length == files.length)
                    callback(response);
            })
        }
    }
}

function getFileDetails(file, route, callback) {
    const extension = path.extname(file);
    var fileSize = Math.floor(fs.statSync(route + "/" + file).size / 1000);
    if (fileSize <= 0)
        fileSize = "< 1 " + " KB"
    else
        fileSize = fileSize + " KB"

    const filePath = "http://localhost:3000/" + route.replace("/media/yashu/cool/myWork/", "") + "/" + file;
    const filePropertry = fs.stat(route + "/" + file, function (err, stats) {
        console.log("stats", stats.ctime);
        var lastModified = stats.ctime;
        callback({ name: file, extension, fileSize, filePath, lastModified });
    })
}

module.exports.getFiles = getFiles;

var getAvailableDisk = function (req, res, next) {
    console.log("Inside getAvailableDisk");

    DB.query("select * from available_storage")
        .then(function (storages) {
            res.send(storages);
        })
}

module.exports.getAvailableDisk = getAvailableDisk;

var cuid = require('cuid');

var createNewCloud = function (req, res, next) {
    console.log("Inside createNewCloud");
    DB.query("select * from available_storage where storage_name ilike $1", req.body.disk_name)
        .then(function (storage) {
            var path = storage[0].storage_path + req.body.cloud_name;
            DB.query("insert into cloud_storage values(default,$1,$2,$3,true,$4,$5) returning cloud_id", [req.body.cloud_name, path, req.body.for_location, "ke" + cuid(), "se" + cuid()])
                .then(function (newcloud) {
                    console.log("New cloud created");
                    createDirectory(path, function (created) {
                        DB.query("update cloud_storage set is_current = false where cloud_id != $1", newcloud[0].cloud_id)
                            .then(function (updated) {
                                res.send("success");
                            })
                    });
                })
        })

}

module.exports.createNewCloud = createNewCloud;

var activateCloud = function (req, res, next) {

    DB.query("update cloud_storage set is_current = false")
        .then(function (updated) {
            DB.query("update cloud_storage set is_current = true where cloud_id = $1", req.body.cloud_id)
                .then(function (activated) {
                    res.send("success");
                })
        })
}

module.exports.activateCloud = activateCloud;

var urlAuth = function (req, res, next) {
    console.log("Inside urlAuth", req.params.url);
    console.log("Headers", req.headers);
    // if (req.headers["x-forwarded-host"] == '532d342c.ngrok.io' && req.headers["x-access-token"] != undefined && req.headers["x-access-token"] != '' && req.headers["x-access-token"] != null)
    DB.query("select cloud_path from cloud_storage where cloud_name = $1", req.params.cloud_name)
        .then(function (cloud_path) {
            if (cloud_path.length > 0)
                res.sendFile(cloud_path[0].cloud_path + '/' + req.params.folder + '/' + req.params.url);
            else
                res.status("401").send();
        })
    // else
    // res.status("401").send();
}

module.exports.urlAuth = urlAuth;

#!/usr/local/bin/node

var fs = require('fs.extra');
var Rsync = require('rsync');
var colors = require('colors');
var requirejs = require('requirejs');
var program = require('commander');
var semver = require('semver');
var async = require('async');
var VERSION_DIR = __dirname + '/v';
var ROOT_INDEX_HTML_FILENAME = 'index.html';
var ROOT_SOURCE_HTML_FILENAME = 'source.html';
var ROOT_INDEX_HTML_DIR = __dirname;
var JS_DIR = __dirname + '/js';
var REQUIREJS_PATH = JS_DIR + "/lib/require.js";
var APP_BUILT_JS = "app-built.js";

program
    .command('publish [release]')
    .option('-d, --dry-run', 'Will not actually create any new files')
    .description('Publish a new "major", "minor", or "patch" version')
    .action(function(release, options) {
        release = release || 'patch';

        versions = fs.readdirSync(VERSION_DIR);
        var maxVersion = '0.0.0';
        versions.forEach(function(version) {
            try {
                if (semver.gt(version, maxVersion)) {
                    maxVersion = version;
                }
            } catch(e) {
                console.log("Ignoring version", version);
            }
        });

        var latestVersion = semver.inc(maxVersion, release);
        var LATEST_DIR = VERSION_DIR + '/' + latestVersion;
        console.log("New released version will be", (latestVersion).bold);

        if (!options.dryRun) {
            async.series([
                function(callback) {
                    console.log(("Creating directory " + LATEST_DIR).grey);
                    fs.mkdir(LATEST_DIR, callback);
                },
                function(callback) {
                    console.log(("Copying " + ROOT_SOURCE_HTML_FILENAME + " to " + LATEST_DIR + "/index.html").grey);
                    fs.copy(ROOT_INDEX_HTML_DIR + '/' + ROOT_SOURCE_HTML_FILENAME, LATEST_DIR + '/index.html', callback);
                },
                function(callback) {
                    console.log(("Copying " + REQUIREJS_PATH + " to " + LATEST_DIR + "/require.js").grey);
                    fs.copy(REQUIREJS_PATH, LATEST_DIR + '/require.js', callback);
                },
                function(callback) {
                    var contents = fs.readFileSync(LATEST_DIR + '/index.html', {encoding: 'utf8'});
                    contents = contents
                        // Replace data-main="js/app.js" with data-main="app-built.js"
                        .replace(/(data-main=")[\w\/-]*\.js/, "$1" + APP_BUILT_JS)
                        // Replace src="/js/lib/require.js" with src="/v/0.0.0/require.js"
                        .replace(/src="[\/\w\.]+"/, "src=\"/v/" + latestVersion + "/require.js\"");
                        // -- old -- .replace(/(src="\/v\/)[\d\.]+(\/js\/lib\/require.js)/, "$1" + latestVersion + "$2");
                    console.log(("Configuring versioned index.html to use v" + latestVersion + " js").grey);
                    fs.writeFileSync(LATEST_DIR + '/index.html', contents);

                    var config = {
                        "baseUrl": "js/lib",
                        "paths": {
                            "requireLib": "require",
                            "app": "../app"
                        },
                        "name": "app",
                        "preserveLicenseComments": false,
                        "out": APP_BUILT_JS
                    };
                    requirejs.optimize(config, function(response) {
                        console.log(response.grey);
                        callback(null, response);
                    }, function(error) {
                        console.error(error.red);
                        callback(error);
                    });
                },
                function(callback) {
                    var contents = fs.readFileSync(APP_BUILT_JS, {encoding: 'utf8'});
                    contents = contents.replace(/LITERAL_TREES_VERSION/g, latestVersion);
                    console.log(("Inserting magic version number into " + APP_BUILT_JS).grey);
                    fs.writeFile(APP_BUILT_JS, contents, callback);
                },
                function(callback) {
                    var contents = fs.readFileSync(LATEST_DIR + "/index.html");
                    console.log(("Making duplicate copy of " + LATEST_DIR + "/index.html at /").grey);
                    fs.writeFile(__dirname + "/index.html", contents, callback);
                },
                function(callback) {
                    var contents = fs.readFileSync(__dirname + "/" + APP_BUILT_JS);
                    console.log(("Making duplicate copy of /" + APP_BUILT_JS + " at " + LATEST_DIR + "/app-built.js").grey);
                    fs.writeFile(LATEST_DIR + "/" + APP_BUILT_JS, contents, callback);
                },
                function(callback) {
                    rsyncWithServer(callback);
                }
            ], function(error, result) {
                if (error) {
                    console.log("There was an error".red);
                    return console.error(error.msg.red || error);
                }
                console.log(("Successfully created new version at", LATEST_DIR).green.underline);
            });
        } else {
            console.log('Doing nothing since --dry-run was specified.');
        }
    });

program
    .command('deploy')
    .description('Rsync the right files to the server')
    .action(function() {
        rsyncWithServer();
    });

var rsyncWithServer = function(callback) {
    console.log("rsync-ing files to server".grey);
    var rsync = new Rsync()
        .shell('ssh')
        .flags('avz')
        .set('progress')
        .source(__dirname + '/') // Trailing slash means "copy all teh stuff inside this dir"
        .destination('andrew@andrewhallagan.com:~/literal-trees');

    rsync.execute(callback);
};

program.parse(process.argv);

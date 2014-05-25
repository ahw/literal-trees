var fs = require('fs-plus');

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy_static_assets: {
            target: {
                version: '<%= pkg.version %>'
            }
        },

        substitute_version_numbers: {
            target: {
                version: '<%= pkg.version %>'
            }
        },

        remove_dev_blocks: {
            target: {
                version: '<%= pkg.version %>'
            }
        },


        release: {
            options: {
                bump: true,
                file: 'package.json',
                add: true,
                commit: true,
                tag: false,
                push: false,
                pushTags: false,
                npm: false,
                npmtag: false,
                commitMessage: 'Release <%= version %>'
            }
        },

        requirejs: {
            compile: {
                options: {
                    // Set up path aliases. For example, if something is
                    // specified as "app/foo.js" RequireJS will use the full
                    // path from the baseUrl: "js/lib/../app/foo.js"
                    paths: {
                        app: '../app',
                        main: '../main',
                        requireLib: 'require',
                    },
                    out: 'v/<%= pkg.version %>/app-<%= pkg.version %>.js',
                    baseUrl: 'js/lib', // By default load any module ids from js/lib
                    name: 'main', // This is an alias to ../main.js
                    include: 'requireLib', // Alias to js/lib/require.js
                    shim: {
                        'raphael': {
                            exports: 'Raphael'
                        }
                    },

                    done: function(done, output) {
                        // TODO: Remove this. Not necessary.
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }
                        done();
                    }
                }
            }
        }
    });

    grunt.registerMultiTask('copy_static_assets', function() {
        var done = this.async();
        var outputDir = __dirname + '/v/' + this.data.version;
        // The v/VERSION/ dir should already be created by the requirejs task.
        // But just in case, attempt to create it again.
        fs.makeTreeSync(outputDir);

        // Copy CSS files over.
        fs.copySync(__dirname + '/css', outputDir + '/css');

        // Copy HTML files over.
        console.log('finished copy static assets task');
        var html = fs.copy(__dirname + '/index.html', outputDir + '/index.html', done);
    });

    grunt.registerMultiTask('substitute_version_numbers', function() {
        var version = this.data.version;
        var outputDir = __dirname + '/v/' + version;
        fs.traverseTreeSync(outputDir, function(absolutePath) {
            var content = fs.readFileSync(absolutePath, {encoding: 'utf8'});
            content = content.replace(/LITERAL_TREES_VERSION/g, version);
            console.log('> Writing out replaced version of ' + absolutePath);
            fs.writeFileSync(absolutePath, content);
        }, function(dir) {}); // Use empty function for directories
    });

    grunt.registerMultiTask('remove_dev_blocks', function() {
        var outputDir = __dirname + '/v/' + this.data.version;
        fs.traverseTreeSync(outputDir, function(absolutePath) {
            var content = fs.readFileSync(absolutePath, {encoding: 'utf8'});
            var newContent = "";
            var insideDevBlock = false;
            content.split('\n').forEach(function(line) {
                if (/BEGIN:dev/.test(line)) {
                    insideDevBlock = true;
                }

                if (!insideDevBlock) {
                    newContent += line + '\n';
                } else {
                    console.log('> Skipping dev line:', line);
                }

                if (/END:dev/.test(line)) {
                    insideDevBlock = false;
                }
            });
            console.log('> Writing out file with dev blocks removed', absolutePath);
            fs.writeFileSync(absolutePath, newContent);
        }, function() {}); // Use empty function for handling directories
    });


    // Load various plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-release');

    grunt.registerTask('build', ['requirejs']);
    grunt.registerTask('version', ['release']);
    grunt.registerTask('deploy', ['version', 'build', 'copy_static_assets', 'remove_dev_blocks', 'substitute_version_numbers']);
};

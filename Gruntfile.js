module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    out: 'REQUIREJS-OUTPUT.js',
                    // By default load any module ids from js/lib
                    baseUrl: 'js/lib',
                    name: 'main',
                    include: 'requireLib',

                    // Except, if the module id starts with "app", load it from the js/app
                    // directory. The paths config is relative to the baseUrl, and never
                    // includes a ".js" extension since the paths config could be for a
                    // directory.
                    paths: {
                        app: '../app',
                        main: '../main',
                        requireLib: 'require',
                    },

                    shim: {
                        'raphael': {
                            exports: 'Raphael'
                        }
                    },

                    done: function(done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }

                        console.log('DONE WITH THE REQUIREJS PART');
                        done();
                    }
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            lol: {
                src: 'js/**/*.js',
                dest: 'GRUNT-build/<%= pkg.name %>.min.js'
            }
        }
    });

    // Load various plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
};

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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

    // Load various plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-release');

    // Default task(s).
    grunt.registerTask('build', ['requirejs']);
    grunt.registerTask('deploy', ['release', 'requirejs']);
};

'use strict';

module.exports = function(grunt) {
    grunt.config.init({
        watch:{
            files: [
              'gruntfile.js',
              './**/*.js',
              'test/**/*.js',
              './**/*.scss'
            ],
            tasks: [
              'compass:clean',
              'compass:compileDevelopment',
              'eslint',
              'mochaTest'
            ]
        },
        eslint: {
          src: ['.']
        },
        mochaTest: {
          test: {
            options: {
              reporter: 'list'
            },
            src: ['test/**/*.js']
          }
        },
        compass: {
          clean: {
            options: {
              sassDir: 'public/stylesheets',
              cssDir: 'public/stylesheets',
              clean: true
            }
          },
          compileDevelopment: {
            options: {
              sassDir: 'public/stylesheets',
              cssDir: 'public/stylesheets',
              environment: 'development'
            }
          },
          watch: {
            options: {
              sassDir: 'public/stylesheets',
              cssDir: 'public/stylesheets',
              watch: true
            }
          }
        },
        exec: {
          command: 'electron main.js',
          stdout: true,
          stderr: true
        }
      });

      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.loadNpmTasks('gruntify-eslint');
      grunt.loadNpmTasks('grunt-mocha-test');
      grunt.loadNpmTasks('grunt-exec');

      grunt.registerTask('default', [
        'compass:clean',
        'compass:compileDevelopment',
        'eslint',
        'mochaTest',
        'exec'
      ]);
      grunt.registerTask('development', [
        'compass:clean',
        'compass:compileDevelopment',
        'eslint',
        'mochaTest',
        'exec'
      ]);
    };

module.exports = function(grunt) {
  'use strict';

  // Load the grunt tasks
  require('load-grunt-tasks')(grunt);

  // Time the grunt tasks
  require('time-grunt')(grunt);

  grunt.initConfig({
    
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      banner: [
        '/**',
        ' * <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @author <%= pkg.author %>',
        ' * @license MIT License, http://www.opensource.org/licenses/MIT',
        ' */'
      ].join('\n')
    },

    dirs: {
      dest: 'dist'
    },

    jshint: {
      grunt: {
        src: ['Gruntfile.js'],
        options: {
          node: true
        }
      },
      dev: {
        src: ['src/**/*.js'],
        options: {}
      },
      test: {
        src: ['test/spec/**/*.js']
      }
    },

    watch: {
      files: ['src/**/*.js'],
      tasks: ['jshint']
    },

    concat: {
      options: {
        banner: '<%= meta.banner %>' + '\n' +
          '(function ( window, angular, undefined ) {' + '\n',
        footer: '})( window, window.angular );'
      },
      dist: {
        src: ['src/module.js', 'src/directives/*.js', 'src/services/*.js'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
      }
    },

    html2js: {
      dist: {
        options: {
          module: 'ng-aws-s3-templates'
        },
        files: [{
          src: ['src/templates/**/*.html'],
          dest: '<%= dirs.dest %>/<%= pkg.name %>.tpls.js'
        }]
      }
    }
  });

  grunt.registerTask('watch', [
    'watch'
  ]);

  grunt.registerTask('test', [
    'karma'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test'
  ]);

  grunt.registerTask('dist', [
    'jshint',
    'html2js',
    'concat',
    'uglify'
  ]);

};
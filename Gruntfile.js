module.exports = function(grunt) {

    grunt.config.init({
        "chrome": {
            "name": "X-Forwarded-For Header",
            "version": "0.2.1",
            "usePolyfill": true,
            "folder": "chromium"
        },
        "firefox": {
            "name": "X-Forwarded-For Header",
            "version": "0.2.1",
            "gecko": "{9e00ccd0-bf33-4038-929d-833a4b8d723b}",
            "usePolyfill": false,
            "folder": "firefox"
        },
        "edge": {
            "name": "X-Forwarded-For Header",
            "version": "0.2.1",
            "usePolyfill": false,
            "folder": "edge"
        },
        "clean": {
            "chrome": ["platform/chromium", "build/chome_*.zip"],
            "firefox": ["platform/firefox"],
            "edge": ["platform/edge"]
        },
        "watch": {
            "chrome": {
                "files": ['src/**'],
                "tasks": [
                    'clean:chrome',
                    'build-copy:chrome',
                    'chrome-manifest',
                    'build-concat:chrome'
                ],
                "options": {
                    "spawn": false,
                },
            },
            "firefox": {
                "files": ['src/**'],
                "tasks": [
                    'clean:firefox',
                    'build-copy:firefox',
                    'firefox-manifest',
                    'build-concat:firefox'
                ],
                "options": {
                    "spawn": false,
                },
            },
            "edge": {
                "files": ['src/**'],
                "tasks": [
                    'clean:edge',
                    'build-copy:edge',
                    'edge-manifest',
                    'build-concat:edge'
                ],
                "options": {
                    "spawn": false,
                },
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build-extensions', 'Build the Chrome extension', (browsers = '') => {
        let allowedBrowsers = ['chrome', 'firefox', 'edge'];
        if(browsers === '') {
            browsers = allowedBrowsers;
        } else {
            browsers = browsers.split(',');
        }
        browsers.forEach((b) => {
            if(allowedBrowsers.indexOf(b) > -1) {
                grunt.task.run(
                    'clean:' + b,
                    'build-copy:' + b,
                    b + '-manifest',
                    'build-concat:' + b,
                    'build-compress:' + b
                );
            } else {
                grunt.log.warn('Unknown browser ' + b);
            }
        });
    });

    grunt.registerTask('chrome-manifest', 'Build the Chrome manifest.json file', function() {
        grunt.config.requires('chrome.name', 'chrome.version');

        let options = grunt.config('chrome'),
            manifest = grunt.file.readJSON('src/manifest.json');

        if(options.usePolyfill) {
            manifest.background.scripts.unshift('browser-polyfill.js');
        }

        manifest.name = options.name;
        manifest.version = options.version;

        // Remove anything that will break Chrome
        delete manifest.applications;
        delete manifest.browser_action.browser_style;
        delete manifest.options_ui.browser_style;

        grunt.file.write('platform/' + options.folder + '/manifest.json', JSON.stringify(manifest, null, 4));
        grunt.log.write('Created Chrome\'s manifest.json. ').ok();
    });

    grunt.registerTask('firefox-manifest', 'Build the Firefox manifest.json file', function() {
        grunt.config.requires('firefox.name', 'firefox.version', 'firefox.gecko');

        let options = grunt.config('firefox'),
            manifest = grunt.file.readJSON('src/manifest.json');

        if(options.usePolyfill) {
            manifest.background.scripts.unshift('browser-polyfill.js');
        }

        manifest.name = options.name;
        manifest.version = options.version;
        manifest.applications.gecko.id = options.gecko;

        // Remove anything that will break Firefox's import routine
        delete manifest.options_ui.chrome_style;

        grunt.file.write('platform/' + options.folder + '/manifest.json', JSON.stringify(manifest, null, 4));
        grunt.log.write('Created Firefox\'s manifest.json. ').ok();
    });

    grunt.registerTask('edge-manifest', 'Build the Edge manifest.json file', function() {
        grunt.config.requires('edge.name', 'edge.version');

        let options = grunt.config('edge'),
            manifest = grunt.file.readJSON('src/manifest.json');

        if(options.usePolyfill) {
            manifest.background.scripts.unshift('browser-polyfill.js');
        }

        manifest.name = options.name;
        manifest.version = options.version;

        // Remove anything that will break Edge's import routine
        delete manifest.manifest_version;
        delete manifest.browser_action.browser_style;
        delete manifest.options_ui.chrome_style;
        delete manifest.options_ui.browser_style;

        grunt.file.write('platform/' + options.folder + '/manifest.json', JSON.stringify(manifest, null, 4));
        grunt.log.write('Created Edge\'s manifest.json. ').ok();
    });

    grunt.registerTask('build-copy', 'Copy over the source files to the build directory', function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser),
            filesToCopy = ["eventPage.js", "options.html", "assets/*.*"];
        if(options.usePolyfill) {
            filesToCopy.push('browser-polyfill.js');
        }

        grunt.config.set('copy.' + browser, {
            files: [
                {
                    expand: true,
                    cwd: 'src/',
                    src: filesToCopy,
                    dest: './platform/' + options.folder
                }
            ]});
        grunt.task.run('copy:' + browser);
    });

    grunt.registerTask('build-concat', 'Concat build files for a browser', function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser),
            sourceFiles = ['src/options.js'];
        if(options.usePolyfill) {
            sourceFiles.unshift('src/browser-polyfill.js');
        }

        grunt.config.set('concat.' + browser, {
            src: sourceFiles,
            dest: 'platform/' + options.folder + '/options.js'
        });
        grunt.task.run('concat:' + browser);
    });

    grunt.registerTask('build-compress', 'Compress build files into extension .zip', function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser),
            sourceFiles = ['src/options.js'];

        grunt.config.set('compress.' + browser, {
            options: {
                archive: './build/' + browser + '_' + options.version + '.zip'
            },
            files: [
                {
                    expand: true,
                    cwd: 'platform/' + options.folder,
                    src: ['**/*'],
                    dest: '/'
                }
            ]
        });
        grunt.task.run('compress:' + browser);
    });

};
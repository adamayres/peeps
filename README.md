## Overview
[![Build Status][travis-image]][travis-url]  [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url] [![Awesomeness Status][awesomeness-image]][awesomeness-url]

> Sails, angular and gulp seed

## Installation

1. Install [NodeJs](http://nodejs.org/download/)
2. Install git and setup github using these [instructions](https://help.github.com/articles/set-up-git)
3. Start a new terminal and run the following commands:

```bash
# Install gulp, bower and sails globally
npm install -g gulp bower sails;

# Create and go into folder where you want to store the Lithium code. We use `lia` as an example.
mkdir lia; cd lia

# Clone the sails-angular-gulp-seed branch
git clone https://github.com/lithiumtech/sails-angular-gulp-seed.git

# Avoid using sudo with npm; take ownership!
sudo chown -R $USER /usr/local

# Install the npm and bower dependencies in sails-angular-gulp-seed
cd li-rnr-hack; npm install; bower install

# Run the app using the default command gulp
gulp
```

The running app will be accessible at: ([http://localhost:1337/](http://localhost:1337)).

## File/Folder Structure

Not sure where things go or what files do? Let me help...

```
.tmp/                   => built client assets used when running the app; looking only, do not touch
api/                    => server side stuff used by the sails/express/node app
    adapters/           => allows a customer adapter to a data store using the Waterline ORM
    controllers/        => middleman between your model and your views.
    models/             => object model definitions for the Waterline ORM
    policies/           => policies in Sails are versatile tools for authorization and access control (ACL)
    services/           => services/managers/re-usable-chunk-of-code
assets/                 => static client side stuff: angular, js, css, html, images, fonts, etc
    images/             => static images assets
    linker/             => container folder that will soon be removed; originally used by the sails js grunt build system
        fonts/          => static font assets
        js/             => static js assets; angular assets
            deps/       => third party dependencies; this should be updated to use bower
            directives/ => angular directives
            services/   => angular services
            app.js      => angular module to start the client app
        styles/         => styles for the app
            *.less      => third party css/less dependencies; this should be moved to use bower
            main.less   => main less/css styles for the app
bower_components/       => bower installed projects
config/                 => config hookpoints for the sails app
    locales/            => localization for the server side rendered views
    *.js                => all of the customizable config endpoints
    routes.js           => handles the routing from a URL endpoint to a controller method
    local.js            => local config for the current env; TODO: make this unique per env
node_modules            => npm installed projects
views                   => views used by the routes
    main/               => the main views; arbitrary naming 'main'
        index.html      => jade template for the root path '/'
.editorconfig           => editor config for editors that support the .editorconfig file
.foreverignore          => config for the node forever library advising which files/folders for forever to ignore
.gitignore              => config for git advising which files/folders for git to ignore
.jshintrc               => jshint rules
.travis.yml             => travis CI config
app.js                  => the main app launch point: node app.js
bower.json              => bower config
Gruntfile.js            => Grunt task definitions; this has been replaced by gulp and will soon be deleted
gulpfile.js             => Gulp task definitions used to: start the app, run the tests, build the assets, do anything!
package.json            => npm package definition and configuration
README.md               => THIS FILE!
```

### Gulp Commands

Gulp is a task runner that can be used from the command line in the root of the project to perform the following actions:

#### `gulp`

This is the default task that will start the app. This is an alias for `gulp app`.

#### `gulp app`

Builds all assets (`build`), starts the app and opens a browser to [http://localhost:1337](http://localhost:1337).

#### `gulp test`

**options** `--watch`: Keeps the test server running and will re-run each time a js file is changed.

Runs the unit tests for the client layer. TODO: Add support for running tests on the server side.

#### `gulp coverage`

Runs the `test` task which creates the coverage report and then starts a local server to view the HTML results. This task can use the `--watch` option available to keep the `test` task running.

#### `gulp jshint`

Runs [jshint](http://www.jshint.com/) on both the client and serve side JavaScript assets.

#### `gulp clean`

Deletes the `.tmp/public` folder used for serving assets when running the application

#### `gulp clean-db`

Deletes the data store which is current stored at `.tmp/disk.db`

#### `gulp build`

Builds all the assets and puts them in `.tmp/public`. Runs the following sub-tasks: `'scripts', 'styles', 'fonts', 'images', 'favicon', 'robots', 'html', 'jshint-api', 'npm'`.

#### `gulp npm`

Alias for running `npm install`, used when starting the app to make sure all npm deps. are installed.

#### `gulp directive`

A directive generator that creates a new directive and sets up all the dependencies.

#### `gulp version`

Creates `.tmp/public/status/version.html` with information about the current version.

#### `gulp changelog`

Creates `.tmp/public/status/changelog.html` with the conventional changelog information.

### Generators

#### `directive`

Use the `gulp directive` task to run the generator to create a new directive.

### Data Base Seeding

When starting with a clean db, it can automatically be seeded with some default data. All Models in the system can provide default data. The default data is provided by a json file named after the Model and is located in the `config/seed` folder. The json file should contain a json array of the items.

**Example:** `config/seed/Reviews.json`

Seed for the `Reviews` model:

```json
[
  {
    "subject": "Default review!",
    "body": "This is a default review body",
    "rating": 5,
    "userId": 1
  }
]

```

When creating new Models or providing defaults for existing Models, all you need to do is add the file to `config/seed/<Model>.json`. No other registration is needed.

### Models

Current Models include:

* Messages
* Users
* Chats

### REST API

Each model has a RESTful API accessible using the pattern: `/api/<model>`

* `/api/messages`
* `/api/users`
* `/api/chats`

The following [query parameters](https://github.com/balderdashy/sails-docs/blob/08b3b7b0b3b8652d23ee449ac79278d711075365/reference/Blueprints.md#query-parameters) are available for each REST API endpoint.

* limit
* skip
* sort

### References

**Sails**

* [Sails Wiki](https://github.com/balderdashy/sails-docs/tree/0.9)
* [Sails Reference](https://github.com/balderdashy/sails-docs/tree/0.9/reference)
* [Sails Doc Home](http://sailsjs.org/#!documentation)
 * [Sails Adapters](http://sailsjs.org/#!documentation/custom-adapters)
 * [Sails Controllers](http://sailsjs.org/#!documentation/controllers)
 * [Sails Models](http://sailsjs.org/#!documentation/models)
 * [Sails Policies](http://sailsjs.org/#!documentation/policies)
 * [Sails Service](https://github.com/balderdashy/sails-docs/blob/0.9/services.md)
 * [Sails Config](http://sailsjs.org/#!documentation/configuration)

**Angular**

* [Angular](http://angularjs.org/)
* [Angular Tutorial](http://docs.angularjs.org/tutorial)
* [Angular Guide](http://docs.angularjs.org/guide)
* [Angular API Reference](http://docs.angularjs.org/api)

### Credits

Forked from the [sailsjs-angularjs-bootstrap-example](https://github.com/cgmartin/sailsjs-angularjs-bootstrap-example) by [cgmartin](https://github.com/cgmartin).

[travis-url]: https://travis-ci.org/lithiumtech/li-rnr-hack
[travis-image]: https://travis-ci.org/lithiumtech/li-rnr-hack.svg?branch=master

[coveralls-url]: https://coveralls.io/r/lithiumtech/li-rnr-hack
[coveralls-image]: http://img.shields.io/coveralls/lithiumtech/li-rnr-hack.svg

[depstat-url]: https://david-dm.org/lithiumtech/li-rnr-hack
[depstat-image]: https://david-dm.org/lithiumtech/li-rnr-hack.svg

[awesomeness-url]: http://lithium.com
[awesomeness-image]: http://img.shields.io/badge/awesomeness-110%25-brightgreen.svg

const path = require("path");
//set up global constants and helpers for all grunt tasks
const deslash = s => s.replace(/^\/*/, '').replace(/\/*$/, '');
const prefix = a => b => `/${a ? deslash(a) + '/' : ''}${deslash(b)}`;
const NODE_ENV = process.env.NODE_ENV === "development" ? "development" : "production";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "digitalmarketplace@gov.bc.ca";
const PATH_PREFIX = process.env.PATH_PREFIX || "";
const {
  BACKEND_URL,
  CWU_MAX_BUDGET,
  DEFAULT_PAGE_SIZE,
  GOV_IDP_SUFFIX,
  GOV_IDP_NAME,
  PROVINCIAL_IDP_NAME,
  SHOW_TEST_INDICATOR,
  SWU_MAX_BUDGET,
  TIMEZONE,
  VENDOR_ACCOUNT_CREATION_DISABLED, 
  VENDOR_IDP_SUFFIX,
  VENDOR_IDP_NAME,
} = process.env;
const srcFrontEnd = path.resolve(__dirname, "./src/front-end");
const srcBackEnd = path.resolve(__dirname, "./src/back-end");
const srcScripts = path.resolve(__dirname, "./src/scripts");
const srcShared = path.resolve(__dirname, "./src/shared");
const srcMigrations = path.resolve(__dirname, "./src/migrations");
const buildMigrations = path.resolve(__dirname, "./build/migrations");
const buildFrontEnd = path.resolve(__dirname, "./build/front-end");
const buildBackEnd = path.resolve(__dirname, "./build/back-end");
const buildScripts = path.resolve(__dirname, "./build/scripts");
const tmpFrontEnd = path.resolve(__dirname, "./tmp/grunt/front-end");
global.gruntConfig = {
  helpers: {
    prefixPath: prefix(PATH_PREFIX)
  },
  frontEnd: {
    src: {
      dir: srcFrontEnd,
      "static": `${srcFrontEnd}/static`,
      "html": `${srcFrontEnd}/html`,
      sass: `${srcFrontEnd}/sass`,
      ts: `${srcFrontEnd}/typescript`
    },
    build: {
      dir: buildFrontEnd,
      css: `${buildFrontEnd}/app.css`,
      js: `${buildFrontEnd}/app.js`
    },
    tmp: {
      dir: tmpFrontEnd
    },
    env: {
      BACKEND_URL,
      NODE_ENV,
      CONTACT_EMAIL,
      PATH_PREFIX,
      SHOW_TEST_INDICATOR,
      VENDOR_ACCOUNT_CREATION_DISABLED,
      CONTACT_EMAIL,
      GOV_IDP_SUFFIX,
      GOV_IDP_NAME,
      PROVINCIAL_IDP_NAME,
      VENDOR_IDP_SUFFIX,
      TIMEZONE,
      CWU_MAX_BUDGET,
      SWU_MAX_BUDGET,
      DEFAULT_PAGE_SIZE,
      VENDOR_IDP_NAME,
    }
  },
  backEnd: {
    src: {
      dir: srcBackEnd
    },
    build: {
      dir: buildBackEnd
    }
  },
  scripts: {
    src: {
      dir: srcScripts
    },
    build: {
      dir: buildScripts
    }
  },
  shared: {
    src: {
      dir: srcShared
    }
  },
  migrations: {
    src: {
      dir: srcMigrations,
    },
    build: {
      dir: buildMigrations
    }
  }
};

//dependencies
const loadTasks = require("load-grunt-tasks");
const requireDir = require("require-dir");
const _ = require("lodash");
const gruntConfigs = requireDir("./grunt-configs");

module.exports = function (grunt) {
  //load grunt tasks from package.json
  loadTasks(grunt);
  //initialize the grunt configs for various loaded tasks
  grunt.config.init(_.mapValues(gruntConfigs, v => {
    return _.isFunction(v) ? v(grunt) : v;
  }));
  //create task lists for dev and prod envs
  //front-end
  grunt.registerTask("front-end-common", [
    "clean:frontEndTmp",
    "clean:frontEndBuild",
    "copy",
    "ejs",
    "sass",
    "postcss:prefix",
    "shell:frontEndTypeScript",
    "browserify:frontEnd",
  ]);
  grunt.registerTask("front-end-build-development", [
    "front-end-common",
    "compress:gzip"
  ]);
  grunt.registerTask("front-end-build-production", [
    "front-end-common",
    "postcss:min",
    "terser:production",
    "htmlmin:production",
    "compress:gzip",
    "compress:brotli"
  ]);
  grunt.registerTask("front-end-build", [ `front-end-build-${NODE_ENV}` ]);
  grunt.registerTask("front-end-watch-development", [
    "front-end-build-development",
    "concurrent:frontEndWatch"
  ]);
  //back-end
  grunt.registerTask("back-end-build-production", [
    "clean:backEndBuild",
    "shell:backEndTypeScript"
  ]);
  grunt.registerTask("back-end-build-development", [
    "shell:backEndTypeScript"
  ]);
  grunt.registerTask("back-end-build", [ `back-end-build-${NODE_ENV}` ]);
  //scripts
  grunt.registerTask("scripts-build-production", [
    "clean:scriptsBuild",
    "shell:scriptsTypeScript"
  ]);
  grunt.registerTask("scripts-build-development", [
    "shell:scriptsTypeScript"
  ]);
  grunt.registerTask("migrations-build", [
    "shell:migrationsTypeScript"
  ]);
  grunt.registerTask("scripts-build", [ `scripts-build-${NODE_ENV}` ]);
};

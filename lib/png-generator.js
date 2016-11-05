'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _svg2png = require('svg2png');

var _svg2png2 = _interopRequireDefault(_svg2png);

var _faviconGenerator = require('./favicon-generator.js');

var _icoGenerator = require('./ico-generator.js');

var _icnsGenerator = require('./icns-generator.js');

var _cliUtil = require('../bin/cli-util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Generate the PNG files from SVG file.
 */
var PngGenerator = function () {
  function PngGenerator() {
    _classCallCheck(this, PngGenerator);
  }

  _createClass(PngGenerator, null, [{
    key: 'generate',

    /**
     * Generate the PNG files from the SVG file.
     *
     * @param {String}         src    SVG file path.
     * @param {String}         dir    Output destination The path of directory.
     * @param {Array.<String>} modes  Modes of an output files.
     * @param {Function}       cb     Callback function.
     * @param {Logger}         logger Logger.
     */
    value: function generate(src, dir, modes, cb, logger) {
      _fs2.default.readFile(src, function (err, svg) {
        if (err) {
          cb(err);
          return;
        }

        logger.log('SVG to PNG:');

        var sizes = PngGenerator.getRequiredImageSizes(modes);
        Promise.all(sizes.map(function (size) {
          return PngGenerator.generetePNG(svg, size, dir, logger);
        })).then(function (results) {
          cb(null, results);
        }).catch(function (err2) {
          cb(err2);
        });
      });
    }

    /**
     * Generate the PNG file from the SVG data.
     *
     * @param {Buffer} svg    SVG data that has been parse by svg2png.
     * @param {Number} size   The size ( width/height ) of the image.
     * @param {String} dir    Path of the file output directory.
     * @param {Logger} logger Logger.
     *
     * @return {Promise} Image generation task.
     */

  }, {
    key: 'generetePNG',
    value: function generetePNG(svg, size, dir, logger) {
      return new Promise(function (resolve, reject) {
        if (!(svg && 0 < size && dir)) {
          reject(new Error('Invalid parameters.'));
          return;
        }

        var dest = _path2.default.join(dir, size + '.png');
        logger.log('  Create: ' + dest);

        var buffer = _svg2png2.default.sync(svg, { width: size, height: size });
        if (!buffer) {
          reject(new Error('Faild to write the image, ' + size + 'x' + size));
          return;
        }

        _fs2.default.writeFile(dest, buffer, function (err) {
          if (err) {
            reject(err);
            return;
          }

          resolve({ size: size, path: dest });
        });
      });
    }

    /**
     * Create the work directory.
     *
     * @return {String} The path of the created directory, failure is null.
     */

  }, {
    key: 'createWorkDir',
    value: function createWorkDir() {
      var dir = _path2.default.join(_os2.default.tmpdir(), _nodeUuid2.default.v4());
      _fs2.default.mkdirSync(dir);

      var stat = _fs2.default.statSync(dir);
      return stat && stat.isDirectory() ? dir : null;
    }

    /**
     * Gets the size of the images needed to create an icon.
     *
     * @param {Array.<String>} modes Modes of an output files.
     *
     * @return {Array.<Number>} The sizes of the image.
     */

  }, {
    key: 'getRequiredImageSizes',
    value: function getRequiredImageSizes(modes) {
      var sizes = [];
      if (modes && 0 < modes.length) {
        modes.forEach(function (mode) {
          switch (mode) {
            case _cliUtil.CLIConstatns.modes.ico:
              sizes = sizes.concat(_icoGenerator.IcoConstants.imageSizes);
              break;

            case _cliUtil.CLIConstatns.modes.icns:
              sizes = sizes.concat(_icnsGenerator.IcnsConstants.imageSizes);
              break;

            case _cliUtil.CLIConstatns.modes.favicon:
              sizes = sizes.concat(_faviconGenerator.FaviconConstants.imageSizes);
              break;

            default:
              break;
          }
        });
      }

      // 'all' mode
      if (sizes.length === 0) {
        sizes = _faviconGenerator.FaviconConstants.imageSizes.concat(_icoGenerator.IcoConstants.imageSizes).concat(_icnsGenerator.IcnsConstants.imageSizes);
      }

      return sizes.filter(function (value, index, array) {
        return array.indexOf(value) === index;
      }).sort(function (a, b) {
        // Always ensure the ascending order
        return a - b;
      });
    }
  }]);

  return PngGenerator;
}();

exports.default = PngGenerator;
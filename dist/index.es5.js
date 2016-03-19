'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var loadAPI = _interopDefault(require('facebook-api-promise'));
var buildUrlQuery = _interopDefault(require('build-url-query'));
var Console = _interopDefault(require('console-class'));

var console = new Console('FB', false);
var logging = {
	on: function () {
		loadAPI.logging.on();
		console.on();
	},
	off: function () {
		loadAPI.logging.off();
		console.off();
	}
};
console.color = '#3b5998';

var requiresRedirect = navigator.userAgent.indexOf('iPhone') >= 0 && navigator.userAgent.indexOf('Version/') < 0;

var initPromise = void 0;
var redirectUri = void 0;
var appId = void 0;

function handleLoginResponse(response) {
	console.log('User login response:', response);
	if (response.status === 'connected' && response.authResponse && response.authResponse.accessToken && response.authResponse.userID) {
		return {
			token: response.authResponse.accessToken,
			id: response.authResponse.userID
		};
	}
	throw new Error('User not logged in');
}

/**
 * Load Facebook API, initiated it and set the configuration
 * @param  {string} id  The app ID given by Facebook
 * @param  {object} opts
 *         url          The URL to redirect to after the login on some browsers
 *         version      The Facebook API version to use, defaults to 'v2.5'
 * @return {Promise}    The Promise will resolve when the Facebook init has happened
 */
function init(id, opts) {
	if (!initPromise) {
		return initPromise;
	}
	opts = opts || {};
	redirectUri = opts.url || location.href;
	appId = id;
	initPromise = loadAPI().then(function (FB) {
		FB.init({
			appId: appId,
			xfbml: true,
			cookie: true,
			status: true, // https://developers.facebook.com/docs/javascript/advanced-setup#status
			version: opts.version || 'v2.5'
		});
	});
	return initPromise;
}

/**
 * Log into Facebook in one of the three ways available
 * @param  {boolean|object} opts   It can be one of the two following types
 *                         {boolean}  Whether to only verify if the user had already logged into the app
 *                         {object}   Optional permissions object to pass to Facebook, like {scope: 'user_friends'}
 * @return {Promise}             The Promise will resolve if the user is logged in, fail if it hasn't
 */
function login(opts) {
	if (opts !== true && requiresRedirect) {
		opts = opts || {}; // start from possible {scope: 'a,b,c'}
		opts.client_id = appId;
		opts.redirect_uri = redirectUri;
		window.location.href = 'https://www.facebook.com/dialog/oauth' + buildUrlQuery(opts);
		return;
	}
	return init().then(function (FB) {
		return new Promise(function (requestDone) {
			if (opts === true) {
				console.log('Verifying current login');
				FB.getLoginStatus(requestDone);
			} else {
				FB.login(requestDone, opts || {});
			}
		}).then(handleLoginResponse);
	});
}
var index = { init: init, login: login };

exports.logging = logging;
exports.requiresRedirect = requiresRedirect;
exports.init = init;
exports.login = login;
exports['default'] = index;
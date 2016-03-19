'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var loadAPI = _interopDefault(require('facebook-api-promise'));
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
 * @param  {string} url The URL to redirect to after the login on some browsers
 * @return {Promise}    The Promise will resolve when the Facebook init has happened
 */
function init(id, url) {
	if (!initPromise) {
		return initPromise;
	}
	redirectUri = url || location.href;
	appId = id;
	initPromise = loadAPI().then(function (FB) {
		FB.init({
			appId: appId,
			xfbml: true,
			version: 'v2.0'
		});
	});
	return initPromise;
}

/**
 * Log into Facebook in one of the three ways available
 * @param  {boolean} silent      Whether to only verify if the user had already logged into the app
 * @param  {object} permissions  Optional permissions object to pass to Facebook
 * @return {Promise}             The Promise will resolve if the user is logged in, fail if it hasn't
 */
function login(silent, permissions) {
	if (!silent && requiresRedirect) {
		window.location.href = 'https://www.facebook.com/dialog/oauth?client_id=' + appId + '&ßscope=public_profile&redirect_uri=' + encodeURIComponent(redirectUri);
	}
	return init().then(function (FB) {
		return new Promise(function (requestDone) {
			if (silent) {
				console.log('Verifying current login');
				FB.getLoginStatus(requestDone);
			} else {
				FB.login(requestDone, permissions || {});
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
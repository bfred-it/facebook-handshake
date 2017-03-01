const loadSDK = require('facebook-sdk-promise');
const qs = require('query-string');
const Console = require('console-class');

const console = new Console('FB', {
	color: '#3b5998',
	sub: [
		loadSDK.logging
	]
}).off();

export const requiresRedirect = navigator.userAgent.indexOf('iPhone') >= 0 && navigator.userAgent.indexOf('Version/') < 0;

let initPromise;
let loginPromise;
let redirectUri;
let appId;

function handleLoginResponse(response) {
	console.log('User login response:', response);
	if (response.status === 'connected') {
		loginPromise = Promise.resolve(response.authResponse);
		return loginPromise;
	}
	return Promise.reject(response.status);
}

function rememberLoginStatus(response) {
	handleLoginResponse(response);
	window.FB.Event.unsubscribe('auth.statusChange', rememberLoginStatus);
}

/**
 * Load Facebook API, initiated it and set the configuration
 * @param  {string} id  The app ID given by Facebook
 * @param  {object} opts
 *         url          The URL to redirect to after the login on some browsers
 *         version      The Facebook API version to use, defaults to 'v2.5'
 *         autoLogin    Verify and cache the user login status
 * @return {Promise}    The Promise will resolve when the Facebook init has happened
 */
export function init(id, opts) {
	if (initPromise) {
		return initPromise;
	}
	opts = opts || {};
	redirectUri = opts.url || location.href;
	appId = id;
	initPromise = loadSDK().then(FB => {
		FB.init({
			appId,
			xfbml: true,
			cookie: true,
			version: opts.version || 'v2.5',
			// https://developers.facebook.com/docs/javascript/advanced-setup#status
			status: opts.autoLogin === undefined ? true : opts.autoLogin
		});
		if (opts.autoLogin) {
			FB.Event.subscribe('auth.statusChange', rememberLoginStatus);
		}
		return FB;
	});
	return initPromise;
}

/**
 * Log into Facebook with a popup or a redirect
 * @param  {object} opts    Optional permissions object to pass to Facebook, like {scope: 'user_friends'}
 * @param  {boolean} force  Set to true to force the login popup/redirect to happen, otherwise it will be cached
 * @return {Promise}             The Promise will resolve if the user is logged in, fail if it hasn't
 */
export function login(opts, force) {
	if (loginPromise && !force) {
		return loginPromise;
	}
	opts = opts || {}; // start from possible {scope: 'a,b,c'}
	if (opts !== true && requiresRedirect) {
		/* eslint-disable camelcase */
		opts.client_id = appId;
		opts.redirect_uri = redirectUri;
		window.location.href = 'https://www.facebook.com/dialog/oauth' + qs.stringify(opts);
	} else {
		return init()
			.then(FB => new Promise(resolve => {
				FB.login(resolve, opts);
			}))
			.then(handleLoginResponse);
	}
}

/**
 * Verify if the user had already logged into the app
 * @return {Promise}    The Promise will resolve if the user is already logged in
 */
export function getLoginStatus() {
	if (loginPromise) {
		return loginPromise;
	}
	return init()
		.then(FB => new Promise(FB.getLoginStatus))
		.then(handleLoginResponse);
}

export const logging = console; // FBH.logging.on() or FBH.logging.off();

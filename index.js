'use strict';
import loadSDK from 'facebook-sdk-promise';
import {stringify as buildUrlQuery} from 'query-string';
import Console from 'console-class';
const console = new Console('FB', {color: '#3b5998'}).off();

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
	Promise.resolve(response).then(handleLoginResponse);
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
			status: opts.autoLogin === undefined ? true : opts.autoLogin,
		});
		FB.Event.subscribe('auth.statusChange', rememberLoginStatus);
		return FB;
	});
	return initPromise;
}

/**
 * Log into Facebook in one of the three ways available
 * @param  {boolean|object} opts   It can be one of the two following types
 *                         {boolean}  Whether to only verify if the user had already logged into the app
 *                         {object}   Optional permissions object to pass to Facebook, like {scope: 'user_friends'}
 * @param  {boolean} force       Set to true to force the login popup/redirect to happen, otherwise it will be cached
 * @return {Promise}             The Promise will resolve if the user is logged in, fail if it hasn't
 */
export function login(opts, force) {
	if (loginPromise && !force) {
		return loginPromise;
	}
	if (opts !== true && requiresRedirect) {
		opts = opts || {}; // start from possible {scope: 'a,b,c'}
		opts.client_id = appId;
		opts.redirect_uri = redirectUri;
		window.location.href = 'https://www.facebook.com/dialog/oauth' + buildUrlQuery(opts);
		return;
	}
	return init().then(FB => new Promise(resolve => {
		if (opts === true) {
			console.log('Verifying current login');
			FB.getLoginStatus(resolve);
		} else {
			FB.login(resolve, opts || {});
		}
	}).then(handleLoginResponse)
	);
}

export const logging = {
	on() {
		loadSDK.logging.on();
		console.on();
	},
	off() {
		loadSDK.logging.off();
		console.off();
	},
};

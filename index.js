'use strict';
import loadAPI from 'facebook-api-promise';
import buildUrlQuery from 'build-url-query';
import Console from 'console-class';
const console = new Console('FB', false);
export const logging = {
	on() {
		loadAPI.logging.on();
		console.on();
	},
	off() {
		loadAPI.logging.off();
		console.off();
	}
};
console.color = '#3b5998';

export let requiresRedirect = navigator.userAgent.indexOf('iPhone') >=0 && navigator.userAgent.indexOf('Version/') < 0 ;

let initPromise;
let redirectUri;
let appId;

function handleLoginResponse (response) {
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
export function init (id, opts) {
	if (!initPromise) {
		return initPromise;
	}
	opts = opts || {};
	redirectUri = opts.url || location.href;
	appId = id;
	initPromise = loadAPI().then(function(FB) {
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
export function login (opts) {
	if (opts !== true && requiresRedirect) {
		opts = opts || {}; // start from possible {scope: 'a,b,c'}
		opts.client_id = appId;
		opts.redirect_uri = redirectUri;
		window.location.href = 'https://www.facebook.com/dialog/oauth' + buildUrlQuery(opts);
		return;
	}
	return init().then(FB => new Promise(requestDone => {
			if (opts === true) {
				console.log('Verifying current login');
				FB.getLoginStatus(requestDone);
			} else {
				FB.login(requestDone, opts || {});
			}
		}).then(handleLoginResponse)
	);
}
export default {init, login};
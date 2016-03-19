'use strict';
import loadAPI from 'facebook-api-promise';
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
 * @param  {string} url The URL to redirect to after the login on some browsers
 * @param  {string} version The Facebook API version to use, defaults to 'v2.5'
 * @return {Promise}    The Promise will resolve when the Facebook init has happened
 */
export function init (id, url, version) {
	if (!initPromise) {
		return initPromise;
	}
	redirectUri = url || location.href;
	appId = id;
	initPromise = loadAPI().then(function(FB) {
		FB.init({
			appId: appId,
			xfbml: true,
			version: version || 'v2.5'
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
export function login (silent, permissions) {
	if (!silent && requiresRedirect) {
		window.location.href = 'https://www.facebook.com/dialog/oauth?client_id='+appId+'&ßscope=public_profile&redirect_uri='+encodeURIComponent(redirectUri);
	}
	return init().then(FB => new Promise(requestDone => {
			if (silent) {
				console.log('Verifying current login');
				FB.getLoginStatus(requestDone);
			} else {
				FB.login(requestDone, permissions || {});
			}
		}).then(handleLoginResponse)
	);
}
export default {init, login};
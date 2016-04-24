# facebook-handshake

> Seamlessly log into Facebook silently, with a popup or with a redirect on unsupported browsers (Chrome/iOS).

[![gzipped size](https://badges.herokuapp.com/size/github/bfred-it/facebook-handshake/master/dist/facebook-handshake.byte-count.js?gzip=true&label=gzipped%20size)](#readme) [![Travis build status](https://api.travis-ci.org/bfred-it/facebook-handshake.svg?branch=master)](https://travis-ci.org/bfred-it/facebook-handshake) [![npm package](https://img.shields.io/npm/v/facebook-handshake.svg)](https://www.npmjs.com/package/facebook-handshake) 

## Install 
```sh
npm i --save facebook-handshake
```

## Usage

```js
import FBH from 'facebook-handshake';

// MUST be called before anything else to store the data for the login.
FBH.init('8460000258713230');

// silent check
FBH.login(true).then(user => /* user is already logged in */)

// user clicks on connectButton
connectButton.onclick = () => FBH.login().then(user => /* do stuff */)

```

### Init with options

```js

FBH.init('8460000258713230', {
    url: 'http://yourfacebookapp.com/' // this is optional, it defaults to location.href
    version: 'v2.5' // this is the default value
});

```

### Init with callback (via promise)

```js
FBH.init('8460000258713230')
.then(FB => console.log('Facebook SDK initialized'));
```

### Silent login check

The user won't see anything, so you can proceed to use their previously-requested login or call `FBH.login()` whenever the user clicks on your `[Login]` button.

```js
FBH.login(true) // true = silent
.then(user => console.log('User was already logged in:', user.userID, user.accessToken))
.catch(error => console.error('User was not already log in'));
```

### First-time login

The user will be presented with the standard Facebook login popup or will be redirected to the specified URL on Chrome/iOS.

```js
// do this on click/tap or else the browser will block the popup
FBH.login()
.then(user => console.log('User logged in:', user.id, user.token))
.catch(error => console.error('User refused to log in'))
```

### Specify a scope

Only when logging in with a popup, specify the required scope this way:

```js
FBH.login({scope: 'public_profile'});
```

### Force a scope change

If the user is already logged in and connected, calling `.login()` with a different scope will not update. Use the second parameter (`force`) to, well, force it to display the login window with the new scope request.

```js
FBH.login({scope: 'public_profile,publish_actions'}, true);
```

### Enable or disable the internal logging

```js
import loadFacebookAPI from 'facebook-handshake';
// it starts "off"
loadFacebookAPI.logging.on();
FBH.init('8460000258713230');
// [FB API] Ready
// [FB] User login response: {id: '...', token: '...'}
```

### Support multiple apps on multiple domains

Create multiple apps (or test version of apps) on Facebook, and then easily `switch` between them:

```js
switch(location.host) {
    case 'yourfacebookapp.com': FBH.init('000PR0D00000'); break;
    case 'localhost':           FBH.init('1111L0CAL111'); break;
    case 'localhost:3000':      FBH.init('300030003000'); break;
}
```

## Build

The project is in ES6 but transformed into ES5 with [rollup-babel-lib-bundler](https://github.com/frostney/rollup-babel-lib-bundler). To do that, run:

```sh
npm run build
```

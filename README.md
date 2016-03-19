# facebook-handshake

> Seamlessly log into Facebook silently, with a popup or with a redirect on unsupported browsers (Chrome/iOS).

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
.then(user => console.log('User was already logged in:', user.id, user.token))
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

### Enable or disable the internal logging

```js
import loadFacebookAPI from 'facebook-handshake';
// it starts "off"
loadFacebookAPI.logging.on();
// [FB API] Ready
// [FB] User login response: {id: '...', token: '...'}
```

## Build

The project is in ES6 but transformed into ES5 with [rollup-babel-lib-bundler](https://github.com/frostney/rollup-babel-lib-bundler). To do that, run:

```sh
npm run build
```

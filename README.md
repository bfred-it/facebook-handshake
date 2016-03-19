# facebook-handshake

> Seamlessly log into Facebook silently, with a popup or with a redirect on unsupported browsers (Chrome/iOS).

## Install 
```sh
npm i --save facebook-handshake
```

## Usage

The user will be presented with the standard Facebook login popup or will be redirected to the specified URL on Chrome/iOS.

```js
import FBH from 'facebook-handshake';

// .init() MUST be called before anything else to store the data for the login
FBH.init('8460000258713230', 'http://yourfacebookapp.com/');

FBH.login()
.then(user => console.log('User logged in:', user.id, user.token))
.catch(error => console.error('User refused to log in'))
```

### Silent login check

The user won't see anything, so you can proceed to use their previously-requested login or call `FBH.login()` whenever the user clicks on your `[Login]` button

```js
FBH.init('8460000258713230', 'http://yourfacebookapp.com/');

FBH.login(true)
.then(user => console.log('User was already logged in:', user.id, user.token))
.catch(error => console.error('User was not already log in'));
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

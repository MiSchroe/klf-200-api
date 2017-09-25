# klf-200-api
This module provides a wrapper to the REST API of a KLF-200 interface.

## Installation
```
npm install klf-200-api --save
```

## Usage

The KLF-200 interface provides a list of connected products and a list of scenarios.
The interface is intended to be used with wired switches but by defining scenarios you can leverage the internal REST-API of the interface to run a scenario.

To work with this module you have to complete the following tasks:

1. Setup your KLF-200 to work in the *interface* mode.
   (See the interface manual on how to do it.)
1. Setup your products by either copying them from another remote control
   or by using the search functionality of the KLF-200 interface.
1. Setup scenes to control your products in the KLF-200 interface.
   You need one scene for each desired state of your product(s).
   You can group multiple products in one scene.
   (E.g. to be able to open and close a window you need two scenes:
   the first scene is set to a fully opened window (100%) and 
   the second scene is set to a closed window (0%).)

> Note: If you don't want to use wired switches
        you don't have to use the provided wires.

To use this module with the interface to run a scene you have to do the following steps:

1. Create a `connection` object and login with `loginAsync`.
1. Create a `scenes` object and run a scene with `runAsync`.
1. Close the connection using `logoutAsync`.

### Sample

The following sample code shows how to run a scene
named 'Window kitchen 50%'.

````javascript
// Use either the IP address or the name of *your* interface
// 'velux-klf-12ab' is just a placeholder example.
let conn = new connection('http://velux-klf-12ab');
// Login with *your* password
// 'velux123' is the default password
// and for security reason you should change it.
conn.loginAsync('velux123')
    .then(() => {
        let sc = new scenes(conn);
        return sc.runAsync('Window kitchen 50%');
    })
    .then(() => {
        // Always logout so that you don't block the interface!
        return conn.logoutAsync();
    })
    .catch((err) => {    // always close the connection
        return conn.logoutAsync().reject(err);
    });
````

## Changelog
### 2.0.0
* Removed request header from function returns (no dependency on used
request library any more)
* Added basic documentation

### 1.0.0 (2017-07-27)
* Initial version

## Licence

MIT License

Copyright (c) 2017 Michael Schroeder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# klf-200-api

[![Known Vulnerabilities](https://snyk.io//test/github/MiSchroe/klf-200-api/badge.svg?targetFile=package.json)](https://snyk.io//test/github/MiSchroe/klf-200-api?targetFile=package.json)
[![Build Status](https://dev.azure.com/michaelschroeder-github/GitHub%20projects/_apis/build/status/MiSchroe.klf-200-api?branchName=master)](https://dev.azure.com/michaelschroeder-github/GitHub%20projects/_build/latest?definitionId=1&branchName=master)

This module provides a wrapper to the official API of a KLF-200 interface.
You can find the links to the firmware and the documentation at https://www.velux.com/api/klf200.

> **ATTENTION: This version supports the officially documented API that was introduced
> with firmware version 2.0.0.71. It is not compatible with older firmware versions.
> It is recommended that you update your KLF-200 with the new firmware version.**

## Installation

```
npm install klf-200-api --save
```

### Generate Certificate

The KLF-200 uses a self-signed certificate to secure the TLS protocol. This package contains
the fingerprint and certificate that I have extracted from my KLF-200.

In case that your connection doesn't work due to a different certificate you have to extract the certificate from your box with the following command:

```Shell
$ echo -n | openssl s_client -connect <ip adress of your KLF-200>:51200 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > velux-cert.pem
```

After extracting the certificate you have to generate the fingerprint with the following command:

```Shell
$ openssl x509 -noout -fingerprint -sha1 -inform pem -in velux-cert.pem
```

This will print a fingerprint like `12:34:56:78:9a:bc:de:f0:12:34:56:78:9a:bc:de:f0:12:34:56:78`.

See below for a sample usage with user defined certificate data.

## Usage

The KLF-200 interface provides a list of connected products and a list of scenarios.
The interface is intended to be used with wired switches but there is an
official interface that works on sockets to control the connected products.

To work with this module you have to complete the following tasks:

1. Setup your KLF-200 to work in the _interface_ mode.
   (See the interface manual on how to do it.)
2. Setup your products by either copying them from another remote control
   or by using the search functionality of the KLF-200 interface.
3. _Optional:_ Setup scenes to control your products in the KLF-200 interface.

> **Note 1:** You no longer need to setup a scene for each desired position.
> With the new firmware it is possible to control the products directly.

> **Note 2:** If you don't want to use wired switches

              you don't have to use the provided wires.

To use this module with the interface to run a product you have to do the following steps:

1. Create a `Connection` object and login with `loginAsync`.
2. Create a `Products` object with `createProductsAsync`.
   This will load the registered products from the KLF-200.
3. Call `Product.setTargetPositionAsync` to set your product to the desired value.
4. Close the connection using `logoutAsync`.

### Sample

The following sample code shows how to open the window
named 'Window kitchen' to 50%.

```Typescript
import { Connection, Products, Product } from "klf-200-api";

/*
    Use either the IP address or the name of *your* interface
    'velux-klf-12ab' is just a placeholder in this example.
*/
const conn = new Connection('velux-klf-12ab');

/*
    Login with *your* password.
    The default password is the same as the WiFi password
    that is written on back side of the KLF200.
    For security reason you should change it.

    In the following example we assume
    that the password is `velux123`.
*/
await conn.loginAsync('velux123');
try {
    // Read the product's data:
    const myProducts = await Products.createProductsAsync(conn);

    // Find the window by it's name:
    const myKitchenWindow = myProducts.findByName("Window kitchen");
    if (myKitchenWindow) {
        await myKitchenWindow.setTargetPositionAsync(0.5);
    } else {
        throw(new Error("Could not find kitchen window."));
    }
} finally {
    await conn.logoutAsync();
}
```

If you have to provide your own certificate data use the following code for login:

```Typescript
import { Connection, Products, Product } from "klf-200-api";
import { readFileSync } from "fs";

const myFingerprint = "12:34:56:78:9a:bc:de:f0:12:34:56:78:9a:bc:de:f0:12:34:56:78";
const myCA = readFileSync("velux-cert.pem");

// Connect using your own certificate data:
const conn = new Connection('velux-klf-12ab', myCA, myFingerprint);
...
```

For some basic usage scenarios you can use the following classes:

-   `Gateway`: Represents the KLF-200. E.g. you can enable the
    house status monitor, change the password or
    query the current state.
-   `Products` and `Product`: Get a list of the products and control
    a product, e.g. open a window.
-   `Groups` and `Group`: Get a list of groups and control them,
    e.g. open all windows of a group together.
-   `Scenes` and `Scene`: Get a list of defined scenes and run a scene.
    E.g. you can open different windows at different positions.

For other scenarios you may want to send a command directly to the KLF-200.
You can do so by using the method `Connection.sendFrameAsync`.
This method handles the command handshake for you already.
The `Promise` that is returned will fulfill when the corresponding
confirmation frame is received.

Depending on the request, it can be finished when the confirmation frame
is received. With other request, like opening a window, you will receive
additional notifications, which will be provided by event handlers to you.

## Status of implemented messages

The following list shows the implemented messages that can be used:

-   [x] GW_ERROR_NTF
-   [x] GW_REBOOT_REQ
-   [x] GW_REBOOT_CFM
-   [x] GW_SET_FACTORY_DEFAULT_REQ
-   [x] GW_SET_FACTORY_DEFAULT_CFM
-   [x] GW_GET_VERSION_REQ
-   [x] GW_GET_VERSION_CFM
-   [x] GW_GET_PROTOCOL_VERSION_REQ
-   [x] GW_GET_PROTOCOL_VERSION_CFM
-   [x] GW_GET_STATE_REQ
-   [x] GW_GET_STATE_CFM
-   [x] GW_LEAVE_LEARN_STATE_REQ
-   [x] GW_LEAVE_LEARN_STATE_CFM
-   [x] GW_GET_NETWORK_SETUP_REQ
-   [x] GW_GET_NETWORK_SETUP_CFM
-   [x] GW_SET_NETWORK_SETUP_REQ
-   [x] GW_SET_NETWORK_SETUP_CFM
-   [x] GW_CS_GET_SYSTEMTABLE_DATA_REQ
-   [x] GW_CS_GET_SYSTEMTABLE_DATA_CFM
-   [x] GW_CS_GET_SYSTEMTABLE_DATA_NTF
-   [x] GW_CS_DISCOVER_NODES_REQ
-   [x] GW_CS_DISCOVER_NODES_CFM
-   [x] GW_CS_DISCOVER_NODES_NTF
-   [x] GW_CS_REMOVE_NODES_REQ
-   [x] GW_CS_REMOVE_NODES_CFM
-   [x] GW_CS_VIRGIN_STATE_REQ
-   [x] GW_CS_VIRGIN_STATE_CFM
-   [x] GW_CS_CONTROLLER_COPY_REQ
-   [x] GW_CS_CONTROLLER_COPY_CFM
-   [x] GW_CS_CONTROLLER_COPY_NTF
-   [x] GW_CS_CONTROLLER_COPY_CANCEL_NTF
-   [x] GW_CS_RECEIVE_KEY_REQ
-   [x] GW_CS_RECEIVE_KEY_CFM
-   [x] GW_CS_RECEIVE_KEY_NTF
-   [x] GW_CS_PGC_JOB_NTF
-   [x] GW_CS_SYSTEM_TABLE_UPDATE_NTF
-   [x] GW_CS_GENERATE_NEW_KEY_REQ
-   [x] GW_CS_GENERATE_NEW_KEY_CFM
-   [x] GW_CS_GENERATE_NEW_KEY_NTF
-   [x] GW_CS_REPAIR_KEY_REQ
-   [x] GW_CS_REPAIR_KEY_CFM
-   [x] GW_CS_REPAIR_KEY_NTF
-   [x] GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ
-   [x] GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM
-   [x] GW_GET_NODE_INFORMATION_REQ
-   [x] GW_GET_NODE_INFORMATION_CFM
-   [x] GW_GET_NODE_INFORMATION_NTF
-   [x] GW_GET_ALL_NODES_INFORMATION_REQ
-   [x] GW_GET_ALL_NODES_INFORMATION_CFM
-   [x] GW_GET_ALL_NODES_INFORMATION_NTF
-   [x] GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF
-   [x] GW_SET_NODE_VARIATION_REQ
-   [x] GW_SET_NODE_VARIATION_CFM
-   [x] GW_SET_NODE_NAME_REQ
-   [x] GW_SET_NODE_NAME_CFM
-   [x] GW_NODE_INFORMATION_CHANGED_NTF
-   [x] GW_NODE_STATE_POSITION_CHANGED_NTF
-   [x] GW_SET_NODE_ORDER_AND_PLACEMENT_REQ
-   [x] GW_SET_NODE_ORDER_AND_PLACEMENT_CFM
-   [x] GW_GET_GROUP_INFORMATION_REQ
-   [x] GW_GET_GROUP_INFORMATION_CFM
-   [x] GW_GET_GROUP_INFORMATION_NTF
-   [x] GW_SET_GROUP_INFORMATION_REQ
-   [x] GW_SET_GROUP_INFORMATION_CFM
-   [x] GW_GROUP_INFORMATION_CHANGED_NTF
-   [x] GW_DELETE_GROUP_REQ
-   [x] GW_DELETE_GROUP_CFM
-   [x] GW_NEW_GROUP_REQ
-   [x] GW_NEW_GROUP_CFM
-   [x] GW_GET_ALL_GROUPS_INFORMATION_REQ
-   [x] GW_GET_ALL_GROUPS_INFORMATION_CFM
-   [x] GW_GET_ALL_GROUPS_INFORMATION_NTF
-   [x] GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF
-   [x] GW_GROUP_DELETED_NTF
-   [x] GW_HOUSE_STATUS_MONITOR_ENABLE_REQ
-   [x] GW_HOUSE_STATUS_MONITOR_ENABLE_CFM
-   [x] GW_HOUSE_STATUS_MONITOR_DISABLE_REQ
-   [x] GW_HOUSE_STATUS_MONITOR_DISABLE_CFM
-   [x] GW_COMMAND_SEND_REQ
-   [x] GW_COMMAND_SEND_CFM
-   [x] GW_COMMAND_RUN_STATUS_NTF
-   [x] GW_COMMAND_REMAINING_TIME_NTF
-   [x] GW_SESSION_FINISHED_NTF
-   [x] GW_STATUS_REQUEST_REQ
-   [x] GW_STATUS_REQUEST_CFM
-   [x] GW_STATUS_REQUEST_NTF
-   [x] GW_WINK_SEND_REQ
-   [x] GW_WINK_SEND_CFM
-   [x] GW_WINK_SEND_NTF
-   [x] GW_SET_LIMITATION_REQ
-   [x] GW_SET_LIMITATION_CFM
-   [x] GW_GET_LIMITATION_STATUS_REQ
-   [x] GW_GET_LIMITATION_STATUS_CFM
-   [x] GW_LIMITATION_STATUS_NTF
-   [x] GW_MODE_SEND_REQ
-   [x] GW_MODE_SEND_CFM
-   [ ] ~~GW_MODE_SEND_NTF~~ \(not documented and not received\)
-   [x] GW_INITIALIZE_SCENE_REQ
-   [x] GW_INITIALIZE_SCENE_CFM
-   [x] GW_INITIALIZE_SCENE_NTF
-   [x] GW_INITIALIZE_SCENE_CANCEL_REQ
-   [x] GW_INITIALIZE_SCENE_CANCEL_CFM
-   [x] GW_RECORD_SCENE_REQ
-   [x] GW_RECORD_SCENE_CFM
-   [x] GW_RECORD_SCENE_NTF
-   [x] GW_DELETE_SCENE_REQ
-   [x] GW_DELETE_SCENE_CFM
-   [x] GW_RENAME_SCENE_REQ
-   [x] GW_RENAME_SCENE_CFM
-   [x] GW_GET_SCENE_LIST_REQ
-   [x] GW_GET_SCENE_LIST_CFM
-   [x] GW_GET_SCENE_LIST_NTF
-   [x] GW_GET_SCENE_INFOAMATION_REQ
-   [x] GW_GET_SCENE_INFOAMATION_CFM
-   [x] GW_GET_SCENE_INFOAMATION_NTF
-   [x] GW_ACTIVATE_SCENE_REQ
-   [x] GW_ACTIVATE_SCENE_CFM
-   [x] GW_STOP_SCENE_REQ
-   [x] GW_STOP_SCENE_CFM
-   [x] GW_SCENE_INFORMATION_CHANGED_NTF
-   [x] GW_ACTIVATE_PRODUCTGROUP_REQ
-   [x] GW_ACTIVATE_PRODUCTGROUP_CFM
-   [ ] ~~GW_ACTIVATE_PRODUCTGROUP_NTF~~ \(not documented and not received\)
-   [x] GW_GET_CONTACT_INPUT_LINK_LIST_REQ
-   [x] GW_GET_CONTACT_INPUT_LINK_LIST_CFM
-   [x] GW_SET_CONTACT_INPUT_LINK_REQ
-   [x] GW_SET_CONTACT_INPUT_LINK_CFM
-   [x] GW_REMOVE_CONTACT_INPUT_LINK_REQ
-   [x] GW_REMOVE_CONTACT_INPUT_LINK_CFM
-   [x] GW_GET_ACTIVATION_LOG_HEADER_REQ
-   [x] GW_GET_ACTIVATION_LOG_HEADER_CFM
-   [x] GW_CLEAR_ACTIVATION_LOG_REQ
-   [x] GW_CLEAR_ACTIVATION_LOG_CFM
-   [x] GW_GET_ACTIVATION_LOG_LINE_REQ
-   [x] GW_GET_ACTIVATION_LOG_LINE_CFM
-   [x] GW_ACTIVATION_LOG_UPDATED_NTF
-   [x] GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ
-   [x] GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF
-   [x] GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM
-   [x] GW_SET_UTC_REQ
-   [x] GW_SET_UTC_CFM
-   [x] GW_RTC_SET_TIME_ZONE_REQ
-   [x] GW_RTC_SET_TIME_ZONE_CFM
-   [x] GW_GET_LOCAL_TIME_REQ
-   [x] GW_GET_LOCAL_TIME_CFM
-   [x] GW_PASSWORD_ENTER_REQ
-   [x] GW_PASSWORD_ENTER_CFM
-   [x] GW_PASSWORD_CHANGE_REQ
-   [x] GW_PASSWORD_CHANGE_CFM
-   [x] GW_PASSWORD_CHANGE_NTF

## Changelog

For full details see [CHANGELOG.md](CHANGELOG.md).

## Licence

MIT License

Copyright (c) 2019-2022 Michael Schroeder

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

# CHANGELOG

<!--
	Placeholder for the next version (at the beginning of the line):
	## __WORK IN PROGRESS__
-->

## **WORK IN PROGRESS**

-   [#165](https://github.com/MiSchroe/klf-200-api/issues/165) Fix logging error when the login throws an error in the TLS stack.
-   Fix lint findings.

## 5.0.1 (2024-07-17)

-   [#147](https://github.com/MiSchroe/klf-200-api/issues/147) refreshLimitationStatusAsync should wait for the session finished notification.

## 5.0.0 (2024-07-15)

-   [#145](https://github.com/MiSchroe/klf-200-api/issues/145) Make sendFrameAsync strongly typed. Remove obsolete type conversions.

## 4.1.3 (2024-07-04)

-   [#143](https://github.com/MiSchroe/klf-200-api/issues/143) Fix inconsistent min/max limitation values.

## 4.1.2 (2024-06-28)

-   [#136](https://github.com/MiSchroe/klf-200-api/issues/136) Fix dynamic loading error in CommonJS part.

## 4.1.1 (2024-06-27)

-   [#134](https://github.com/MiSchroe/klf-200-api/issues/134) Add file velux-cert.pem to npm package.

## 4.1.0 (2024-06-27)

-   [#132](https://github.com/MiSchroe/klf-200-api/issues/132) Generate ESM and CommonJS targets.

## 4.0.0 (2024-06-24)

-   [#112](https://github.com/MiSchroe/klf-200-api/issues/112) Fixes Busy error when new products are added.
-   New major version: Some (usually only internally used) public methods have been made asynchronous.
-   Fixed some internal errors during asynchronous event handling.
-   Fixed some possible race conditions that could lead to timeout errors.
-   Converted to ECMAScript modules ES2022.
-   Update dependencies.
-   Unit tests run with a real (mocked) KLF-200 server.
-   Added missing unit tests.
-   Fixed unit tests.

## 3.5.0 (2024-02-15)

-   [#104](https://github.com/MiSchroe/klf-200-api/issues/104) Add LimitationOriginator and LimitationTime properites.

## 3.4.0 (2024-02-08)

-   [#98](https://github.com/MiSchroe/klf-200-api/issues/98) Add Products.requestStatusAsync to get the latest value from one or more products.

## 3.3.0 (2024-02-06)

-   [#72](https://github.com/MiSchroe/klf-200-api/issues/72) Enhance Group classes to support rooms

## 3.2.0 (2024-02-06)

-   Fix use of deprecated functions and dependencies
-   [#63](https://github.com/MiSchroe/klf-200-api/issues/63) Add `setTargetPositionRawAsync()` method to set a product to a raw value
-   Update dependencies

## 3.1.3 (2023-10-18)

-   Fix security audit dependencies and upgrade dependencies to latest versions

## 3.1.2 (2022-03-07)

### Fixes:

-   [#56](https://github.com/MiSchroe/klf-200-api/issues/56) Fix reading more than one scene.

## 3.1.1 (2021-12-02)

### Fixes:

-   [#52](https://github.com/MiSchroe/klf-200-api/issues/52) Fix wrong timestamp in product.

## 3.1.0 (2021-12-02)

### Enhancements:

-   [#24](https://github.com/MiSchroe/klf-200-api/issues/24) Add `refreshScenes()` method to re-read scenes data from the gateway
-   [#27](https://github.com/MiSchroe/klf-200-api/issues/27) Add `refresh()` method to re-read object data from the gateway
-   [#28](https://github.com/MiSchroe/klf-200-api/issues/28) Add methods and properties for product limitations.
-   [#41](https://github.com/MiSchroe/klf-200-api/issues/41) Add additional default parameters to methods.
-   [#50](https://github.com/MiSchroe/klf-200-api/issues/50) Add handler to log frames that are sent to the KLF 200.

### Fixes:

-   Fix security audit dependencies ([#32](https://github.com/MiSchroe/klf-200-api/issues/32), [#35](https://github.com/MiSchroe/klf-200-api/issues/35), [#37](https://github.com/MiSchroe/klf-200-api/issues/37))

## 3.0.4 (2020-07-27)

### Fixes:

-   [#20](https://github.com/MiSchroe/klf-200-api/issues/20) Fix GW_GET_NODE_INFORMATION_NTF and GW_GET_ALL_NODES_INFORMATION_NTF
-   [#21](https://github.com/MiSchroe/klf-200-api/issues/21) Fix GW_GET_LIMITATION_STATUS_REQ
-   Fix security audit dependencies

## 3.0.3 (2020-06-19)

### Fixes:

-   [#25](https://github.com/MiSchroe/klf-200-api/issues/25) Blocked execution on reading scenes, products or groups if the resulting list would have been empty

## 3.0.2 (2020-06-05)

### Fixes:

-   [#22](https://github.com/MiSchroe/klf-200-api/issues/22) Uncaught exception in loginAsync

## 3.0.1 (2020-06-04)

### Fixes:

-   [#12](https://github.com/MiSchroe/klf-200-api/issues/12) Wrong password in the [README.md](README.md)
-   [#16](https://github.com/MiSchroe/klf-200-api/issues/16) Handle closed connections
-   Fix some dependency vulnerabilities

## 3.0.0 (2019-10-01)

-   Completely reworked to support the official VELUX Socket-API
-   Converted to Typescript

## 2.0.0 (2017-09-25)

-   Removed request header from function returns (no dependency on used
    request library any more)
-   Added basic documentation

## 1.0.0 (2017-07-27)

-   Initial version

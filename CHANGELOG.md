# CHANGELOG

<!--
	Placeholder for the next version (at the beginning of the line):
	## __WORK IN PROGRESS__
-->
## 3.1.1 (2021-12-02)

### Fixes:

* [#52](https://github.com/MiSchroe/klf-200-api/issues/52) Fix wrong timestamp in product.

## 3.1.0 (2021-12-02)

### Enhancements:

* [#24](https://github.com/MiSchroe/klf-200-api/issues/24) Add `refreshScenes()` method to re-read scenes data from the gateway
* [#27](https://github.com/MiSchroe/klf-200-api/issues/27) Add `refresh()` method to re-read object data from the gateway
* [#28](https://github.com/MiSchroe/klf-200-api/issues/28) Add methods and properties for product limitations.
* [#41](https://github.com/MiSchroe/klf-200-api/issues/41) Add additional default parameters to methods.
* [#50](https://github.com/MiSchroe/klf-200-api/issues/50) Add handler to log frames that are sent to the KLF 200.

### Fixes:

* Fix security audit dependencies ([#32](https://github.com/MiSchroe/klf-200-api/issues/32), [#35](https://github.com/MiSchroe/klf-200-api/issues/35), [#37](https://github.com/MiSchroe/klf-200-api/issues/37))

## 3.0.4 (2020-07-27)

### Fixes:

* [#20](https://github.com/MiSchroe/klf-200-api/issues/20) Fix GW_GET_NODE_INFORMATION_NTF and GW_GET_ALL_NODES_INFORMATION_NTF
* [#21](https://github.com/MiSchroe/klf-200-api/issues/21) Fix GW_GET_LIMITATION_STATUS_REQ
* Fix security audit dependencies

## 3.0.3 (2020-06-19)

### Fixes:

* [#25](https://github.com/MiSchroe/klf-200-api/issues/25) Blocked execution on reading scenes, products or groups if the resulting list would have been empty

## 3.0.2 (2020-06-05)

### Fixes:

* [#22](https://github.com/MiSchroe/klf-200-api/issues/22) Uncaught exception in loginAsync

## 3.0.1 (2020-06-04)

### Fixes:

* [#12](https://github.com/MiSchroe/klf-200-api/issues/12) Wrong password in the [README.md](README.md)
* [#16](https://github.com/MiSchroe/klf-200-api/issues/16) Handle closed connections
* Fix some dependency vulnerabilities

## 3.0.0 (2019-10-01)
* Completely reworked to support the official VELUX Socket-API
* Converted to Typescript

## 2.0.0 (2017-09-25)
* Removed request header from function returns (no dependency on used
request library any more)
* Added basic documentation

## 1.0.0 (2017-07-27)
* Initial version

# klf-200-api
This module provides a wrapper to the official API of a KLF-200 interface.

## Installation
```
npm install klf-200-api --save
```

### Generate Certificate
```
echo -n | openssl s_client -connect <your ip adress>:51200 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > velux-c
ert.pem
```

## Usage

The KLF-200 interface provides a list of connected products and a list of scenarios.
The interface is intended to be used with wired switches but there is an
official interface that works on sockets to control the connected products.

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

## Status of implemented messages
- [x] GW_ERROR_NTF                               
- [x] GW_REBOOT_REQ                              
- [x] GW_REBOOT_CFM                              
- [x] GW_SET_FACTORY_DEFAULT_REQ                 
- [x] GW_SET_FACTORY_DEFAULT_CFM                 
- [x] GW_GET_VERSION_REQ                         
- [x] GW_GET_VERSION_CFM                         
- [x] GW_GET_PROTOCOL_VERSION_REQ                
- [x] GW_GET_PROTOCOL_VERSION_CFM                
- [x] GW_GET_STATE_REQ                           
- [x] GW_GET_STATE_CFM                           
- [x] GW_LEAVE_LEARN_STATE_REQ                   
- [x] GW_LEAVE_LEARN_STATE_CFM                   
- [x] GW_GET_NETWORK_SETUP_REQ                   
- [x] GW_GET_NETWORK_SETUP_CFM                   
- [x] GW_SET_NETWORK_SETUP_REQ                   
- [x] GW_SET_NETWORK_SETUP_CFM                   
- [x] GW_CS_GET_SYSTEMTABLE_DATA_REQ             
- [x] GW_CS_GET_SYSTEMTABLE_DATA_CFM             
- [x] GW_CS_GET_SYSTEMTABLE_DATA_NTF             
- [x] GW_CS_DISCOVER_NODES_REQ                   
- [x] GW_CS_DISCOVER_NODES_CFM                   
- [x] GW_CS_DISCOVER_NODES_NTF                   
- [x] GW_CS_REMOVE_NODES_REQ                     
- [x] GW_CS_REMOVE_NODES_CFM                     
- [x] GW_CS_VIRGIN_STATE_REQ                     
- [x] GW_CS_VIRGIN_STATE_CFM                     
- [x] GW_CS_CONTROLLER_COPY_REQ                  
- [x] GW_CS_CONTROLLER_COPY_CFM                  
- [x] GW_CS_CONTROLLER_COPY_NTF                  
- [x] GW_CS_CONTROLLER_COPY_CANCEL_NTF           
- [x] GW_CS_RECEIVE_KEY_REQ                      
- [x] GW_CS_RECEIVE_KEY_CFM                      
- [x] GW_CS_RECEIVE_KEY_NTF                      
- [x] GW_CS_PGC_JOB_NTF                          
- [x] GW_CS_SYSTEM_TABLE_UPDATE_NTF              
- [x] GW_CS_GENERATE_NEW_KEY_REQ                 
- [x] GW_CS_GENERATE_NEW_KEY_CFM                 
- [x] GW_CS_GENERATE_NEW_KEY_NTF                 
- [x] GW_CS_REPAIR_KEY_REQ                       
- [x] GW_CS_REPAIR_KEY_CFM                       
- [x] GW_CS_REPAIR_KEY_NTF                       
- [x] GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ      
- [x] GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM      
- [x] GW_GET_NODE_INFORMATION_REQ                
- [x] GW_GET_NODE_INFORMATION_CFM                
- [x] GW_GET_NODE_INFORMATION_NTF                
- [x] GW_GET_ALL_NODES_INFORMATION_REQ           
- [x] GW_GET_ALL_NODES_INFORMATION_CFM           
- [x] GW_GET_ALL_NODES_INFORMATION_NTF           
- [x] GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF  
- [x] GW_SET_NODE_VARIATION_REQ                  
- [x] GW_SET_NODE_VARIATION_CFM                  
- [x] GW_SET_NODE_NAME_REQ                       
- [x] GW_SET_NODE_NAME_CFM                       
- [x] GW_NODE_INFORMATION_CHANGED_NTF            
- [x] GW_NODE_STATE_POSITION_CHANGED_NTF         
- [x] GW_SET_NODE_ORDER_AND_PLACEMENT_REQ        
- [x] GW_SET_NODE_ORDER_AND_PLACEMENT_CFM        
- [x] GW_GET_GROUP_INFORMATION_REQ               
- [x] GW_GET_GROUP_INFORMATION_CFM               
- [x] GW_GET_GROUP_INFORMATION_NTF               
- [x] GW_SET_GROUP_INFORMATION_REQ               
- [x] GW_SET_GROUP_INFORMATION_CFM               
- [x] GW_GROUP_INFORMATION_CHANGED_NTF           
- [x] GW_DELETE_GROUP_REQ                        
- [x] GW_DELETE_GROUP_CFM                        
- [x] GW_NEW_GROUP_REQ                           
- [x] GW_NEW_GROUP_CFM                           
- [x] GW_GET_ALL_GROUPS_INFORMATION_REQ          
- [x] GW_GET_ALL_GROUPS_INFORMATION_CFM          
- [x] GW_GET_ALL_GROUPS_INFORMATION_NTF          
- [x] GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF 
- [x] GW_GROUP_DELETED_NTF                       
- [x] GW_HOUSE_STATUS_MONITOR_ENABLE_REQ         
- [x] GW_HOUSE_STATUS_MONITOR_ENABLE_CFM         
- [x] GW_HOUSE_STATUS_MONITOR_DISABLE_REQ        
- [x] GW_HOUSE_STATUS_MONITOR_DISABLE_CFM        
- [x] GW_COMMAND_SEND_REQ                        
- [x] GW_COMMAND_SEND_CFM                        
- [x] GW_COMMAND_RUN_STATUS_NTF                  
- [x] GW_COMMAND_REMAINING_TIME_NTF              
- [x] GW_SESSION_FINISHED_NTF                    
- [x] GW_STATUS_REQUEST_REQ                      
- [x] GW_STATUS_REQUEST_CFM                      
- [x] GW_STATUS_REQUEST_NTF                      
- [x] GW_WINK_SEND_REQ                           
- [x] GW_WINK_SEND_CFM                           
- [x] GW_WINK_SEND_NTF                           
- [x] GW_SET_LIMITATION_REQ                      
- [x] GW_SET_LIMITATION_CFM                      
- [x] ~~GW_GET_LIMITATION_STATUS_REQ~~ \(this one throws invalid frame error\)
- [x] GW_GET_LIMITATION_STATUS_CFM               
- [x] GW_LIMITATION_STATUS_NTF                   
- [x] GW_MODE_SEND_REQ                           
- [x] GW_MODE_SEND_CFM                           
- [ ] ~~GW_MODE_SEND_NTF~~ \(not documented and not received\)
- [x] GW_INITIALIZE_SCENE_REQ                    
- [x] GW_INITIALIZE_SCENE_CFM                    
- [x] GW_INITIALIZE_SCENE_NTF                    
- [x] GW_INITIALIZE_SCENE_CANCEL_REQ             
- [x] GW_INITIALIZE_SCENE_CANCEL_CFM             
- [x] GW_RECORD_SCENE_REQ                        
- [x] GW_RECORD_SCENE_CFM                        
- [x] GW_RECORD_SCENE_NTF                        
- [x] GW_DELETE_SCENE_REQ                        
- [x] GW_DELETE_SCENE_CFM                        
- [x] GW_RENAME_SCENE_REQ                        
- [x] GW_RENAME_SCENE_CFM                        
- [x] GW_GET_SCENE_LIST_REQ                      
- [x] GW_GET_SCENE_LIST_CFM                      
- [x] GW_GET_SCENE_LIST_NTF                      
- [x] GW_GET_SCENE_INFOAMATION_REQ               
- [x] GW_GET_SCENE_INFOAMATION_CFM               
- [x] GW_GET_SCENE_INFOAMATION_NTF               
- [x] GW_ACTIVATE_SCENE_REQ                      
- [x] GW_ACTIVATE_SCENE_CFM                      
- [x] GW_STOP_SCENE_REQ                          
- [x] GW_STOP_SCENE_CFM                          
- [x] GW_SCENE_INFORMATION_CHANGED_NTF           
- [x] GW_ACTIVATE_PRODUCTGROUP_REQ               
- [x] GW_ACTIVATE_PRODUCTGROUP_CFM               
- [ ] ~~GW_ACTIVATE_PRODUCTGROUP_NTF~~ \(not documented and not received\)
- [x] GW_GET_CONTACT_INPUT_LINK_LIST_REQ         
- [x] GW_GET_CONTACT_INPUT_LINK_LIST_CFM         
- [x] GW_SET_CONTACT_INPUT_LINK_REQ              
- [x] GW_SET_CONTACT_INPUT_LINK_CFM              
- [x] GW_REMOVE_CONTACT_INPUT_LINK_REQ           
- [x] GW_REMOVE_CONTACT_INPUT_LINK_CFM           
- [x] GW_GET_ACTIVATION_LOG_HEADER_REQ           
- [x] GW_GET_ACTIVATION_LOG_HEADER_CFM           
- [x] GW_CLEAR_ACTIVATION_LOG_REQ                
- [x] GW_CLEAR_ACTIVATION_LOG_CFM                
- [x] GW_GET_ACTIVATION_LOG_LINE_REQ             
- [x] GW_GET_ACTIVATION_LOG_LINE_CFM             
- [x] GW_ACTIVATION_LOG_UPDATED_NTF              
- [x] GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ   
- [x] GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF   
- [x] GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM   
- [x] GW_SET_UTC_REQ                             
- [x] GW_SET_UTC_CFM                             
- [x] GW_RTC_SET_TIME_ZONE_REQ                   
- [x] GW_RTC_SET_TIME_ZONE_CFM                   
- [x] GW_GET_LOCAL_TIME_REQ                      
- [x] GW_GET_LOCAL_TIME_CFM                      
- [x] GW_PASSWORD_ENTER_REQ                      
- [x] GW_PASSWORD_ENTER_CFM                      
- [x] GW_PASSWORD_CHANGE_REQ                     
- [x] GW_PASSWORD_CHANGE_CFM                     
- [x] GW_PASSWORD_CHANGE_NTF                     

## Changelog
### 3.0.0
* Completely reworked to support the official VELUX Socket-API

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

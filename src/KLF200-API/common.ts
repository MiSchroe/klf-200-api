import { getNextSessionID } from "./GW_COMMAND";

'use strict';

export const KLF200_PORT = 51200;

export enum GatewayCommand {
    GW_ERROR_NTF                               = 0x0000,    // Provides information on what triggered the error.
    GW_REBOOT_REQ                              = 0x0001,    // Request gateway to reboot.
    GW_REBOOT_CFM                              = 0x0002,    // Acknowledge to GW_REBOOT_REQ command.
    GW_SET_FACTORY_DEFAULT_REQ                 = 0x0003,    // Request gateway to clear system table, scene table and set Ethernet settings to factory default. Gateway will reboot.
    GW_SET_FACTORY_DEFAULT_CFM                 = 0x0004,    // Acknowledge to GW_SET_FACTORY_DEFAULT_REQ command.
    GW_GET_VERSION_REQ                         = 0x0008,    // Request version information.
    GW_GET_VERSION_CFM                         = 0x0009,    // Acknowledge to GW_GET_VERSION_REQ command.
    GW_GET_PROTOCOL_VERSION_REQ                = 0x000A,    // Request KLF 200 API protocol version.
    GW_GET_PROTOCOL_VERSION_CFM                = 0x000B,    // Acknowledge to GW_GET_PROTOCOL_VERSION_REQ command.
    GW_GET_STATE_REQ                           = 0x000C,    // Request the state of the gateway
    GW_GET_STATE_CFM                           = 0x000D,    // Acknowledge to GW_GET_STATE_REQ command.
    GW_LEAVE_LEARN_STATE_REQ                   = 0x000E,    // Request gateway to leave learn state.
    GW_LEAVE_LEARN_STATE_CFM                   = 0x000F,    // Acknowledge to GW_LEAVE_LEARN_STATE_REQ command.
    GW_GET_NETWORK_SETUP_REQ                   = 0x00E0,    // Request network parameters.
    GW_GET_NETWORK_SETUP_CFM                   = 0x00E1,    // Acknowledge to GW_GET_NETWORK_SETUP_REQ.
    GW_SET_NETWORK_SETUP_REQ                   = 0x00E2,    // Set network parameters.
    GW_SET_NETWORK_SETUP_CFM                   = 0x00E3,    // Acknowledge to GW_SET_NETWORK_SETUP_REQ.
    GW_CS_GET_SYSTEMTABLE_DATA_REQ             = 0x0100,    // Request a list of nodes in the gateways system table.
    GW_CS_GET_SYSTEMTABLE_DATA_CFM             = 0x0101,    // Acknowledge to GW_CS_GET_SYSTEMTABLE_DATA_REQ
    GW_CS_GET_SYSTEMTABLE_DATA_NTF             = 0x0102,    // Acknowledge to GW_CS_GET_SYSTEM_TABLE_DATA_REQList of nodes in the gateways systemtable.
    GW_CS_DISCOVER_NODES_REQ                   = 0x0103,    // Start CS DiscoverNodes macro in KLF200.
    GW_CS_DISCOVER_NODES_CFM                   = 0x0104,    // Acknowledge to GW_CS_DISCOVER_NODES_REQ command.
    GW_CS_DISCOVER_NODES_NTF                   = 0x0105,    // Acknowledge to GW_CS_DISCOVER_NODES_REQ command.
    GW_CS_REMOVE_NODES_REQ                     = 0x0106,    // Remove one or more nodes in the systemtable.
    GW_CS_REMOVE_NODES_CFM                     = 0x0107,    // Acknowledge to GW_CS_REMOVE_NODES_REQ.
    GW_CS_VIRGIN_STATE_REQ                     = 0x0108,    // Clear systemtable and delete system key.
    GW_CS_VIRGIN_STATE_CFM                     = 0x0109,    // Acknowledge to GW_CS_VIRGIN_STATE_REQ.
    GW_CS_CONTROLLER_COPY_REQ                  = 0x010A,    // Setup KLF200 to get or give a system to or from another io-homecontrol® remote control. By a system means all nodes in the systemtable and the system key.
    GW_CS_CONTROLLER_COPY_CFM                  = 0x010B,    // Acknowledge to GW_CS_CONTROLLER_COPY_REQ.
    GW_CS_CONTROLLER_COPY_NTF                  = 0x010C,    // Acknowledge to GW_CS_CONTROLLER_COPY_REQ.
    GW_CS_CONTROLLER_COPY_CANCEL_NTF           = 0x010D,    // Cancellation of system copy to other controllers.
    GW_CS_RECEIVE_KEY_REQ                      = 0x010E,    // Receive system key from another controller.
    GW_CS_RECEIVE_KEY_CFM                      = 0x010F,    // Acknowledge to GW_CS_RECEIVE_KEY_REQ.
    GW_CS_RECEIVE_KEY_NTF                      = 0x0110,    // Acknowledge to GW_CS_RECEIVE_KEY_REQ with status.
    GW_CS_PGC_JOB_NTF                          = 0x0111,    // Information on Product Generic Configuration job initiated by press on PGC button.
    GW_CS_SYSTEM_TABLE_UPDATE_NTF              = 0x0112,    // Broadcasted to all clients and gives information about added and removed actuator nodes in system table.
    GW_CS_GENERATE_NEW_KEY_REQ                 = 0x0113,    // Generate new system key and update actuators in systemtable.
    GW_CS_GENERATE_NEW_KEY_CFM                 = 0x0114,    // Acknowledge to GW_CS_GENERATE_NEW_KEY_REQ.
    GW_CS_GENERATE_NEW_KEY_NTF                 = 0x0115,    // Acknowledge to GW_CS_GENERATE_NEW_KEY_REQ with status.
    GW_CS_REPAIR_KEY_REQ                       = 0x0116,    // Update key in actuators holding an old key.
    GW_CS_REPAIR_KEY_CFM                       = 0x0117,    // Acknowledge to GW_CS_REPAIR_KEY_REQ.
    GW_CS_REPAIR_KEY_NTF                       = 0x0118,    // Acknowledge to GW_CS_REPAIR_KEY_REQ with status.
    GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ      = 0x0119,    // Request one or more actuator to open for configuration.
    GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM      = 0x011A,    // Acknowledge to GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ.
    GW_GET_NODE_INFORMATION_REQ                = 0x0200,    // Request extended information of one specific actuator node.
    GW_GET_NODE_INFORMATION_CFM                = 0x0201,    // Acknowledge to GW_GET_NODE_INFORMATION_REQ.
    GW_GET_NODE_INFORMATION_NTF                = 0x0210,    // Acknowledge to GW_GET_NODE_INFORMATION_REQ.
    GW_GET_ALL_NODES_INFORMATION_REQ           = 0x0202,    // Request extended information of all nodes.
    GW_GET_ALL_NODES_INFORMATION_CFM           = 0x0203,    // Acknowledge to GW_GET_ALL_NODES_INFORMATION_REQ
    GW_GET_ALL_NODES_INFORMATION_NTF           = 0x0204,    // Acknowledge to GW_GET_ALL_NODES_INFORMATION_REQ. Holds node information
    GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF  = 0x0205,    // Acknowledge to GW_GET_ALL_NODES_INFORMATION_REQ. No more nodes.
    GW_SET_NODE_VARIATION_REQ                  = 0x0206,    // Set node variation.
    GW_SET_NODE_VARIATION_CFM                  = 0x0207,    // Acknowledge to GW_SET_NODE_VARIATION_REQ.
    GW_SET_NODE_NAME_REQ                       = 0x0208,    // Set node name.
    GW_SET_NODE_NAME_CFM                       = 0x0209,    // Acknowledge to GW_SET_NODE_NAME_REQ.
    GW_SET_NODE_VELOCITY_REQ                   = 0x020A,    // Set node velocity.
    GW_SET_NODE_VELOCITY_CFM                   = 0x020B,    // Acknowledge to GW_SET_NODE_VELOCITY_REQ.
    GW_NODE_INFORMATION_CHANGED_NTF            = 0x020C,    // Information has been updated.
    GW_NODE_STATE_POSITION_CHANGED_NTF         = 0x0211,    // Information has been updated.
    GW_SET_NODE_ORDER_AND_PLACEMENT_REQ        = 0x020D,    // Set search order and room placement.
    GW_SET_NODE_ORDER_AND_PLACEMENT_CFM        = 0x020E,    // Acknowledge to GW_SET_NODE_ORDER_AND_PLACEMENT_REQ.
    GW_GET_GROUP_INFORMATION_REQ               = 0x0220,    // Request information about all defined groups.
    GW_GET_GROUP_INFORMATION_CFM               = 0x0221,    // Acknowledge to GW_GET_GROUP_INFORMATION_REQ.
    GW_GET_GROUP_INFORMATION_NTF               = 0x0230,    // Acknowledge to GW_GET_NODE_INFORMATION_REQ.
    GW_SET_GROUP_INFORMATION_REQ               = 0x0222,    // Change an existing group.
    GW_SET_GROUP_INFORMATION_CFM               = 0x0223,    // Acknowledge to GW_SET_GROUP_INFORMATION_REQ.
    GW_GROUP_INFORMATION_CHANGED_NTF           = 0x0224,    // Broadcast to all, about group information of a group has been changed.
    GW_DELETE_GROUP_REQ                        = 0x0225,    // Delete a group.
    GW_DELETE_GROUP_CFM                        = 0x0226,    // Acknowledge to GW_DELETE_GROUP_INFORMATION_REQ.
    GW_NEW_GROUP_REQ                           = 0x0227,    // Request new group to be created.
    GW_NEW_GROUP_CFM                           = 0x0228,    //
    GW_GET_ALL_GROUPS_INFORMATION_REQ          = 0x0229,    // Request information about all defined groups.
    GW_GET_ALL_GROUPS_INFORMATION_CFM          = 0x022A,    // Acknowledge to GW_GET_ALL_GROUPS_INFORMATION_REQ.
    GW_GET_ALL_GROUPS_INFORMATION_NTF          = 0x022B,    // Acknowledge to GW_GET_ALL_GROUPS_INFORMATION_REQ.
    GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF = 0x022C,    // Acknowledge to GW_GET_ALL_GROUPS_INFORMATION_REQ.
    GW_GROUP_DELETED_NTF                       = 0x022D,    // GW_GROUP_DELETED_NTF is broadcasted to all, when a group has been removed.
    GW_HOUSE_STATUS_MONITOR_ENABLE_REQ         = 0x0240,    // Enable house status monitor.
    GW_HOUSE_STATUS_MONITOR_ENABLE_CFM         = 0x0241,    // Acknowledge to GW_HOUSE_STATUS_MONITOR_ENABLE_REQ.
    GW_HOUSE_STATUS_MONITOR_DISABLE_REQ        = 0x0242,    // Disable house status monitor.
    GW_HOUSE_STATUS_MONITOR_DISABLE_CFM        = 0x0243,    // Acknowledge to GW_HOUSE_STATUS_MONITOR_DISABLE_REQ.
    GW_COMMAND_SEND_REQ                        = 0x0300,    // Send activating command direct to one or more io-homecontrol® nodes.
    GW_COMMAND_SEND_CFM                        = 0x0301,    // Acknowledge to GW_COMMAND_SEND_REQ.
    GW_COMMAND_RUN_STATUS_NTF                  = 0x0302,    // Gives run status for io-homecontrol® node.
    GW_COMMAND_REMAINING_TIME_NTF              = 0x0303,    // Gives remaining time before io-homecontrol® node enter target position.
    GW_SESSION_FINISHED_NTF                    = 0x0304,    // Command send, Status request, Wink, Mode or Stop session is finished.
    GW_STATUS_REQUEST_REQ                      = 0x0305,    // Get status request from one or more io-homecontrol® nodes.
    GW_STATUS_REQUEST_CFM                      = 0x0306,    // Acknowledge to GW_STATUS_REQUEST_REQ.
    GW_STATUS_REQUEST_NTF                      = 0x0307,    // Acknowledge to GW_STATUS_REQUEST_REQ. Status request from one or more io-homecontrol® nodes.
    GW_WINK_SEND_REQ                           = 0x0308,    // Request from one or more io-homecontrol® nodes to Wink.
    GW_WINK_SEND_CFM                           = 0x0309,    // Acknowledge to GW_WINK_SEND_REQ
    GW_WINK_SEND_NTF                           = 0x030A,    // Status info for performed wink request.
    GW_SET_LIMITATION_REQ                      = 0x0310,    // Set a parameter limitation in an actuator.
    GW_SET_LIMITATION_CFM                      = 0x0311,    // Acknowledge to GW_SET_LIMITATION_REQ.
    GW_GET_LIMITATION_STATUS_REQ               = 0x0312,    // Get parameter limitation in an actuator.
    GW_GET_LIMITATION_STATUS_CFM               = 0x0313,    // Acknowledge to GW_GET_LIMITATION_STATUS_REQ.
    GW_LIMITATION_STATUS_NTF                   = 0x0314,    // Hold information about limitation.
    GW_MODE_SEND_REQ                           = 0x0320,    // Send Activate Mode to one or more io-homecontrol® nodes.
    GW_MODE_SEND_CFM                           = 0x0321,    // Acknowledge to GW_MODE_SEND_REQ
    GW_MODE_SEND_NTF                           = 0x0322,    // Notify with Mode activation info.
    GW_INITIALIZE_SCENE_REQ                    = 0x0400,    // Prepare gateway to record a scene.
    GW_INITIALIZE_SCENE_CFM                    = 0x0401,    // Acknowledge to GW_INITIALIZE_SCENE_REQ.
    GW_INITIALIZE_SCENE_NTF                    = 0x0402,    // Acknowledge to GW_INITIALIZE_SCENE_REQ.
    GW_INITIALIZE_SCENE_CANCEL_REQ             = 0x0403,    // Cancel record scene process.
    GW_INITIALIZE_SCENE_CANCEL_CFM             = 0x0404,    // Acknowledge to GW_INITIALIZE_SCENE_CANCEL_REQ command.
    GW_RECORD_SCENE_REQ                        = 0x0405,    // Store actuator positions changes since GW_INITIALIZE_SCENE, as a scene.
    GW_RECORD_SCENE_CFM                        = 0x0406,    // Acknowledge to GW_RECORD_SCENE_REQ.
    GW_RECORD_SCENE_NTF                        = 0x0407,    // Acknowledge to GW_RECORD_SCENE_REQ.
    GW_DELETE_SCENE_REQ                        = 0x0408,    // Delete a recorded scene.
    GW_DELETE_SCENE_CFM                        = 0x0409,    // Acknowledge to GW_DELETE_SCENE_REQ.
    GW_RENAME_SCENE_REQ                        = 0x040A,    // Request a scene to be renamed.
    GW_RENAME_SCENE_CFM                        = 0x040B,    // Acknowledge to GW_RENAME_SCENE_REQ.
    GW_GET_SCENE_LIST_REQ                      = 0x040C,    // Request a list of scenes.
    GW_GET_SCENE_LIST_CFM                      = 0x040D,    // Acknowledge to GW_GET_SCENE_LIST.
    GW_GET_SCENE_LIST_NTF                      = 0x040E,    // Acknowledge to GW_GET_SCENE_LIST.
    GW_GET_SCENE_INFORMATION_REQ               = 0x040F,    // Request extended information for one given scene.
    GW_GET_SCENE_INFORMATION_CFM               = 0x0410,    // Acknowledge to GW_GET_SCENE_INFOAMATION_REQ.
    GW_GET_SCENE_INFORMATION_NTF               = 0x0411,    // Acknowledge to GW_GET_SCENE_INFOAMATION_REQ.
    GW_ACTIVATE_SCENE_REQ                      = 0x0412,    // Request gateway to enter a scene.
    GW_ACTIVATE_SCENE_CFM                      = 0x0413,    // Acknowledge to GW_ACTIVATE_SCENE_REQ.
    GW_STOP_SCENE_REQ                          = 0x0415,    // Request all nodes in a given scene to stop at their current position.
    GW_STOP_SCENE_CFM                          = 0x0416,    // Acknowledge to GW_STOP_SCENE_REQ.
    GW_SCENE_INFORMATION_CHANGED_NTF           = 0x0419,    // A scene has either been changed or removed.
    GW_ACTIVATE_PRODUCTGROUP_REQ               = 0x0447,    // Activate a product group in a given direction.
    GW_ACTIVATE_PRODUCTGROUP_CFM               = 0x0448,    // Acknowledge to GW_ACTIVATE_PRODUCTGROUP_REQ.
    GW_ACTIVATE_PRODUCTGROUP_NTF               = 0x0449,    // Acknowledge to GW_ACTIVATE_PRODUCTGROUP_REQ.
    GW_GET_CONTACT_INPUT_LINK_LIST_REQ         = 0x0460,    // Get list of assignments to all Contact Input to scene or product group.
    GW_GET_CONTACT_INPUT_LINK_LIST_CFM         = 0x0461,    // Acknowledge to GW_GET_CONTACT_INPUT_LINK_LIST_REQ.
    GW_SET_CONTACT_INPUT_LINK_REQ              = 0x0462,    // Set a link from a Contact Input to a scene or product group.
    GW_SET_CONTACT_INPUT_LINK_CFM              = 0x0463,    // Acknowledge to GW_SET_CONTACT_INPUT_LINK_REQ.
    GW_REMOVE_CONTACT_INPUT_LINK_REQ           = 0x0464,    // Remove a link from a Contact Input to a scene.
    GW_REMOVE_CONTACT_INPUT_LINK_CFM           = 0x0465,    // Acknowledge to GW_REMOVE_CONTACT_INPUT_LINK_REQ.
    GW_GET_ACTIVATION_LOG_HEADER_REQ           = 0x0500,    // Request header from activation log.
    GW_GET_ACTIVATION_LOG_HEADER_CFM           = 0x0501,    // Confirm header from activation log.
    GW_CLEAR_ACTIVATION_LOG_REQ                = 0x0502,    // Request clear all data in activation log.
    GW_CLEAR_ACTIVATION_LOG_CFM                = 0x0503,    // Confirm clear all data in activation log.
    GW_GET_ACTIVATION_LOG_LINE_REQ             = 0x0504,    // Request line from activation log.
    GW_GET_ACTIVATION_LOG_LINE_CFM             = 0x0505,    // Confirm line from activation log.
    GW_ACTIVATION_LOG_UPDATED_NTF              = 0x0506,    // Confirm line from activation log.
    GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ   = 0x0507,    // Request lines from activation log.
    GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF   = 0x0508,    // Error log data from activation log.
    GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM   = 0x0509,    // Confirm lines from activation log.
    GW_SET_UTC_REQ                             = 0x2000,    // Request to set UTC time.
    GW_SET_UTC_CFM                             = 0x2001,    // Acknowledge to GW_SET_UTC_REQ.
    GW_RTC_SET_TIME_ZONE_REQ                   = 0x2002,    // Set time zone and daylight savings rules.
    GW_RTC_SET_TIME_ZONE_CFM                   = 0x2003,    // Acknowledge to GW_RTC_SET_TIME_ZONE_REQ.
    GW_GET_LOCAL_TIME_REQ                      = 0x2004,    // Request the local time based on current time zone and daylight savings rules.
    GW_GET_LOCAL_TIME_CFM                      = 0x2005,    // Acknowledge to GW_RTC_SET_TIME_ZONE_REQ.
    GW_PASSWORD_ENTER_REQ                      = 0x3000,    // Enter password to authenticate request
    GW_PASSWORD_ENTER_CFM                      = 0x3001,    // Acknowledge to GW_PASSWORD_ENTER_REQ
    GW_PASSWORD_CHANGE_REQ                     = 0x3002,    // Request password change.
    GW_PASSWORD_CHANGE_CFM                     = 0x3003,    // Acknowledge to GW_PASSWORD_CHANGE_REQ.
    GW_PASSWORD_CHANGE_NTF                     = 0x3004     // Acknowledge to GW_PASSWORD_CHANGE_REQ. Broadcasted to all connected clients.
}

export type GatewayCommand_Request =
      GatewayCommand.GW_REBOOT_REQ                             
    | GatewayCommand.GW_SET_FACTORY_DEFAULT_REQ                
    | GatewayCommand.GW_GET_VERSION_REQ                        
    | GatewayCommand.GW_GET_PROTOCOL_VERSION_REQ               
    | GatewayCommand.GW_GET_STATE_REQ                          
    | GatewayCommand.GW_LEAVE_LEARN_STATE_REQ                  
    | GatewayCommand.GW_GET_NETWORK_SETUP_REQ                  
    | GatewayCommand.GW_SET_NETWORK_SETUP_REQ                  
    | GatewayCommand.GW_CS_GET_SYSTEMTABLE_DATA_REQ            
    | GatewayCommand.GW_CS_DISCOVER_NODES_REQ                  
    | GatewayCommand.GW_CS_REMOVE_NODES_REQ                    
    | GatewayCommand.GW_CS_VIRGIN_STATE_REQ                    
    | GatewayCommand.GW_CS_CONTROLLER_COPY_REQ                 
    | GatewayCommand.GW_CS_RECEIVE_KEY_REQ                     
    | GatewayCommand.GW_CS_GENERATE_NEW_KEY_REQ                
    | GatewayCommand.GW_CS_REPAIR_KEY_REQ                      
    | GatewayCommand.GW_CS_ACTIVATE_CONFIGURATION_MODE_REQ     
    | GatewayCommand.GW_GET_NODE_INFORMATION_REQ               
    | GatewayCommand.GW_GET_ALL_NODES_INFORMATION_REQ          
    | GatewayCommand.GW_SET_NODE_VARIATION_REQ                 
    | GatewayCommand.GW_SET_NODE_NAME_REQ                      
    | GatewayCommand.GW_SET_NODE_VELOCITY_REQ                  
    | GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_REQ       
    | GatewayCommand.GW_GET_GROUP_INFORMATION_REQ              
    | GatewayCommand.GW_SET_GROUP_INFORMATION_REQ              
    | GatewayCommand.GW_DELETE_GROUP_REQ                       
    | GatewayCommand.GW_NEW_GROUP_REQ                          
    | GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_REQ         
    | GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_REQ        
    | GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_REQ       
    | GatewayCommand.GW_COMMAND_SEND_REQ                       
    | GatewayCommand.GW_STATUS_REQUEST_REQ                     
    | GatewayCommand.GW_WINK_SEND_REQ                          
    | GatewayCommand.GW_SET_LIMITATION_REQ                     
    | GatewayCommand.GW_GET_LIMITATION_STATUS_REQ              
    | GatewayCommand.GW_MODE_SEND_REQ                          
    | GatewayCommand.GW_INITIALIZE_SCENE_REQ                   
    | GatewayCommand.GW_INITIALIZE_SCENE_CANCEL_REQ            
    | GatewayCommand.GW_RECORD_SCENE_REQ                       
    | GatewayCommand.GW_DELETE_SCENE_REQ                       
    | GatewayCommand.GW_RENAME_SCENE_REQ                       
    | GatewayCommand.GW_GET_SCENE_LIST_REQ                     
    | GatewayCommand.GW_GET_SCENE_INFORMATION_REQ              
    | GatewayCommand.GW_ACTIVATE_SCENE_REQ                     
    | GatewayCommand.GW_STOP_SCENE_REQ                         
    | GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_REQ              
    | GatewayCommand.GW_GET_CONTACT_INPUT_LINK_LIST_REQ        
    | GatewayCommand.GW_SET_CONTACT_INPUT_LINK_REQ             
    | GatewayCommand.GW_REMOVE_CONTACT_INPUT_LINK_REQ          
    | GatewayCommand.GW_GET_ACTIVATION_LOG_HEADER_REQ          
    | GatewayCommand.GW_CLEAR_ACTIVATION_LOG_REQ               
    | GatewayCommand.GW_GET_ACTIVATION_LOG_LINE_REQ            
    | GatewayCommand.GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_REQ  
    | GatewayCommand.GW_SET_UTC_REQ                            
    | GatewayCommand.GW_RTC_SET_TIME_ZONE_REQ                  
    | GatewayCommand.GW_GET_LOCAL_TIME_REQ                     
    | GatewayCommand.GW_PASSWORD_ENTER_REQ                     
    | GatewayCommand.GW_PASSWORD_CHANGE_REQ                    
    ;

export type GatewayCommand_Confirmation =
      GatewayCommand.GW_REBOOT_CFM                             
    | GatewayCommand.GW_SET_FACTORY_DEFAULT_CFM                
    | GatewayCommand.GW_GET_VERSION_CFM                        
    | GatewayCommand.GW_GET_PROTOCOL_VERSION_CFM               
    | GatewayCommand.GW_GET_STATE_CFM                          
    | GatewayCommand.GW_LEAVE_LEARN_STATE_CFM                  
    | GatewayCommand.GW_GET_NETWORK_SETUP_CFM                  
    | GatewayCommand.GW_SET_NETWORK_SETUP_CFM                  
    | GatewayCommand.GW_CS_GET_SYSTEMTABLE_DATA_CFM            
    | GatewayCommand.GW_CS_DISCOVER_NODES_CFM                  
    | GatewayCommand.GW_CS_REMOVE_NODES_CFM                    
    | GatewayCommand.GW_CS_VIRGIN_STATE_CFM                    
    | GatewayCommand.GW_CS_CONTROLLER_COPY_CFM                 
    | GatewayCommand.GW_CS_RECEIVE_KEY_CFM                     
    | GatewayCommand.GW_CS_GENERATE_NEW_KEY_CFM                
    | GatewayCommand.GW_CS_REPAIR_KEY_CFM                      
    | GatewayCommand.GW_CS_ACTIVATE_CONFIGURATION_MODE_CFM     
    | GatewayCommand.GW_GET_NODE_INFORMATION_CFM               
    | GatewayCommand.GW_GET_ALL_NODES_INFORMATION_CFM          
    | GatewayCommand.GW_SET_NODE_VARIATION_CFM                 
    | GatewayCommand.GW_SET_NODE_NAME_CFM                      
    | GatewayCommand.GW_SET_NODE_VELOCITY_CFM                  
    | GatewayCommand.GW_SET_NODE_ORDER_AND_PLACEMENT_CFM       
    | GatewayCommand.GW_GET_GROUP_INFORMATION_CFM              
    | GatewayCommand.GW_SET_GROUP_INFORMATION_CFM              
    | GatewayCommand.GW_DELETE_GROUP_CFM                       
    | GatewayCommand.GW_NEW_GROUP_CFM                          
    | GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_CFM         
    | GatewayCommand.GW_HOUSE_STATUS_MONITOR_ENABLE_CFM        
    | GatewayCommand.GW_HOUSE_STATUS_MONITOR_DISABLE_CFM       
    | GatewayCommand.GW_COMMAND_SEND_CFM                       
    | GatewayCommand.GW_STATUS_REQUEST_CFM                     
    | GatewayCommand.GW_WINK_SEND_CFM                          
    | GatewayCommand.GW_SET_LIMITATION_CFM                     
    | GatewayCommand.GW_GET_LIMITATION_STATUS_CFM              
    | GatewayCommand.GW_MODE_SEND_CFM                          
    | GatewayCommand.GW_INITIALIZE_SCENE_CFM                   
    | GatewayCommand.GW_INITIALIZE_SCENE_CANCEL_CFM            
    | GatewayCommand.GW_RECORD_SCENE_CFM                       
    | GatewayCommand.GW_DELETE_SCENE_CFM                       
    | GatewayCommand.GW_RENAME_SCENE_CFM                       
    | GatewayCommand.GW_GET_SCENE_LIST_CFM                     
    | GatewayCommand.GW_GET_SCENE_INFORMATION_CFM              
    | GatewayCommand.GW_ACTIVATE_SCENE_CFM                     
    | GatewayCommand.GW_STOP_SCENE_CFM                         
    | GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_CFM              
    | GatewayCommand.GW_GET_CONTACT_INPUT_LINK_LIST_CFM        
    | GatewayCommand.GW_SET_CONTACT_INPUT_LINK_CFM             
    | GatewayCommand.GW_REMOVE_CONTACT_INPUT_LINK_CFM          
    | GatewayCommand.GW_GET_ACTIVATION_LOG_HEADER_CFM          
    | GatewayCommand.GW_CLEAR_ACTIVATION_LOG_CFM               
    | GatewayCommand.GW_GET_ACTIVATION_LOG_LINE_CFM            
    | GatewayCommand.GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_CFM  
    | GatewayCommand.GW_SET_UTC_CFM                            
    | GatewayCommand.GW_RTC_SET_TIME_ZONE_CFM                  
    | GatewayCommand.GW_GET_LOCAL_TIME_CFM                     
    | GatewayCommand.GW_PASSWORD_ENTER_CFM                     
    | GatewayCommand.GW_PASSWORD_CHANGE_CFM                    
    ;

export type GatewayCommand_Notification =
      GatewayCommand.GW_ERROR_NTF
    | GatewayCommand.GW_CS_GET_SYSTEMTABLE_DATA_NTF            
    | GatewayCommand.GW_CS_DISCOVER_NODES_NTF                  
    | GatewayCommand.GW_CS_CONTROLLER_COPY_NTF                 
    | GatewayCommand.GW_CS_CONTROLLER_COPY_CANCEL_NTF          
    | GatewayCommand.GW_CS_RECEIVE_KEY_NTF                     
    | GatewayCommand.GW_CS_PGC_JOB_NTF                         
    | GatewayCommand.GW_CS_SYSTEM_TABLE_UPDATE_NTF             
    | GatewayCommand.GW_CS_GENERATE_NEW_KEY_NTF                
    | GatewayCommand.GW_CS_REPAIR_KEY_NTF                      
    | GatewayCommand.GW_GET_NODE_INFORMATION_NTF               
    | GatewayCommand.GW_GET_ALL_NODES_INFORMATION_NTF          
    | GatewayCommand.GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF 
    | GatewayCommand.GW_NODE_INFORMATION_CHANGED_NTF           
    | GatewayCommand.GW_NODE_STATE_POSITION_CHANGED_NTF        
    | GatewayCommand.GW_GET_GROUP_INFORMATION_NTF              
    | GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF          
    | GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF         
    | GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF
    | GatewayCommand.GW_GROUP_DELETED_NTF                      
    | GatewayCommand.GW_COMMAND_RUN_STATUS_NTF                 
    | GatewayCommand.GW_COMMAND_REMAINING_TIME_NTF             
    | GatewayCommand.GW_SESSION_FINISHED_NTF                   
    | GatewayCommand.GW_STATUS_REQUEST_NTF                     
    | GatewayCommand.GW_WINK_SEND_NTF                          
    | GatewayCommand.GW_LIMITATION_STATUS_NTF                  
    | GatewayCommand.GW_MODE_SEND_NTF                          
    | GatewayCommand.GW_INITIALIZE_SCENE_NTF                   
    | GatewayCommand.GW_RECORD_SCENE_NTF                       
    | GatewayCommand.GW_GET_SCENE_LIST_NTF                     
    | GatewayCommand.GW_GET_SCENE_INFORMATION_NTF              
    | GatewayCommand.GW_SCENE_INFORMATION_CHANGED_NTF          
    | GatewayCommand.GW_ACTIVATE_PRODUCTGROUP_NTF              
    | GatewayCommand.GW_ACTIVATION_LOG_UPDATED_NTF             
    | GatewayCommand.GW_GET_MULTIPLE_ACTIVATION_LOG_LINES_NTF  
    | GatewayCommand.GW_PASSWORD_CHANGE_NTF                    
    ;

export type GatewayCommand_Receive = GatewayCommand_Confirmation | GatewayCommand_Notification;

export enum GW_COMMON_STATUS {
    SUCCESS = 0,
    ERROR   = 1,
    INVALID_NODE_ID = 2
}

export enum GW_INVERSE_STATUS {
    ERROR = 0,
    SUCCESS = 1
}

const C_COMMAND_SIZE: number = 2;
const C_BUFFERLEN_SIZE: number = 1;

export const C_MAX_PWD_LENGTH = 32;

export interface IGW_FRAME {
    readonly Command: GatewayCommand;
}

export interface IGW_FRAME_REQ extends IGW_FRAME {
    readonly Data: Buffer;
}

export interface IGW_FRAME_RCV extends IGW_FRAME {
}
export interface IGW_FRAME_RCV_CTOR {
    new (Data: Buffer): IGW_FRAME_RCV;
}

export interface IGW_FRAME_CFM extends IGW_FRAME_RCV {
}
export interface IGW_FRAME_NTF extends IGW_FRAME_RCV {
}

export interface IGW_FRAME_COMMAND extends IGW_FRAME {
    readonly SessionID: number;
}

export abstract class GW_FRAME implements IGW_FRAME {
    readonly Command: GatewayCommand = GatewayCommand[<keyof typeof GatewayCommand>this.constructor.name];
    protected readonly offset = C_BUFFERLEN_SIZE + C_COMMAND_SIZE;

    protected constructor() {}
}

export abstract class GW_FRAME_REQ extends GW_FRAME implements IGW_FRAME_REQ {
    /**
     * Allocates a buffer in the right size for the frame.
     * The first byte contains the buffer length.
     * The next two bytes of the buffer are used for the command.
     * The remaining bytes are for the data.
     * 
     * A size of 0 means that the command has no further data.
     *
     * @protected
     * @abstract
     * @param {number} BufferSize Size for the buffer for the data part without length and command.
     * @param {boolean} CopyData Set to true to copy the data in case of reallocating the buffer. Default is true.
     * @memberof GW_FRAME
     */
    protected AllocBuffer(BufferSize: number, CopyData = true): void {
        const oldData = this.data;
        this.data = Buffer.alloc(BufferSize + this.offset);
        this.data.writeUInt16BE(this.Command, C_BUFFERLEN_SIZE);
        this.data.writeUInt8(this.data.byteLength, 0);

        if (typeof oldData !== "undefined" && CopyData === true) {
            // Copy old data into new buffer
            const copyBufferLength = Math.min(oldData.byteLength, this.data.byteLength) - this.offset;
            if (copyBufferLength > 0) {
                oldData.copy(this.data, this.offset, this.offset, this.offset + copyBufferLength);
            }
        }
    }

    protected abstract InitializeBuffer(): void;

    private data: Buffer | undefined;
    public get Data(): Buffer {
        if (typeof this.data === "undefined")
            this.InitializeBuffer();
        return <Buffer>this.data;
    }
}

export abstract class GW_FRAME_COMMAND_REQ extends GW_FRAME_REQ implements IGW_FRAME_COMMAND {
    public readonly SessionID: number;

    constructor() {
        super();

        this.SessionID = getNextSessionID();
    }
}

export abstract class GW_FRAME_RCV extends GW_FRAME implements IGW_FRAME_RCV {
    public constructor(readonly Data: Buffer) {
        super();
        const command = <GatewayCommand_Receive>Data.readUInt16BE(C_BUFFERLEN_SIZE);

        // Check command
        this.CheckCommand(command);

        // Remove command and length from Buffer
        this.Data = Data.slice(C_BUFFERLEN_SIZE + C_COMMAND_SIZE);
    }

    private CheckCommand(command: GatewayCommand_Receive) {
        //const className = <keyof typeof GatewayCommand>this.constructor.name;
        if (command !== this.Command)
            throw `Command from buffer (${command}) doesn't match command of frame (${this.Command}).`;
    }
}

export abstract class GW_FRAME_CFM extends GW_FRAME_RCV implements IGW_FRAME_CFM {
}

export abstract class GW_FRAME_NTF extends GW_FRAME_RCV implements IGW_FRAME_NTF {
}

/**
 * Reads a zero-terminated string from the buffer.
 *
 * @export
 * @param {Buffer} data The buffer that contains the string data.
 * @returns {string} Returns the string data.
 */
export function readZString(data: Buffer): string {
    return data.toString("utf8").split("\0", 1)[0];
}

export class KLF200Protocol {
    static readonly ProtocolID = 0;

    static Encode(data: Buffer): Buffer {
        const result = Buffer.alloc(data.byteLength + 2);   // +1 for ProtocolID and +1 for CRC byte

        // Set ProtocolID
        result.writeUInt8(this.ProtocolID, 0);

        // Write data
        data.copy(result, 1);

        // Calculate CRC
        let CRC = 0;
        for (let index = 0; index < result.byteLength - 1; index++) {
            CRC ^= result[index];
        }

        // Write CRC
        result.writeUInt8(CRC, result.byteLength - 1);

        return result;
    }

    static Decode(data: Buffer): Buffer {
        // Check ProtocolID
        if (data[0] !== this.ProtocolID) {
            throw "Invalid ProtocolID.";
        }

        // Calculate CRC
        let CRC = 0;
        for (let index = 0; index < data.byteLength - 1; index++) {
            CRC ^= data[index];
        }
        if (CRC !== data[data.byteLength - 1]) {
            throw "CRC error";
        }

        const result = Buffer.alloc(data.byteLength - 2);
        data.copy(result, 0, 1, data.byteLength - 1);

        return result;
    }
}

export const SLIP_END = 0xC0;
const SLIP_ESC = 0xDB;
const SLIP_ESC_END = 0xDC;
const SLIP_ESC_ESC = 0xDD;

export class SLIPProtocol {
    static Encode(data: Buffer): Buffer {
        const resultBuffer = Buffer.alloc(data.byteLength * 2 + 2);   // Max. possible size if all bytes have to be prefixed
        let resultLength = 0;

        // Write END mark
        resultBuffer[resultLength++] = SLIP_END;

        // Mask END and ESC characters
        for (let i = 0; i < data.byteLength; i++) {
            const dataByte = data[i];
            switch (dataByte) {
                case SLIP_END:
                    resultBuffer.writeUInt8(SLIP_ESC, resultLength++);
                    resultBuffer.writeUInt8(SLIP_ESC_END, resultLength++);
                    break;

                case SLIP_ESC:
                    resultBuffer.writeUInt8(SLIP_ESC, resultLength++);
                    resultBuffer.writeUInt8(SLIP_ESC_ESC, resultLength++);
                    break;
            
                default:
                    resultBuffer.writeUInt8(dataByte, resultLength++);
                    break;
            }
        }

        // Write END mark
        resultBuffer[resultLength++] = SLIP_END;

        return resultBuffer.slice(0, resultLength);
    }

    static Decode(data: Buffer): Buffer {
        // Check END mark at start and END
        if (data[0] !== SLIP_END || data[data.byteLength - 1] !== SLIP_END)
            throw "Missing END mark.";

        const resultBuffer = Buffer.alloc(data.byteLength - 2);     // Max. possible size without END mark at start and end
        let resultLength = 0;

        for (let i = 1; i < data.byteLength - 1; i++) {
            const dataByte = data[i];
            
            switch (dataByte) {
                case SLIP_ESC:
                    const nextDataByte = data[++i];
                    switch (nextDataByte) {
                        case SLIP_ESC_ESC:
                            resultBuffer.writeUInt8(SLIP_ESC, resultLength++);
                            break;

                        case SLIP_ESC_END:
                            resultBuffer.writeUInt8(SLIP_END, resultLength++);
                            break;
                    
                        default:
                            throw "Invalid SLIP special character.";
                    }
                    break;
            
                default:
                    resultBuffer.writeUInt8(dataByte, resultLength++);
                    break;
            }
        }

        return resultBuffer.slice(0, resultLength);
    }
}

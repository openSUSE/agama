//! D-Bus interface proxy for: `org.freedesktop.NetworkManager`
//!
//! This code was generated by `zbus-xmlgen` `3.1.0` from DBus introspection data.
//!
//! These D-Bus objects implements
//! [standard D-Bus interfaces](https://dbus.freedesktop.org/doc/dbus-specification.html),
//! (`org.freedesktop.DBus.*`) for which the following zbus proxies can be used:
//!
//! * [`zbus::fdo::PropertiesProxy`]
//! * [`zbus::fdo::IntrospectableProxy`]
//!
//! …consequently `zbus-xmlgen` did not generate code for the above interfaces.
//! Also some proxies can be used against multiple services when they share interface.

use agama_lib::dbus::OwnedNestedHash;
use zbus::dbus_proxy;

#[dbus_proxy(
    interface = "org.freedesktop.NetworkManager",
    default_service = "org.freedesktop.NetworkManager",
    default_path = "/org/freedesktop/NetworkManager",
    gen_blocking = false
)]
trait NetworkManager {
    /// ActivateConnection method
    fn activate_connection(
        &self,
        connection: &zbus::zvariant::ObjectPath<'_>,
        device: &zbus::zvariant::ObjectPath<'_>,
        specific_object: &zbus::zvariant::ObjectPath<'_>,
    ) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// AddAndActivateConnection method
    fn add_and_activate_connection(
        &self,
        connection: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
        device: &zbus::zvariant::ObjectPath<'_>,
        specific_object: &zbus::zvariant::ObjectPath<'_>,
    ) -> zbus::Result<(
        zbus::zvariant::OwnedObjectPath,
        zbus::zvariant::OwnedObjectPath,
    )>;

    /// AddAndActivateConnection2 method
    fn add_and_activate_connection2(
        &self,
        connection: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
        device: &zbus::zvariant::ObjectPath<'_>,
        specific_object: &zbus::zvariant::ObjectPath<'_>,
        options: std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
    ) -> zbus::Result<(
        zbus::zvariant::OwnedObjectPath,
        zbus::zvariant::OwnedObjectPath,
        std::collections::HashMap<String, zbus::zvariant::OwnedValue>,
    )>;

    /// CheckConnectivity method
    fn check_connectivity(&self) -> zbus::Result<u32>;

    /// CheckpointAdjustRollbackTimeout method
    fn checkpoint_adjust_rollback_timeout(
        &self,
        checkpoint: &zbus::zvariant::ObjectPath<'_>,
        add_timeout: u32,
    ) -> zbus::Result<()>;

    /// CheckpointCreate method
    fn checkpoint_create(
        &self,
        devices: &[zbus::zvariant::ObjectPath<'_>],
        rollback_timeout: u32,
        flags: u32,
    ) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// CheckpointDestroy method
    fn checkpoint_destroy(&self, checkpoint: &zbus::zvariant::ObjectPath<'_>) -> zbus::Result<()>;

    /// CheckpointRollback method
    fn checkpoint_rollback(
        &self,
        checkpoint: &zbus::zvariant::ObjectPath<'_>,
    ) -> zbus::Result<std::collections::HashMap<String, u32>>;

    /// DeactivateConnection method
    fn deactivate_connection(
        &self,
        active_connection: &zbus::zvariant::ObjectPath<'_>,
    ) -> zbus::Result<()>;

    /// Enable method
    fn enable(&self, enable: bool) -> zbus::Result<()>;

    /// GetAllDevices method
    fn get_all_devices(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// GetDeviceByIpIface method
    fn get_device_by_ip_iface(&self, iface: &str) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// GetDevices method
    fn get_devices(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// GetLogging method
    fn get_logging(&self) -> zbus::Result<(String, String)>;

    /// GetPermissions method
    fn get_permissions(&self) -> zbus::Result<std::collections::HashMap<String, String>>;

    /// Reload method
    fn reload(&self, flags: u32) -> zbus::Result<()>;

    /// SetLogging method
    fn set_logging(&self, level: &str, domains: &str) -> zbus::Result<()>;

    /// Sleep method
    fn sleep(&self, sleep: bool) -> zbus::Result<()>;

    /// CheckPermissions signal
    #[dbus_proxy(signal)]
    fn check_permissions(&self) -> zbus::Result<()>;

    /// DeviceAdded signal
    #[dbus_proxy(signal)]
    fn device_added(&self, device_path: zbus::zvariant::ObjectPath<'_>) -> zbus::Result<()>;

    /// DeviceRemoved signal
    #[dbus_proxy(signal)]
    fn device_removed(&self, device_path: zbus::zvariant::ObjectPath<'_>) -> zbus::Result<()>;

    /// ActivatingConnection property
    #[dbus_proxy(property)]
    fn activating_connection(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// ActiveConnections property
    #[dbus_proxy(property)]
    fn active_connections(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// AllDevices property
    #[dbus_proxy(property)]
    fn all_devices(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// Capabilities property
    #[dbus_proxy(property)]
    fn capabilities(&self) -> zbus::Result<Vec<u32>>;

    /// Checkpoints property
    #[dbus_proxy(property)]
    fn checkpoints(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// Connectivity property
    #[dbus_proxy(property)]
    fn connectivity(&self) -> zbus::Result<u32>;

    /// ConnectivityCheckAvailable property
    #[dbus_proxy(property)]
    fn connectivity_check_available(&self) -> zbus::Result<bool>;

    /// ConnectivityCheckEnabled property
    #[dbus_proxy(property)]
    fn connectivity_check_enabled(&self) -> zbus::Result<bool>;
    #[dbus_proxy(property)]
    fn set_connectivity_check_enabled(&self, value: bool) -> zbus::Result<()>;

    /// ConnectivityCheckUri property
    #[dbus_proxy(property)]
    fn connectivity_check_uri(&self) -> zbus::Result<String>;

    /// Devices property
    #[dbus_proxy(property)]
    fn devices(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// GlobalDnsConfiguration property
    #[dbus_proxy(property)]
    fn global_dns_configuration(
        &self,
    ) -> zbus::Result<std::collections::HashMap<String, zbus::zvariant::OwnedValue>>;
    #[dbus_proxy(property)]
    fn set_global_dns_configuration(
        &self,
        value: std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
    ) -> zbus::Result<()>;

    /// Metered property
    #[dbus_proxy(property)]
    fn metered(&self) -> zbus::Result<u32>;

    /// NetworkingEnabled property
    #[dbus_proxy(property)]
    fn networking_enabled(&self) -> zbus::Result<bool>;

    /// PrimaryConnection property
    #[dbus_proxy(property)]
    fn primary_connection(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// PrimaryConnectionType property
    #[dbus_proxy(property)]
    fn primary_connection_type(&self) -> zbus::Result<String>;

    /// RadioFlags property
    #[dbus_proxy(property)]
    fn radio_flags(&self) -> zbus::Result<u32>;

    /// Startup property
    #[dbus_proxy(property)]
    fn startup(&self) -> zbus::Result<bool>;

    /// State property
    #[dbus_proxy(property)]
    fn state(&self) -> zbus::Result<u32>;

    /// Version property
    #[dbus_proxy(property)]
    fn version(&self) -> zbus::Result<String>;

    /// VersionInfo property
    #[dbus_proxy(property)]
    fn version_info(&self) -> zbus::Result<Vec<u32>>;

    /// WimaxEnabled property
    #[dbus_proxy(property)]
    fn wimax_enabled(&self) -> zbus::Result<bool>;
    #[dbus_proxy(property)]
    fn set_wimax_enabled(&self, value: bool) -> zbus::Result<()>;

    /// WimaxHardwareEnabled property
    #[dbus_proxy(property)]
    fn wimax_hardware_enabled(&self) -> zbus::Result<bool>;

    /// WirelessEnabled property
    #[dbus_proxy(property)]
    fn wireless_enabled(&self) -> zbus::Result<bool>;
    #[dbus_proxy(property)]
    fn set_wireless_enabled(&self, value: bool) -> zbus::Result<()>;

    /// WirelessHardwareEnabled property
    #[dbus_proxy(property)]
    fn wireless_hardware_enabled(&self) -> zbus::Result<bool>;

    /// WwanEnabled property
    #[dbus_proxy(property)]
    fn wwan_enabled(&self) -> zbus::Result<bool>;
    #[dbus_proxy(property)]
    fn set_wwan_enabled(&self, value: bool) -> zbus::Result<()>;

    /// WwanHardwareEnabled property
    #[dbus_proxy(property)]
    fn wwan_hardware_enabled(&self) -> zbus::Result<bool>;
}

/// # DBus interface proxies for: `org.freedesktop.NetworkManager.Device`
///
/// This code was generated by `zbus-xmlgen` `3.1.0` from DBus introspection data.
#[dbus_proxy(
    interface = "org.freedesktop.NetworkManager.Device",
    default_service = "org.freedesktop.NetworkManager",
    default_path = "/org/freedesktop/NetworkManager/Devices/1"
)]
trait Device {
    /// Delete method
    fn delete(&self) -> zbus::Result<()>;

    /// Disconnect method
    fn disconnect(&self) -> zbus::Result<()>;

    /// GetAppliedConnection method
    fn get_applied_connection(&self, flags: u32) -> zbus::Result<(OwnedNestedHash, u64)>;

    /// Reapply method
    fn reapply(
        &self,
        connection: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
        version_id: u64,
        flags: u32,
    ) -> zbus::Result<()>;

    /// ActiveConnection property
    #[dbus_proxy(property)]
    fn active_connection(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// Autoconnect property
    #[dbus_proxy(property)]
    fn autoconnect(&self) -> zbus::Result<bool>;
    #[dbus_proxy(property)]
    fn set_autoconnect(&self, value: bool) -> zbus::Result<()>;

    /// AvailableConnections property
    #[dbus_proxy(property)]
    fn available_connections(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// Capabilities property
    #[dbus_proxy(property)]
    fn capabilities(&self) -> zbus::Result<u32>;

    /// DeviceType property
    #[dbus_proxy(property)]
    fn device_type(&self) -> zbus::Result<u32>;

    /// Dhcp4Config property
    #[dbus_proxy(property)]
    fn dhcp4_config(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// Dhcp6Config property
    #[dbus_proxy(property)]
    fn dhcp6_config(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// Driver property
    #[dbus_proxy(property)]
    fn driver(&self) -> zbus::Result<String>;

    /// DriverVersion property
    #[dbus_proxy(property)]
    fn driver_version(&self) -> zbus::Result<String>;

    /// FirmwareMissing property
    #[dbus_proxy(property)]
    fn firmware_missing(&self) -> zbus::Result<bool>;

    /// FirmwareVersion property
    #[dbus_proxy(property)]
    fn firmware_version(&self) -> zbus::Result<String>;

    /// HwAddress property
    #[dbus_proxy(property)]
    fn hw_address(&self) -> zbus::Result<String>;

    /// Interface property
    #[dbus_proxy(property)]
    fn interface(&self) -> zbus::Result<String>;

    /// InterfaceFlags property
    #[dbus_proxy(property)]
    fn interface_flags(&self) -> zbus::Result<u32>;

    /// Ip4Address property
    #[dbus_proxy(property)]
    fn ip4_address(&self) -> zbus::Result<u32>;

    /// Ip4Config property
    #[dbus_proxy(property)]
    fn ip4_config(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// Ip4Connectivity property
    #[dbus_proxy(property)]
    fn ip4_connectivity(&self) -> zbus::Result<u32>;

    /// Ip6Config property
    #[dbus_proxy(property)]
    fn ip6_config(&self) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// Ip6Connectivity property
    #[dbus_proxy(property)]
    fn ip6_connectivity(&self) -> zbus::Result<u32>;

    /// IpInterface property
    #[dbus_proxy(property)]
    fn ip_interface(&self) -> zbus::Result<String>;

    /// LldpNeighbors property
    #[dbus_proxy(property)]
    fn lldp_neighbors(
        &self,
    ) -> zbus::Result<Vec<std::collections::HashMap<String, zbus::zvariant::OwnedValue>>>;

    /// Managed property
    #[dbus_proxy(property)]
    fn managed(&self) -> zbus::Result<bool>;
    #[dbus_proxy(property)]
    fn set_managed(&self, value: bool) -> zbus::Result<()>;

    /// Metered property
    #[dbus_proxy(property)]
    fn metered(&self) -> zbus::Result<u32>;

    /// Mtu property
    #[dbus_proxy(property)]
    fn mtu(&self) -> zbus::Result<u32>;

    /// NmPluginMissing property
    #[dbus_proxy(property)]
    fn nm_plugin_missing(&self) -> zbus::Result<bool>;

    /// Path property
    #[dbus_proxy(property)]
    fn path(&self) -> zbus::Result<String>;

    /// PhysicalPortId property
    #[dbus_proxy(property)]
    fn physical_port_id(&self) -> zbus::Result<String>;

    /// Ports property
    #[dbus_proxy(property)]
    fn ports(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// Real property
    #[dbus_proxy(property)]
    fn real(&self) -> zbus::Result<bool>;

    /// State property
    #[dbus_proxy(property)]
    fn state(&self) -> zbus::Result<u32>;

    /// StateReason property
    #[dbus_proxy(property)]
    fn state_reason(&self) -> zbus::Result<(u32, u32)>;

    /// Udi property
    #[dbus_proxy(property)]
    fn udi(&self) -> zbus::Result<String>;
}

/// # DBus interface proxy for: `org.freedesktop.NetworkManager.Settings`
///
/// This code was generated by `zbus-xmlgen` `3.1.0` from DBus introspection data.
#[dbus_proxy(
    interface = "org.freedesktop.NetworkManager.Settings",
    default_service = "org.freedesktop.NetworkManager",
    default_path = "/org/freedesktop/NetworkManager/Settings",
    gen_blocking = false
)]
trait Settings {
    /// AddConnection method
    fn add_connection(
        &self,
        connection: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
    ) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// AddConnection2 method
    fn add_connection2(
        &self,
        settings: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
        flags: u32,
        args: std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
    ) -> zbus::Result<(
        zbus::zvariant::OwnedObjectPath,
        std::collections::HashMap<String, zbus::zvariant::OwnedValue>,
    )>;

    /// AddConnectionUnsaved method
    fn add_connection_unsaved(
        &self,
        connection: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
    ) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// GetConnectionByUuid method
    fn get_connection_by_uuid(&self, uuid: &str) -> zbus::Result<zbus::zvariant::OwnedObjectPath>;

    /// ListConnections method
    fn list_connections(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// LoadConnections method
    fn load_connections(&self, filenames: &[&str]) -> zbus::Result<(bool, Vec<String>)>;

    /// ReloadConnections method
    fn reload_connections(&self) -> zbus::Result<bool>;

    /// SaveHostname method
    fn save_hostname(&self, hostname: &str) -> zbus::Result<()>;

    /// ConnectionRemoved signal
    #[dbus_proxy(signal)]
    fn connection_removed(&self, connection: zbus::zvariant::ObjectPath<'_>) -> zbus::Result<()>;

    /// NewConnection signal
    #[dbus_proxy(signal)]
    fn new_connection(&self, connection: zbus::zvariant::ObjectPath<'_>) -> zbus::Result<()>;

    /// CanModify property
    #[dbus_proxy(property)]
    fn can_modify(&self) -> zbus::Result<bool>;

    /// Connections property
    #[dbus_proxy(property)]
    fn connections(&self) -> zbus::Result<Vec<zbus::zvariant::OwnedObjectPath>>;

    /// Hostname property
    #[dbus_proxy(property)]
    fn hostname(&self) -> zbus::Result<String>;
}
/// # DBus interface proxy for: `org.freedesktop.NetworkManager.Settings.Connection`
///
/// This code was generated by `zbus-xmlgen` `3.1.0` from DBus introspection data.
#[dbus_proxy(
    interface = "org.freedesktop.NetworkManager.Settings.Connection",
    default_service = "org.freedesktop.NetworkManager",
    default_path = "/org/freedesktop/NetworkManager/Settings/1",
    gen_blocking = false
)]
trait Connection {
    /// ClearSecrets method
    fn clear_secrets(&self) -> zbus::Result<()>;

    /// Delete method
    fn delete(&self) -> zbus::Result<()>;

    /// GetSecrets method
    fn get_secrets(
        &self,
        setting_name: &str,
    ) -> zbus::Result<
        std::collections::HashMap<
            String,
            std::collections::HashMap<String, zbus::zvariant::OwnedValue>,
        >,
    >;

    /// GetSettings method
    fn get_settings(
        &self,
    ) -> zbus::Result<
        std::collections::HashMap<
            String,
            std::collections::HashMap<String, zbus::zvariant::OwnedValue>,
        >,
    >;

    /// Save method
    fn save(&self) -> zbus::Result<()>;

    /// Update method
    fn update(
        &self,
        properties: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
    ) -> zbus::Result<()>;

    /// Update2 method
    fn update2(
        &self,
        settings: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
        flags: u32,
        args: std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
    ) -> zbus::Result<std::collections::HashMap<String, zbus::zvariant::OwnedValue>>;

    /// UpdateUnsaved method
    fn update_unsaved(
        &self,
        properties: std::collections::HashMap<
            &str,
            std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
        >,
    ) -> zbus::Result<()>;

    /// Removed signal
    #[dbus_proxy(signal)]
    fn removed(&self) -> zbus::Result<()>;

    /// Updated signal
    #[dbus_proxy(signal)]
    fn updated(&self) -> zbus::Result<()>;

    /// Filename property
    #[dbus_proxy(property)]
    fn filename(&self) -> zbus::Result<String>;

    /// Flags property
    #[dbus_proxy(property)]
    fn flags(&self) -> zbus::Result<u32>;

    /// Unsaved property
    #[dbus_proxy(property)]
    fn unsaved(&self) -> zbus::Result<bool>;
}

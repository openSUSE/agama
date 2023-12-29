//! Network D-Bus interfaces for IP configuration.
//!
//! This module contains the D-Bus interfaces to deal with IPv4 and IPv6 configuration.
//! The `dbus_interface` macro should be applied to structs, that's the reason there are
//! two different structs for IPv4 and IPv6 settings. The common code have been moved
//! to the `Ip<T>` struct.
use crate::network::{
    action::Action,
    error::NetworkStateError,
    model::{IpConfig, Ipv4Method, Ipv6Method},
};
use agama_lib::dbus::OwnedHash;
use async_trait::async_trait;
use cidr::IpInet;
use std::{net::IpAddr, sync::Arc};
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::{Mutex, MutexGuard};
use uuid::Uuid;
use zbus::{dbus_interface, SignalContext};

use super::common::ConnectionInterface;

/// D-Bus interface for IPv4 and IPv6 settings
pub struct Ip {
    actions: Arc<Mutex<UnboundedSender<Action>>>,
    uuid: Uuid,
}

impl Ip {
    /// Creates an IP interface object.
    ///
    /// * `actions`: sending-half of a channel to send actions.
    /// * `uuid`: connection UUID..
    pub fn new(actions: UnboundedSender<Action>, uuid: Uuid) -> Self {
        Self {
            actions: Arc::new(Mutex::new(actions)),
            uuid,
        }
    }

    /// Returns the IpConfig struct.
    async fn get_ip_config(&self) -> Result<IpConfig, NetworkStateError> {
        self.get_connection().await.map(|c| c.ip_config)
    }

    /// Updates the IpConfig struct.
    ///
    /// * `func`: function to update the configuration.
    async fn update_ip_config<F>(&self, func: F) -> zbus::fdo::Result<()>
    where
        F: Fn(&mut IpConfig) + std::marker::Send,
    {
        self.update_connection(move |c| func(&mut c.ip_config))
            .await?;
        Ok(())
    }
}

#[dbus_interface(name = "org.opensuse.Agama1.Network.Connection.IP")]
impl Ip {
    /// List of IP addresses.
    ///
    /// When the method is 'auto', these addresses are used as additional addresses.
    #[dbus_interface(property)]
    pub async fn addresses(&self) -> zbus::fdo::Result<Vec<String>> {
        let ip_config = self.get_ip_config().await?;
        let addresses = ip_config.addresses.iter().map(|a| a.to_string()).collect();
        Ok(addresses)
    }

    #[dbus_interface(property)]
    pub async fn set_addresses(&mut self, addresses: Vec<String>) -> zbus::fdo::Result<()> {
        let addresses = helpers::parse_addresses::<IpInet>(addresses);
        self.update_ip_config(|ip| ip.addresses = addresses.clone())
            .await
    }

    /// IPv4 configuration method.
    ///
    /// Possible values: "disabled", "auto", "manual" or "link-local".
    ///
    /// See [crate::network::model::Ipv4Method].
    #[dbus_interface(property)]
    pub async fn method4(&self) -> zbus::fdo::Result<String> {
        let ip_config = self.get_ip_config().await?;
        Ok(ip_config.method4.to_string())
    }

    #[dbus_interface(property)]
    pub async fn set_method4(&mut self, method: &str) -> zbus::fdo::Result<()> {
        let method: Ipv4Method = method.parse()?;
        self.update_ip_config(|ip| ip.method4 = method).await
    }

    /// IPv6 configuration method.
    ///
    /// Possible values: "disabled", "auto", "manual", "link-local", "ignore" or "dhcp".
    ///
    /// See [crate::network::model::Ipv6Method].
    #[dbus_interface(property)]
    pub async fn method6(&self) -> zbus::fdo::Result<String> {
        let ip_config = self.get_ip_config().await?;
        Ok(ip_config.method6.to_string())
    }

    #[dbus_interface(property)]
    pub async fn set_method6(&mut self, method: &str) -> zbus::fdo::Result<()> {
        let method: Ipv6Method = method.parse()?;
        self.update_ip_config(|ip| ip.method6 = method).await
    }

    /// Name server addresses.
    #[dbus_interface(property)]
    pub async fn nameservers(&self) -> zbus::fdo::Result<Vec<String>> {
        let ip_config = self.get_ip_config().await?;
        let nameservers = ip_config
            .nameservers
            .iter()
            .map(IpAddr::to_string)
            .collect();
        Ok(nameservers)
    }

    #[dbus_interface(property)]
    pub async fn set_nameservers(&mut self, addresses: Vec<String>) -> zbus::fdo::Result<()> {
        let addresses = helpers::parse_addresses::<IpAddr>(addresses);
        self.update_ip_config(|ip| ip.nameservers = addresses.clone())
            .await
    }

    /// Network gateway for IPv4.
    ///
    /// An empty string removes the current value.
    #[dbus_interface(property)]
    pub async fn gateway4(&self) -> zbus::fdo::Result<String> {
        let ip_config = self.get_ip_config().await?;
        let gateway = match ip_config.gateway4 {
            Some(ref address) => address.to_string(),
            None => "".to_string(),
        };
        Ok(gateway)
    }

    #[dbus_interface(property)]
    pub async fn set_gateway4(&mut self, gateway: String) -> zbus::fdo::Result<()> {
        let gateway = helpers::parse_gateway(gateway)?;
        self.update_ip_config(|ip| ip.gateway4 = gateway).await
    }

    /// Network gateway for IPv6.
    ///
    /// An empty string removes the current value.
    #[dbus_interface(property)]
    pub async fn gateway6(&self) -> zbus::fdo::Result<String> {
        let ip_config = self.get_ip_config().await?;
        let result = match ip_config.gateway6 {
            Some(ref address) => address.to_string(),
            None => "".to_string(),
        };
        Ok(result)
    }

    #[dbus_interface(property)]
    pub async fn set_gateway6(&mut self, gateway: String) -> zbus::fdo::Result<()> {
        let gateway = helpers::parse_gateway(gateway)?;
        self.update_ip_config(|ip| ip.gateway6 = gateway).await
    }

    pub async fn update(
        &mut self,
        data: OwnedHash,
        #[zbus(signal_context)] ctxt: SignalContext<'_>,
    ) -> zbus::fdo::Result<()> {
        let ip_config = helpers::from_dbus(data).unwrap();
        self.update_connection(|c| c.ip_config = ip_config).await?;

        _ = Self::method4_changed(self, &ctxt).await;
        _ = Self::method6_changed(self, &ctxt).await;
        _ = Self::gateway4_changed(self, &ctxt).await;
        _ = Self::gateway6_changed(self, &ctxt).await;
        _ = Self::nameservers_changed(self, &ctxt).await;
        _ = Self::addresses_changed(self, &ctxt).await;
        Ok(())
    }
}

mod helpers {
    use crate::network::{error::NetworkStateError, model::IpConfig};
    use agama_lib::dbus::OwnedHash;
    use log;
    use std::{
        error::Error,
        fmt::{Debug, Display},
        str::FromStr,
    };

    /// Parses a set of addresses in textual form into T.
    ///
    /// * `addresses`: addresses to parse.
    pub fn parse_addresses<T>(addresses: Vec<String>) -> Vec<T>
    where
        T: FromStr,
        <T as FromStr>::Err: Display,
    {
        addresses
            .into_iter()
            .filter_map(|ip| match ip.parse::<T>() {
                Ok(address) => Some(address),
                Err(error) => {
                    log::error!("Ignoring the invalid IP address: {} ({})", ip, error);
                    None
                }
            })
            .collect()
    }

    /// Sets the gateway for an IP configuration.
    ///
    /// * `ip`: IpConfig object.
    /// * `gateway`: IP in textual form.
    pub fn parse_gateway<T>(gateway: String) -> Result<Option<T>, NetworkStateError>
    where
        T: FromStr,
        <T as FromStr>::Err: Debug + Display,
    {
        if gateway.is_empty() {
            Ok(None)
        } else {
            let parsed = gateway
                .parse()
                .map_err(|_| NetworkStateError::InvalidIpAddr(gateway))?;
            Ok(Some(parsed))
        }
    }

    // TODO: proper error handling
    pub fn from_dbus(data: OwnedHash) -> Result<IpConfig, Box<dyn Error>> {
        let mut ip_config = IpConfig::default();
        if let Some(method4) = data.get("Method4") {
            let method4: &str = method4.downcast_ref().unwrap();
            ip_config.method4 = method4.parse()?;
        }

        if let Some(method6) = data.get("Method6") {
            let method6: &str = method6.downcast_ref().unwrap();
            ip_config.method6 = method6.parse()?;
        }

        if let Some(gateway4) = data.get("Gateway4") {
            let gateway4: &str = gateway4.downcast_ref().unwrap();
            ip_config.gateway4 = gateway4.parse().ok();
        }

        if let Some(gateway6) = data.get("Gateway6") {
            let gateway6: &str = gateway6.downcast_ref().unwrap();
            ip_config.gateway6 = gateway6.parse().ok();
        }

        if let Some(nameservers) = data.get("Nameservers") {
            let namesevers = nameservers.downcast_ref::<zbus::zvariant::Array>().unwrap();
            for ns in namesevers.get() {
                let ns: &str = ns.downcast_ref().unwrap();
                ip_config.nameservers.push(ns.parse().unwrap())
            }
        }

        if let Some(addresses) = data.get("Addresses") {
            let addresses = addresses.downcast_ref::<zbus::zvariant::Array>().unwrap();
            for addr in addresses.get() {
                let addr: &str = addr.downcast_ref().unwrap();
                ip_config.addresses.push(addr.parse().unwrap())
            }
        }
        Ok(ip_config)
    }
}

#[async_trait]
impl ConnectionInterface for Ip {
    fn uuid(&self) -> Uuid {
        self.uuid
    }

    async fn actions(&self) -> MutexGuard<UnboundedSender<Action>> {
        self.actions.lock().await
    }
}

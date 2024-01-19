use agama_lib::connection;
use std::sync::Arc;
use zbus::zvariant;

pub struct DBusClient {
    connection: zbus::Connection,
}

impl DBusClient {
    pub async fn with_default_connection() -> Self {
        Self {
            connection: connection().await.unwrap(),
        }
    }

    pub async fn call_method(
        &self,
        service: &str,
        path: &str,
        iface: &str,
        method: &str,
    ) -> Arc<zbus::Message> {
        self.connection
            .call_method(Some(service), path, Some(iface), method, &())
            .await
            .unwrap()
    }

    pub async fn get_property(
        &self,
        service: &str,
        path: &str,
        iface: &str,
        property: &str,
    ) -> Arc<zbus::Message> {
        self.connection
            .call_method(
                Some(service),
                path,
                Some("org.freedesktop.DBus.Properties"),
                "Get",
                &[iface, property],
            )
            .await
            .unwrap()
    }

    pub async fn set_property(
        &self,
        service: &str,
        path: &str,
        iface: &str,
        property: &str,
        value: &zvariant::OwnedValue,
    ) -> Arc<zbus::Message> {
        self.connection
            .call_method(
                Some(service),
                path,
                Some("org.freedesktop.DBus.Properties"),
                "Set",
                &(iface, property, value),
            )
            .await
            .unwrap()
    }
}

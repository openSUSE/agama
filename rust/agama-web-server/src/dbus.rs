use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use zbus::zvariant::{self, DynamicType};

pub struct DBusClient {
    connection: zbus::Connection,
}

impl DBusClient {
    pub fn new(connection: zbus::Connection) -> Self {
        Self { connection }
    }

    pub async fn call_method<B>(
        &self,
        service: &str,
        path: &str,
        iface: &str,
        method: &str,
        body: &B,
    ) -> Arc<zbus::Message>
    where
        B: Serialize + DynamicType,
    {
        self.connection
            .call_method(Some(service), path, Some(iface), method, body)
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

#[derive(Serialize, Deserialize, Debug)]
pub enum DBusValue {
    U32(u32),
    Str(String),
    Variant(Box<DBusValue>),
    Dict(std::collections::HashMap<String, Box<DBusValue>>),
    Boolean(bool),
}

impl DBusValue {
    pub fn to_zvariant_value(&self) -> zvariant::Value {
        match &self {
            DBusValue::U32(u) => zvariant::Value::new(u),
            DBusValue::Str(s) => zvariant::Value::new(s),
            DBusValue::Variant(v) => zvariant::Value::new(v.to_zvariant_value()),
            DBusValue::Boolean(b) => zvariant::Value::new(b),
            DBusValue::Dict(dict) => {
                let mut hash: HashMap<String, zvariant::Value> = HashMap::new();
                for (key, value) in dict.iter() {
                    hash.insert(key.to_string(), value.to_zvariant_value());
                }
                zvariant::Value::new(hash)
            }
        }
    }
}

#[derive(Deserialize, Debug, Default)]
#[serde(transparent)]
pub struct DBusArguments(Vec<DBusValue>);

impl DBusArguments {
    pub fn to_zvariant_structure(&self) -> zvariant::Structure {
        let mut builder = zvariant::StructureBuilder::new();
        for value in &self.0 {
            builder.push_value(value.to_zvariant_value());
        }
        builder.build()
    }
}

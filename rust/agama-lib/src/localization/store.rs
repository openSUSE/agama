//! Implements the store for the localization settings.
// TODO: for an overview see crate::store (?)

use super::{LocalizationClient, LocalizationSettings};
use crate::error::ServiceError;
use zbus::Connection;

/// Loads and stores the storage settings from/to the D-Bus service.
pub struct LocalizationStore<'a> {
    localization_client: LocalizationClient<'a>,
}

impl<'a> LocalizationStore<'a> {
    pub async fn new(connection: Connection) -> Result<LocalizationStore<'a>, ServiceError> {
        Ok(Self {
            localization_client: LocalizationClient::new(connection).await?,
        })
    }

    pub async fn load(&self) -> Result<LocalizationSettings, ServiceError> {
        // TODO: we should use a single D-Bus call with Properties.GetAll
        // but LocaleProxy does not have it, only get_property for individual methods
        // and properties_proxy is private

        let language = self.localization_client.language().await?;
        let keyboard = self.localization_client.keyboard().await?;
        let timezone = self.localization_client.timezone().await?;

        Ok(LocalizationSettings {
            language: Some(language),
            keyboard: Some(keyboard),
            timezone: Some(timezone),
        })
    }

    pub async fn store(&self, _settings: &LocalizationSettings) -> Result<(), ServiceError> {
        // FIXME: not so trivial to copy from Storage
        //self.localization_client.calculate(settings).await?;
        Ok(())
    }
}

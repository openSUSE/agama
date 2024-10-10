// Copyright (c) [2024] SUSE LLC
//
// All Rights Reserved.
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, contact SUSE LLC.
//
// To contact SUSE LLC about this file by physical or electronic mail, you may
// find current contact information at www.suse.com.

use crate::error::ServiceError;

use super::{client::ScriptsClient, settings::ScriptsSettings};

pub struct ScriptsStore {
    client: ScriptsClient,
}

impl ScriptsStore {
    pub fn new() -> Result<Self, ServiceError> {
        Ok(Self {
            client: ScriptsClient::new()?,
        })
    }

    pub fn new_with_client(client: ScriptsClient) -> Result<Self, ServiceError> {
        Ok(Self { client })
    }

    pub async fn load(&self) -> Result<ScriptsSettings, ServiceError> {
        // TODO: export nothing
        Ok(ScriptsSettings::default())
    }

    pub async fn store(&self, settings: &ScriptsSettings) -> Result<(), ServiceError> {
        for pre in &settings.pre {
            self.client.add_script(pre).await?;
        }
        Ok(())
    }
}

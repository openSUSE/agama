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

use std::sync::Arc;

use agama_lib::{
    error::ServiceError,
    scripts::{ScriptError, ScriptsRepository},
};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use thiserror::Error;
use tokio::sync::RwLock;

#[derive(Clone, Default)]
struct ScriptsState {
    scripts: Arc<RwLock<ScriptsRepository>>,
}

#[derive(Error, Debug)]
#[error("Script error: {0}")]
struct ScriptServiceError(#[from] ScriptError);

impl IntoResponse for ScriptServiceError {
    fn into_response(self) -> Response {
        let body = json!({
            "error": self.to_string()
        });
        (StatusCode::BAD_REQUEST, Json(body)).into_response()
    }
}

/// Sets up and returns the axum service for the auto-installation scripts.
pub async fn scripts_service() -> Result<Router, ServiceError> {
    let state = ScriptsState::default();
    let router = Router::new()
        .route("/", post(add_script))
        .route("/run", post(run_scripts))
        .with_state(state);
    Ok(router)
}

#[derive(Deserialize)]
struct ScriptConfig {
    /// Script name.
    name: String,
    /// Script body. Either the body or the URL must be specified.
    body: Option<String>,
    /// URL to get the script from. Either the body or the URL must be specified.
    url: Option<String>,
}

#[utoipa::path(
    post,
    path = "/",
    context_path = "/api/scripts",
    request_body(content = ScriptConfig, description = "Script definition"),
    responses(
        (status = 200, description = "The script was added")
    )
)]
async fn add_script(
    state: State<ScriptsState>,
    script: Json<ScriptConfig>,
) -> Result<impl IntoResponse, ScriptServiceError> {
    let mut scripts = state.scripts.write().await;
    if let Some(body) = &script.body {
        scripts.add_with_body(&script.name, body)?;
    } else if let Some(url) = &script.url {
        scripts.add_from_url(&script.name, url)?;
    }
    Ok(())
}

#[utoipa::path(
    post,
    path = "/run",
    context_path = "/api/scripts",
    responses(
        (status = 200, description = "The scripts were successfully executed.")
    )
)]
async fn run_scripts(state: State<ScriptsState>) -> Result<(), ScriptServiceError> {
    let scripts = state.scripts.write().await;
    scripts.run().await?;
    Ok(())
}

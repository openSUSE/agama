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

use std::{
    fs,
    io::Write,
    os::unix::fs::OpenOptionsExt,
    path::{Path, PathBuf},
    process,
};

use crate::transfer::Transfer;

use super::ScriptError;

/// Represents a script to run as part of the installation process.
pub struct Script {
    /// Location of the script in the local disk.
    pub path: PathBuf,
}

impl Script {
    /// Runs the script and returns the output.
    ///
    /// TODO: write stdout and stderr to the file system.
    pub async fn run(&self) -> Result<process::Output, ScriptError> {
        Ok(process::Command::new(&self.path).output()?)
    }
}

/// Manages a set of installation scripts.
///
/// It offers an API to add and execute installation scripts.
pub struct ScriptsRepository {
    workdir: PathBuf,
    scripts: Vec<Script>,
}

impl ScriptsRepository {
    /// Builds a new repository.
    ///
    /// * `workdir`: directory to store the scripts.
    pub fn new<P: AsRef<Path>>(workdir: P) -> ScriptsRepository {
        ScriptsRepository {
            workdir: PathBuf::from(workdir.as_ref()),
            ..Default::default()
        }
    }

    /// Adds a script.
    ///
    /// * `name`: script's name for reference purposes.
    /// * `body`: script's body.
    pub fn add_with_body(&mut self, name: &str, body: &str) -> Result<(), ScriptError> {
        self.write_script(name, |mut file| {
            write!(file, "{}", &body)?;
            Ok(())
        })
    }

    /// Adds a script fetching it from a given URL.
    ///
    /// * `name`: script's name for reference purposes.
    /// * `url`: script's URL.
    pub fn add_from_url(&mut self, name: &str, url: &str) -> Result<(), ScriptError> {
        self.write_script(name, |file| {
            Transfer::get(url, file)?;
            Ok(())
        })
    }

    /// Run all the scripts.
    ///
    /// They run in the order they were added to the repository.
    pub async fn run(&self) -> Result<(), ScriptError> {
        for script in &self.scripts {
            script.run().await?;
        }
        Ok(())
    }

    /// Writes and registers the script.
    ///
    /// It reduces the code repetition.
    ///
    /// * `name`: script's name.
    /// * `update`: function which writes the content of the script to the given `std::fs::File`.
    fn write_script<F>(&mut self, name: &str, update: F) -> Result<(), ScriptError>
    where
        F: FnOnce(fs::File) -> Result<(), ScriptError>,
    {
        std::fs::create_dir_all(&self.workdir)?;
        let path = self.workdir.join(name);
        let file = std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .mode(0o500)
            .open(&path)?;

        update(file)?;
        self.scripts.push(Script { path });
        Ok(())
    }
}

impl Default for ScriptsRepository {
    fn default() -> Self {
        Self {
            workdir: PathBuf::from("/run/agama/scripts"),
            scripts: vec![],
        }
    }
}

#[cfg(test)]
mod test {
    use tempfile::TempDir;
    use tokio::test;

    use super::ScriptsRepository;

    #[test]
    async fn test_add_with_body() {
        let tmp_dir = TempDir::with_prefix("scripts-").expect("a temporary directory");
        let mut repo = ScriptsRepository::new(&tmp_dir);
        let expected_body = "echo hello".to_string();
        repo.add_with_body("test", &expected_body).unwrap();

        let script = repo.scripts.first().unwrap();
        let body: Vec<u8> = std::fs::read(&script.path).unwrap();
        let body = String::from_utf8(body).unwrap();
        assert_eq!(expected_body, body);
    }

    #[test]
    async fn test_add_with_url() {
        let tmp_dir = TempDir::with_prefix("scripts-").expect("a temporary directory");
        let mut repo = ScriptsRepository::new(&tmp_dir);
        repo.add_from_url("test", "http://localhost/scripts.sh")
            .unwrap();
        let script = repo.scripts.first().unwrap();
        println!("script={}", script.path.to_str().unwrap());
    }
}

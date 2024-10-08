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

use agama_lib::progress::{Progress, ProgressPresenter};
use async_trait::async_trait;
use console::style;
use indicatif::{ProgressBar, ProgressStyle};
use std::time::Duration;

/// Reports the installer progress through the terminal
pub struct InstallerProgress {
    bar: Option<ProgressBar>,
}

impl InstallerProgress {
    pub fn new() -> Self {
        Self { bar: None }
    }

    fn update_bar(&mut self, progress: &Progress) {
        let bar = self.bar.get_or_insert_with(|| {
            let style = ProgressStyle::with_template("{spinner:.green} {msg}").unwrap();
            let bar = ProgressBar::new(0).with_style(style);
            bar.enable_steady_tick(Duration::from_millis(120));
            bar
        });
        bar.set_length(progress.max_steps.into());
        bar.set_position(progress.current_step.into());
        bar.set_message(progress.current_title.to_owned());
    }
}

#[async_trait]
impl ProgressPresenter for InstallerProgress {
    async fn start(&mut self, progress: &Progress) {
        if !progress.finished {
            self.update_main(progress).await;
        }
    }

    async fn update_main(&mut self, progress: &Progress) {
        let counter = format!("[{}/{}]", &progress.current_step, &progress.max_steps);

        println!(
            "{} {}",
            style(&counter).bold().green(),
            &progress.current_title
        );
    }

    async fn update_detail(&mut self, progress: &Progress) {
        if progress.finished {
            if let Some(bar) = self.bar.take() {
                bar.finish_and_clear();
            }
        } else {
            self.update_bar(progress);
        }
    }

    async fn finish(&mut self) {
        if let Some(bar) = self.bar.take() {
            bar.finish_and_clear();
        }
    }
}

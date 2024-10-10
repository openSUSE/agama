/*
 * Copyright (c) [2022-2023] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React, { useState } from "react";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "./components/layout";
import { Questions } from "~/components/questions";
import { ServerError, Installation } from "~/components/core";
import { useInstallerL10n } from "./context/installerL10n";
import { useInstallerClientStatus } from "~/context/installer";
import { useProduct, useProductChanges } from "./queries/software";
import { useL10nConfigChanges } from "~/queries/l10n";
import { useIssuesChanges } from "./queries/issues";
import { useInstallerStatus, useInstallerStatusChanges } from "./queries/status";
import { useDeprecatedChanges } from "./queries/storage";
import { PATHS as PRODUCT_PATHS } from "./routes/products";
import SimpleLayout from "./SimpleLayout";
import { InstallationPhase } from "./types/status";
import { _ } from "~/i18n";

/**
 * Main application component.
 *
 * @param {object} props
 * @param {number} [props.max_attempts=3] - Connection attempts before displaying an
 *   error (3 by default). The component will keep trying to connect.
 */
function App() {
  const location = useLocation();
  const { isBusy, phase } = useInstallerStatus({ suspense: true });
  const { connected, error } = useInstallerClientStatus();
  const { selectedProduct, products } = useProduct();
  const { language } = useInstallerL10n();
  const [isOpen, setIsOpen] = useState(true);
  useL10nConfigChanges();
  useProductChanges();
  useIssuesChanges();
  useInstallerStatusChanges();
  useDeprecatedChanges();

  const Content = () => {
    if (error) return <ServerError />;

    if (phase === InstallationPhase.Install) {
      return <Installation isBusy={isBusy} />;
    }

    if (!products || !connected)
      return (
        <SimpleLayout showOutlet={false}>
          <Loading />
        </SimpleLayout>
      );

    if (phase === InstallationPhase.Startup && isBusy) {
      return <Loading />;
    }

    if (selectedProduct === undefined && location.pathname !== PRODUCT_PATHS.root) {
      return <Navigate to="/products" />;
    }

    if (
      phase === InstallationPhase.Config &&
      isBusy &&
      location.pathname !== PRODUCT_PATHS.progress
    ) {
      return <Navigate to={PRODUCT_PATHS.progress} />;
    }

    return <Outlet />;
  };

  if (!language) return null;

  // TRANSLATORS: the text in square brackets [] is a clickable link
  const [msgStart, msgLink, msgEnd] = _(
    "The demo runs in read-only mode, you cannot change any values and the installation cannot \
be started. To find more details about Agama check the [home page].",
  ).split(/[[\]]/);

  const alert =
    process.env.AGAMA_DEMO === "replay" && isOpen ? (
      <Alert
        variant="warning"
        title={_("This is Agama installer online demo.")}
        timeout={12000}
        actionClose={<AlertActionCloseButton onClose={() => setIsOpen(false)} />}
      >
        <p>
          {msgStart}
          <a href="https://agama-project.github.io/" rel="noreferrer" target="_blank">
            {msgLink}
          </a>
          {msgEnd}
        </p>
      </Alert>
    ) : null;

  return (
    <>
      {alert}
      <Content />
      <Questions />
    </>
  );
}

export default App;

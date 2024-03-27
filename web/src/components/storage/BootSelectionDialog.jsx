/*
 * Copyright (c) [2024] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
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
import { Form } from "@patternfly/react-core";
import { _ } from "~/i18n";
import { noop } from "~/utils";
import { Popup } from "~/components/core";
import { DevicesFormSelect } from "~/components/storage";

/**
 * @typedef {import ("~/client/storage").StorageDevice} StorageDevice
 */

const BOOT_AUTO_ID = "boot-auto";
const BOOT_MANUAL_ID = "boot-manual";
const BOOT_DISABLED_ID = "boot-disabled";
const OPTIONS_NAME = "boot-mode";

/**
 * Internal component for building the options
 * @component
 *
 * @param {React.PropsWithChildren<React.ComponentProps<"input">>} props
 */
const RadioOption = ({ id, onChange, defaultChecked, children }) => {
  return (
    <>
      <input id={id} name={OPTIONS_NAME} type="radio" defaultChecked={defaultChecked} onChange={onChange} />
      <label htmlFor={id}>{children}</label>
    </>
  );
};

/**
 * Renders a dialog that allows the user to select the boot configuration.
 * @component
 *
 * @typedef {object} Boot
 * @property {boolean} configureBoot
 * @property {StorageDevice|undefined} bootDevice
 *
 * @param {object} props
 * @param {boolean} props.configureBoot - Whether the boot is configurable
 * @param {StorageDevice|undefined} props.bootDevice - Currently selected booting device.
 * @param {StorageDevice[]} props.devices - Devices that user can select to boot from.
 * @param {boolean} [props.isOpen=false] - Whether the dialog is visible or not.
 * @param {function} [props.onCancel=noop] - Callback to execute when user closes the dialog.
 * @param {(boot: Boot) => void} props.onAccept
 */
export default function BootSelectionDialog({
  configureBoot: defaultConfigureBoot,
  bootDevice: defaultBootDevice,
  devices,
  isOpen,
  onCancel = noop,
  onAccept = noop,
  ...props
}) {
  const [configureBoot, setConfigureBoot] = useState(defaultConfigureBoot);
  const [bootDevice, setBootDevice] = useState(defaultBootDevice || devices[0]);
  const [isBootAuto, setIsBootAuto] = useState(defaultConfigureBoot && defaultBootDevice === undefined);

  const isBootManual = configureBoot && !isBootAuto;

  const selectBootAuto = () => {
    setConfigureBoot(true);
    setIsBootAuto(true);
  };

  const selectBootManual = () => {
    setConfigureBoot(true);
    setIsBootAuto(false);
  };

  const selectBootDisabled = () => {
    setConfigureBoot(false);
    setIsBootAuto(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const device = isBootAuto ? undefined : bootDevice;
    onAccept({ configureBoot, bootDevice: device });
  };

  const isAcceptDisabled = () => {
    return isBootManual && bootDevice === undefined;
  };

  return (
    <Popup
      title={_("Configuration for boot partitions")}
      isOpen={isOpen}
      className="large"
      {...props}
    >
      <Form id="boot-form" onSubmit={onSubmit}>
        <fieldset className="stack">
          <legend className="split">
            <RadioOption id={BOOT_AUTO_ID} defaultChecked={isBootAuto} onChange={() => selectBootAuto()}>
              {_("Automatic")}
            </RadioOption>
          </legend>
          <div>
            {_("Additional partitions to boot the system will be configured at /dev/vdc, \
            the device selected for installing the system.")}
          </div>
        </fieldset>

        <fieldset className="stack">
          <legend className="split">
            <RadioOption id={BOOT_MANUAL_ID} defaultChecked={isBootManual} onChange={() => selectBootManual()}>
              {_("Select a disk")}
            </RadioOption>
          </legend>

          <div className="stack">
            <div>
              {_("Additional partitions to boot the system will be configured in the \
                following selected device.")}
            </div>
            <DevicesFormSelect
              aria-label={_("Choose a disk for placing the boot loader")}
              devices={devices}
              selectedDevice={bootDevice}
              onChange={setBootDevice}
              isDisabled={!isBootManual}
            />
          </div>
        </fieldset>

        <fieldset className="stack">
          <legend className="split">
            <RadioOption id={BOOT_DISABLED_ID} defaultChecked={!configureBoot} onChange={() => selectBootDisabled()}>
              {_("Do not configure")}
            </RadioOption>
          </legend>
          <div>
            {_("Additional partitions will not be configured to boot the system.")}
          </div>
        </fieldset>
      </Form>
      <Popup.Actions>
        <Popup.Confirm form="boot-form" type="submit" isDisabled={isAcceptDisabled()} />
        <Popup.Cancel onClick={onCancel} />
      </Popup.Actions>
    </Popup>
  );
}

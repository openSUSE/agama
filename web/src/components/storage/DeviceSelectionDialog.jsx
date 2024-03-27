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

import { sprintf } from "sprintf-js";
import { _ } from "~/i18n";
import { deviceChildren } from "~/components/storage/utils";
import { ControlledPanels as Panels, Popup } from "~/components/core";
import { DeviceSelectorTable } from "~/components/storage";
import { noop } from "~/utils";

/**
 * @typedef {import ("~/client/storage").ProposalSettings} ProposalSettings
 * @typedef {import ("~/client/storage").StorageDevice} StorageDevice
 */

const SELECT_DISK_ID = "select-disk";
const CREATE_LVM_ID = "create-lvm";
const SELECT_DISK_PANEL_ID = "panel-for-disk-selection";
const CREATE_LVM_PANEL_ID = "panel-for-lvm-creation";
const OPTIONS_NAME = "selection-mode";

const baseDescription = _("All the file systems will be created as <b>%s</b> \
  by default, although the location of each file system can be customized later \
  if needed.");

const Html = ({ children, ...props }) => (
  <div {...props} dangerouslySetInnerHTML={{ __html: children }} />
);

/**
 * Renders a dialog that allows the user to select a target device for installation.
 * @component
 *
 * @param {object} props
 * @param {string} props.target
 * @param {StorageDevice|undefined} props.targetDevice
 * @param {StorageDevice[]} props.targetPVDevices
 * @param {StorageDevice[]} props.devices - The actions to perform in the system.
 * @param {boolean} [props.isOpen=false] - Whether the dialog is visible or not.
 * @param {function} [props.onCancel=noop] - Callback to execute when user closes the dialog.
 * @param {(target: Target) => void} props.onAccept
 *
 * @typedef {object} Target
 * @property {string} target
 * @property {StorageDevice|undefined} targetDevice
 * @property {StorageDevice[]} targetPVDevices

 */
export default function DeviceSelectionDialog({
  target: defaultTarget,
  targetDevice: defaultTargetDevice,
  targetPVDevices: defaultPVDevices,
  devices,
  isOpen,
  onCancel = noop,
  onAccept = noop,
  ...props
}) {
  const [target, setTarget] = useState(defaultTarget);
  const [targetDevice, setTargetDevice] = useState(defaultTargetDevice);
  const [targetPVDevices, setTargetPVDevices] = useState(defaultPVDevices);

  const isTargetDisk = target === "disk";
  const isTargetNewLvmVg = target === "newLvmVg";

  const selectTargetDisk = () => setTarget("disk");
  const selectTargetNewLvmVG = () => setTarget("newLvmVg");

  const selectTargetDevice = (devices) => setTargetDevice(devices[0]);

  const onSubmit = (e) => {
    e.preventDefault();
    onAccept({ target, targetDevice, targetPVDevices });
  };

  const isAcceptDisabled = () => {
    if (isTargetDisk) return targetDevice === undefined;
    if (isTargetNewLvmVg) return targetPVDevices.length === 0;

    return true;
  };

  const isDeviceSelectable = (device) => device.isDrive || device.type === "md";

  return (
    <Popup
      title={_("Device for installing the system")}
      isOpen={isOpen}
      variant="medium"
      {...props}
    >
      <Form id="target-form" onSubmit={onSubmit}>
        <Panels className="stack">
          <Panels.Options data-variant="buttons">
            <Panels.Option
              id={SELECT_DISK_ID}
              name={OPTIONS_NAME}
              isSelected={isTargetDisk}
              onChange={selectTargetDisk}
              controls={SELECT_DISK_PANEL_ID}
            >
              {_("Select a disk")}
            </Panels.Option>
            <Panels.Option
              id={CREATE_LVM_ID}
              name={OPTIONS_NAME}
              isSelected={isTargetNewLvmVg}
              onChange={selectTargetNewLvmVG}
              controls={CREATE_LVM_PANEL_ID}
            >
              {_("Create a LVM Volume Group")}
            </Panels.Option>
          </Panels.Options>

          <Panels.Panel id={SELECT_DISK_PANEL_ID} isExpanded={isTargetDisk}>
            <Html>
              { sprintf(baseDescription, _("partitions in the selected device")) }
            </Html>

            <DeviceSelectorTable
              devices={devices}
              selected={[targetDevice]}
              itemChildren={deviceChildren}
              itemSelectable={isDeviceSelectable}
              onSelectionChange={selectTargetDevice}
              variant="compact"
            />
          </Panels.Panel>

          <Panels.Panel id={CREATE_LVM_PANEL_ID} isExpanded={isTargetNewLvmVg} className="stack">
            <Html>
              { sprintf(baseDescription, _("logical volumes of a new LVM Volume Group")) }
            </Html>

            <div>
              {_("The Physical Volumes for the new Volume Group will be allocated in the selected devices.")}
            </div>

            <DeviceSelectorTable
              isMultiple
              devices={devices}
              selected={targetPVDevices}
              itemChildren={deviceChildren}
              itemSelectable={isDeviceSelectable}
              onSelectionChange={setTargetPVDevices}
              variant="compact"
            />
          </Panels.Panel>
        </Panels>
      </Form>
      <Popup.Actions>
        <Popup.Confirm form="target-form" type="submit" isDisabled={isAcceptDisabled()} />
        <Popup.Cancel onClick={onCancel} />
      </Popup.Actions>
    </Popup>
  );
}

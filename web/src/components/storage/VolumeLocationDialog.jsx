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

// @ts-check

import React, { useState } from "react";
import { Radio, Form } from "@patternfly/react-core";
import { sprintf } from "sprintf-js";

import { _ } from "~/i18n";
import { deviceChildren, volumeLabel } from "~/components/storage/utils";
import { If, Popup, Reminder } from "~/components/core";
import VolumeLocationSelectorTable from "~/components/storage/VolumeLocationSelectorTable";

/**
 * @typedef {"auto"|"device"|"reuse"} LocationOption
 * @typedef {import ("~/client/storage").StorageDevice} StorageDevice
 * @typedef {import ("~/client/storage").Volume} Volume
 * @typedef {import ("~/client/storage").VolumeTarget} VolumeTarget
 */

// TRANSLATORS: Description of the dialog for changing the location of a file system.
const DIALOG_DESCRIPTION = _("The file systems are allocated at the installation device by \
default. Indicate a custom location to create the file system at a specific device.");

/** @type {(device: StorageDevice|undefined) => VolumeTarget} */
const defaultTarget = (device) => {
  if (["partition", "lvmLv", "md"].includes(device?.type)) return "DEVICE";

  return "NEW_PARTITION";
};

/** @type {(volume: Volume, device: StorageDevice|undefined) => VolumeTarget[]} */
const availableTargets = (volume, device) => {
  /** @type {VolumeTarget[]} */
  const targets = ["DEVICE"];

  if (device?.isDrive) {
    targets.push("NEW_PARTITION");
    targets.push("NEW_VG");
  }

  if (device?.filesystem && volume.outline.fsTypes.includes(device.filesystem.type))
    targets.push("FILESYSTEM");

  return targets;
};

/** @type {(volume: Volume, device: StorageDevice|undefined) => VolumeTarget} */
const sanitizeTarget = (volume, device) => {
  const targets = availableTargets(volume, device);
  return targets.includes(volume.target) ? volume.target : defaultTarget(device);
};

/**
 * Renders a dialog that allows the user to change the location of a volume.
 * @component
 *
 * @typedef {object} VolumeLocationDialogProps
 * @property {Volume} volume
 * @property {Volume[]} volumes
 * @property {StorageDevice[]} volumeDevices
 * @property {StorageDevice[]} targetDevices
 * @property {boolean} [isOpen=false] - Whether the dialog is visible or not.
 * @property {() => void} onCancel
 * @property {(volume: Volume) => void} onAccept
 *
 * @param {VolumeLocationDialogProps} props
 */
export default function VolumeLocationDialog({
  volume,
  volumes,
  volumeDevices,
  targetDevices,
  isOpen,
  onCancel,
  onAccept,
  ...props
}) {
  /** @type {StorageDevice|undefined} */
  const initialDevice = volume.targetDevice || targetDevices[0] || volumeDevices[0];
  /** @type {VolumeTarget} */
  const initialTarget = sanitizeTarget(volume, initialDevice);

  const [target, setTarget] = useState(initialTarget);
  const [targetDevice, setTargetDevice] = useState(initialDevice);

  /** @type {(devices: StorageDevice[]) => void} */
  const changeTargetDevice = (devices) => {
    const newTargetDevice = devices[0];

    if (newTargetDevice.name !== targetDevice.name) {
      setTarget(defaultTarget(newTargetDevice));
      setTargetDevice(newTargetDevice);
    }
  };

  /** @type {(e: import("react").FormEvent) => void} */
  const onSubmit = (e) => {
    e.preventDefault();
    const newVolume = { ...volume, target, targetDevice };
    onAccept(newVolume);
  };

  /** @type {(device: StorageDevice) => boolean} */
  const isDeviceSelectable = (device) => {
    return availableTargets(volume, device).includes(target);
    // return device.isDrive || ["md", "partition", "lvmLv"].includes(device.type);
  };

  const selectableDevices = volumeDevices.filter(d => isDeviceSelectable(d));

  // const targets = availableTargets(volume, targetDevice);

  if (!targetDevice) return null;

  return (
    <Popup
      // TRANSLATORS: Title of the dialog for changing the location of a file system. %s is replaced
      // by a mount path (e.g., /home).
      title={sprintf(_("Location for %s file system"), volumeLabel(volume))}
      description={DIALOG_DESCRIPTION}
      inlineSize="large"
      blockSize="large"
      isOpen={isOpen}
      className="location-layout"
      {...props}
    >
      <Form id="volume-location-form" onSubmit={onSubmit}>
        <ol className="stack">
          <li>
            <div>{_("Select how the file system will be allocated")}</div>
            <div className="two-columns">
              <Radio
                id="new_partition"
                name="target"
                label={_("Create a new partition")}
                description={_("The file system will be allocated as a new partition at the selected \
    disk.")}
                isChecked={target === "NEW_PARTITION"}
                onChange={() => setTarget("NEW_PARTITION")}
              />
              <Radio
                id="format"
                name="target"
                label={_("Format the device")}
                description={
                  // TRANSLATORS: %s is replaced by a file system type (e.g., Ext4).
                  sprintf(_("The selected device will be formatted as %s file system."),
                          volume.fsType)
                }
                isChecked={target === "DEVICE"}
                onChange={() => setTarget("DEVICE")}
              />
              <Radio
                id="dedicated_lvm"
                name="target"
                label={_("Create a dedicated LVM volume group")}
                description={_("A new volume group will be allocated in the selected disk and the \
    file system will be created as a logical volume.")}
                isChecked={target === "NEW_VG"}
                onChange={() => setTarget("NEW_VG")}
              />
              <Radio
                id="mount"
                name="target"
                label={_("Mount the file system")}
                description={_("The current file system on the selected device will be mounted \
    without formatting the device.")}
                isChecked={target === "FILESYSTEM"}
                onChange={() => setTarget("FILESYSTEM")}
              />
            </div>
          </li>
          <li>
            <div>
              <div>{_("Choose a device among available")}</div>
              <If
                condition={selectableDevices.length > 0}
                then={
                  <VolumeLocationSelectorTable
                    aria-label={_("Select a location")}
                    devices={volumeDevices}
                    selectedDevices={[targetDevice]}
                    targetDevices={targetDevices}
                    volumes={volumes}
                    itemChildren={deviceChildren}
                    itemSelectable={isDeviceSelectable}
                    onSelectionChange={changeTargetDevice}
                    initialExpandedKeys={volumeDevices.map(d => d.sid)}
                    variant="compact"
                  />
                }
                else={
                  <Reminder role="alert" icon="warning" variant="FIXME" title={_("There are no devices for ACTION VOLUME")} />
                }
              />
            </div>
          </li>
        </ol>
      </Form>
      <Popup.Actions>
        <Popup.Confirm form="volume-location-form" type="submit" />
        <Popup.Cancel onClick={onCancel} />
      </Popup.Actions>
    </Popup>
  );
}

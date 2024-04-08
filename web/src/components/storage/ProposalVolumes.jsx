/*
 * Copyright (c) [2022-2024] SUSE LLC
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
import {
  Button,
  List, ListItem,
  Skeleton,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { sprintf } from "sprintf-js";

import { _ } from "~/i18n";
import { Em, ExpandableField, If, Popup, RowActions, Tip } from '~/components/core';
import { Icon } from '~/components/layout';
import { BootSelectionDialog, VolumeForm } from '~/components/storage';
import { deviceSize, deviceLabel, hasSnapshots, isTransactionalRoot } from '~/components/storage/utils';
import { noop } from "~/utils";

/**
 * Allows to select the boot config.
 * @component
 *
 * @param {object} props
 * @param {boolean} props.configureBoot
 * @param {StorageDevice|undefined} props.bootDevice
 * @param {StorageDevice|undefined} props.defaultBootDevice
 * @param {StorageDevice[]} props.devices
 * @param {boolean} props.isLoading
 * @param {(boot: Boot) => void} props.onChange
 *
 * @typedef {object} Boot
 * @property {boolean} configureBoot
 * @property {StorageDevice} bootDevice
 */
const BootConfigField = ({
  configureBoot,
  bootDevice,
  defaultBootDevice,
  devices,
  isLoading,
  onChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);

  const closeDialog = () => setIsDialogOpen(false);

  const onAccept = ({ configureBoot, bootDevice }) => {
    closeDialog();
    onChange({ configureBoot, bootDevice });
  };

  const label = _("Change boot options");
  let value;

  if (!configureBoot) {
    value = <><Icon name="feedback" size="s" /> {_("Installation will not create boot partitions.")}</>;
  } else if (!bootDevice) {
    value = _("Installation might create boot partitions at the installation device.");
  } else {
    value = sprintf(_("Installation might create boot partitions at %s."), deviceLabel(bootDevice));
  }

  if (isLoading) {
    return <Skeleton screenreaderText={_("Waiting for information about boot config")} width="25%" />;
  }

  return (
    // NOTE: Using field withoud description and without icon to make the (nested)
    // option not too much prominent. We've to check other ways to do this,
    // specially in this case that could be a "Boot options" button in GeneralActions
    <>
      {value} <Button variant="link" isInline style={{ display: "inline-flex", alignItems: "center", gap: "0.7ch" }} onClick={openDialog}>{label}<Icon name="shadow" size="xxs" /></Button>
      <If
        condition={isDialogOpen}
        then={
          <BootSelectionDialog
            isOpen
            configureBoot={configureBoot}
            bootDevice={bootDevice}
            defaultBootDevice={defaultBootDevice}
            devices={devices}
            onAccept={onAccept}
            onCancel={closeDialog}
          />
        }
      />
    </>
  );
};

/**
 * Generates an hint describing which attributes affect the auto-calculated limits.
 * If the limits are not affected then it returns `null`.
 * @function
 *
 * @param {object} volume - storage volume object
 * @returns {(ReactComponent|null)} component to display (can be `null`)
 */
const AutoCalculatedHint = (volume) => {
  const { snapshotsAffectSizes = false, sizeRelevantVolumes = [], adjustByRam } = volume.outline;

  // no hint, the size is not affected by known criteria
  if (!snapshotsAffectSizes && !adjustByRam && sizeRelevantVolumes.length === 0) {
    return null;
  }

  return (
    <>
      {/* TRANSLATORS: header for a list of items referring to size limits for file systems */}
      {_("These limits are affected by:")}
      <List>
        {snapshotsAffectSizes &&
          // TRANSLATORS: list item, this affects the computed partition size limits
          <ListItem>{_("The configuration of snapshots")}</ListItem>}
        {sizeRelevantVolumes.length > 0 &&
          // TRANSLATORS: list item, this affects the computed partition size limits
          // %s is replaced by a list of the volumes (like "/home, /boot")
          <ListItem>{sprintf(_("Presence of other volumes (%s)"), sizeRelevantVolumes.join(", "))}</ListItem>}
        {adjustByRam &&
          // TRANSLATORS: list item, describes a factor that affects the computed size of a
          // file system; eg. adjusting the size of the swap
          <ListItem>{_("The amount of RAM in the system")}</ListItem>}
      </List>
    </>
  );
};

/**
 * Button with general actions for the file systems
 * @component
 *
 * @param {object} props
 * @param {object[]} props.templates - Volume templates
 * @param {onAddFn} props.onAdd - Function to use for adding a new volume
 * @param {onResetFn} props.onReset - Function to use for resetting to the default subvolumes
 *
 * @callback onAddFn
 * @param {object} volume
 * @return {void}
 *
 * @callback onResetFn
 * @return {void}
 */
const GeneralActions = ({ templates, onAdd, onReset }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => setIsFormOpen(false);

  const acceptForm = (volume) => {
    closeForm();
    onAdd(volume);
  };

  return (
    <div className="split" style={{ flexDirection: "row-reverse" }}>
      <Button isDisabled={templates.length === 0} onClick={openForm} variant="secondary">
        {/* TRANSLATORS: dropdown menu label */}
        {_("Add file system")}
      </Button>
      <Button variant="plain" onClick={onReset}>
        {/* TRANSLATORS: dropdown menu label */}
        {_("Reset to defaults")}
      </Button>
      <Popup aria-label={_("Add file system")} title={_("Add file system")} isOpen={isFormOpen}>
        <VolumeForm
          id="addVolumeForm"
          templates={templates}
          onSubmit={acceptForm}
        />
        <Popup.Actions>
          <Popup.Confirm form="addVolumeForm" type="submit">{_("Accept")}</Popup.Confirm>
          <Popup.Cancel onClick={closeForm} />
        </Popup.Actions>
      </Popup>
    </div>
  );
};

const VolumeLabel = ({ volume, options }) => {
  const snapshots = hasSnapshots(volume);
  const transactional = isTransactionalRoot(volume);

  // TRANSLATORS: the filesystem uses a logical volume (LVM)
  const text = `${volume.fsType} ${options.lvm ? _("logical volume") : _("partition")}`;
  const lockIcon = <Icon name="lock" size="xxxs" />;
  const snapshotsIcon = <Icon name="add_a_photo" size="xxxs" />;
  const transactionalIcon = <Icon name="sync" size="xxxs" />;

  return (
    <div className="split" style={{ background: "var(--color-gray)", padding: "var(--spacer-smaller) var(--spacer-small)", borderRadius: "var(--spacer-smaller)" }}>
      <b>{volume.mountPath}</b>
      <span>{text}</span>
      {/* TRANSLATORS: filesystem flag, it uses an encryption */}
      <If condition={options.encryption} then={<Em icon={lockIcon}>{_("encrypted")}</Em>} />
      {/* TRANSLATORS: filesystem flag, it allows creating snapshots */}
      <If condition={snapshots && !transactional} then={<Em icon={snapshotsIcon}>{_("with snapshots")}</Em>} />
      {/* TRANSLATORS: flag for transactional file system  */}
      <If condition={transactional} then={<Em icon={transactionalIcon}>{_("transactional")}</Em>} />
    </div>
  );
};

/**
 * Renders a table row with the information and actions for a volume
 * @component
 *
 * @param {object} props
 * @param {object[]} props.columns - Column specs
 * @param {object} props.volume - Volume to show
 * @param {ProposalOptions} props.options - General proposal options
 * @param {boolean} props.isLoading - Whether to show the row as loading
 * @param {onDeleteFn} props.onDelete - Function to use for deleting the volume
 *
 * @callback onDeleteFn
 * @param {object} volume
 * @return {void}
 */
const VolumeRow = ({ columns, volume, options, isLoading, onEdit, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => setIsFormOpen(false);

  const acceptForm = (volume) => {
    closeForm();
    onEdit(volume);
  };

  const SizeLimits = ({ volume }) => {
    let targetSize;
    if (volume.target === "filesystem" || volume.target === "device")
      targetSize = volume.targetDevice.size;

    const minSize = deviceSize(targetSize || volume.minSize);
    const maxSize = targetSize ? deviceSize(targetSize) : volume.maxSize ? deviceSize(volume.maxSize) : undefined;
    const isAuto = volume.autoSize;

    let size = minSize;
    if (minSize && maxSize && minSize !== maxSize) size = `${minSize} - ${maxSize}`;
    // TRANSLATORS: minimum device size, %s is replaced by size string, e.g. "17.5 GiB"
    if (maxSize === undefined) size = sprintf(_("At least %s"), minSize);

    return (
      <div className="split">
        <span>{size}</span>
        {/* TRANSLATORS: device flag, the partition size is automatically computed */}
        <If condition={isAuto} then={<Tip description={AutoCalculatedHint(volume)}>{_("auto")}</Tip>} />
      </div>
    );
  };

  const Details = ({ volume }) => {
    const snapshots = hasSnapshots(volume);
    const transactional = isTransactionalRoot(volume);

    if (volume.target === "filesystem")
      // TRANSLATORS: %s will be replaced by a file-system type like "Btrfs" or "Ext4"
      return sprintf(_("Reused %s"), volume.targetDevice?.filesystem?.type || "");
    if (transactional)
      return _("Transactional Btrfs");
    if (snapshots)
      return _("Btrfs with snapshots");

    return volume.fsType;
  };

  const Location = ({ volume, options }) => {
    if (volume.target === "new_partition")
      // TRANSLATORS: %s will be replaced by a disk name (eg. "/dev/sda")
      return sprintf(_("Partition at %s"), volume.targetDevice?.name || "");
    if (volume.target === "new_vg")
      // TRANSLATORS: %s will be replaced by a disk name (eg. "/dev/sda")
      return sprintf(_("Separate LVM at %s"), volume.targetDevice?.name || "");
    if (volume.target === "device" || volume.target === "filesystem")
      return volume.targetDevice?.name || "";
    if (options.lvm)
      return _("Logical volume at system LVM");

    return _("Partition at installation disk");
  };

  const VolumeActions = ({ volume, onEdit, onDelete }) => {
    const actions = () => {
      const actions = {
        delete: {
          title: _("Delete"),
          onClick: () => onDelete(volume),
          isDanger: true
        },
        edit: {
          title: _("Edit"),
          onClick: () => onEdit(volume)
        }
      };

      if (volume.outline.required)
        return [actions.edit];
      else
        return [actions.edit, actions.delete];
    };

    const currentActions = actions();

    if (currentActions.length === 0) return null;

    return <RowActions actions={currentActions} />;
  };

  if (isLoading) {
    return (
      <Tr>
        <Td colSpan={4}><Skeleton /></Td>
      </Tr>
    );
  }

  return (
    <>
      <Tr>
        <Td dataLabel={columns.mountPath}>{volume.mountPath}</Td>
        <Td dataLabel={columns.details}><Details volume={volume} /></Td>
        <Td dataLabel={columns.size}><SizeLimits volume={volume} /></Td>
        <Td dataLabel={columns.location}><Location volume={volume} options={options} /></Td>
        <Td isActionCell>
          <VolumeActions
            volume={volume}
            onEdit={openForm}
            onDelete={onDelete}
          />
        </Td>
      </Tr>

      <Popup title={_("Edit file system")} isOpen={isFormOpen}>
        <VolumeForm
          id="editVolumeForm"
          volume={volume}
          templates={[]}
          onSubmit={acceptForm}
        />
        <Popup.Actions>
          <Popup.Confirm form="editVolumeForm" type="submit">{_("Accept")}</Popup.Confirm>
          <Popup.Cancel onClick={closeForm} />
        </Popup.Actions>
      </Popup>
    </>
  );
};

/**
 * Renders a table with the information and actions of the volumes
 * @component
 *
 * @param {object} props
 * @param {object[]} props.volumes - Volumes to show
 * @param {ProposalOptions} props.options - General proposal options
 * @param {boolean} props.isLoading - Whether to show the table as loading
 * @param {onVolumesChangeFn} props.onVolumesChange - Function to submit changes in volumes
 *
 * @callback onVolumesChangeFn
 * @param {object[]} volumes
 * @return {void}
 */
const VolumesTable = ({ volumes, options, isLoading, onVolumesChange }) => {
  const columns = {
    mountPath: _("Mount point"),
    details: _("Details"),
    size: _("Size"),
    // TRANSLATORS: where (and how) the file-system is going to be created
    location: _("Location"),
    actions: _("Actions")
  };

  const VolumesContent = ({ volumes, options, isLoading, onVolumesChange }) => {
    const editVolume = (volume) => {
      const index = volumes.findIndex(v => v.mountPath === volume.mountPath);
      const newVolumes = [...volumes];
      newVolumes[index] = volume;
      onVolumesChange(newVolumes);
    };

    const deleteVolume = (volume) => {
      const newVolumes = volumes.filter(v => v.mountPath !== volume.mountPath);
      onVolumesChange(newVolumes);
    };

    if (volumes.length === 0 && isLoading) return <VolumeRow isLoading />;

    return volumes.map((volume, index) => {
      return (
        <VolumeRow
          key={`volume${index}`}
          id={index}
          columns={columns}
          volume={volume}
          options={options}
          isLoading={isLoading}
          onEdit={editVolume}
          onDelete={deleteVolume}
        />
      );
    });
  };

  return (
    <Table aria-label={_("Table with mount points")} variant="compact" borders>
      <Thead>
        <Tr>
          <Th>{columns.mountPath}</Th>
          <Th>{columns.details}</Th>
          <Th>{columns.size}</Th>
          <Th>{columns.location}</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        <VolumesContent
          volumes={volumes}
          options={options}
          isLoading={isLoading}
          onVolumesChange={onVolumesChange}
        />
      </Tbody>
    </Table>
  );
};

const Basic = ({ volumes, options }) => {
  return (
    <div className="split">
      { volumes.map((v, i) => <VolumeLabel key={i} volume={v} options={options} />) }
    </div>
  );
};

const Advanced = ({ volumes, options, templates, onChange }) => {
  const addVolume = (volume) => {
    if (onChange === noop) return;
    const newVolumes = [...volumes, volume];
    onChange(newVolumes);
  };

  const resetVolumes = () => {
    if (onChange === noop) return;
    onChange([]);
  };

  return (
    <div className="stack">
      <VolumesTable
        volumes={volumes}
        options={options}
        onVolumesChange={onChange}
      />
      <GeneralActions
        templates={templates}
        onAdd={addVolume}
        onReset={resetVolumes}

      />
    </div>
  );
};

/**
 * Renders information of the volumes and actions to modify them
 * @component
 *
 * @param {object} props
 * @param {object[]} [props.volumes=[]] - Volumes to show
 * @param {object[]} [props.templates=[]] - Templates to use for new volumes
 * @param {ProposalOptions} [props.options={}] - General proposal options
 * @param {boolean} [props.isLoading=false] - Whether to show the content as loading
 * @param {onChangeFn} [props.onChange=noop] - Function to use for changing the volumes
 *
 * @typedef {object} ProposalOptions
 * @property {boolean} [lvm]
 * @property {boolean} [encryption]
 *
 * @callback onChangeFn
 * @param {object[]} volumes
 * @return {void}
 */
export default function ProposalVolumes({
  volumes = [],
  templates = [],
  options = {},
  isLoading = false,
  onChange = noop,
  configureBoot,
  bootDevice,
  defaultBootDevice,
  devices,
  onBootChange = noop
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log(isLoading);

  return (
    <ExpandableField
      isExpanded={isExpanded}
      label={_("Partitions and file systems")}
      description={_("Structure of the new system, including any additional partiton needed for booting,")}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <If
        condition={isExpanded}
        then={
          <>
            <Advanced volumes={volumes} options={options} templates={templates} onChange={onChange} />
            <hr />
            <BootConfigField
              configureBoot={configureBoot}
              bootDevice={bootDevice}
              defaultBootDevice={defaultBootDevice}
              devices={devices}
              onChange={onBootChange}
            />
          </>
        }
        else={<Basic volumes={volumes} options={options} /> }
      />
    </ExpandableField>

  );
}

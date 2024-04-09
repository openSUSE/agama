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

// @ts-check

import React, { useState } from "react";
import { Checkbox, Form, Skeleton } from "@patternfly/react-core";

import { sprintf } from "sprintf-js";
import { _, n_ } from "~/i18n";
import { ProposalDeviceSection, ProposalVolumes, SpacePolicyDialog } from "~/components/storage";
import { If, SwitchField, SettingsField, PasswordAndConfirmationInput, Section, Popup } from "~/components/core";
import { noop } from "~/utils";
import { hasFS, SPACE_POLICIES } from "~/components/storage/utils";

/**
 * @typedef {import ("~/client/storage").ProposalSettings} ProposalSettings
 * @typedef {import ("~/client/storage").SpaceAction} SpaceAction
 * @typedef {import ("~/components/storage/utils").SpacePolicy} SpacePolicy
 * @typedef {import ("~/client/storage").StorageDevice} StorageDevice
 * @typedef {import ("~/client/storage").Volume} Volume
 */

/**
 * Form for configuring the encryption password.
 * @component
 *
 * @param {object} props
 * @param {string} props.id - Form ID.
 * @param {string} props.password - Password for encryption.
 * @param {string} props.method - Encryption method.
 * @param {string[]} props.methods - Possible encryption methods.
 * @param {(password: string, method: string) => void} [props.onSubmit=noop] - On submit callback.
 * @param {(valid: boolean) => void} [props.onValidate=noop] - On validate callback.
 */
const EncryptionSettingsForm = ({
  id,
  password: passwordProp,
  method: methodProp,
  methods,
  onSubmit = noop,
  onValidate = noop
}) => {
  const [password, setPassword] = useState(passwordProp || "");
  const [method, setMethod] = useState(methodProp);
  const tpmId = "tpm_fde";
  const luks2Id = "luks2";

  // useEffect(() => {
  //   if (password.length === 0) onValidate(false);
  // }, [password, onValidate]);

  const changePassword = (_, v) => setPassword(v);

  const changeMethod = (_, value) => {
    value ? setMethod(tpmId) : setMethod(luks2Id);
  };

  const submitForm = (e) => {
    e.preventDefault();
    onSubmit(password, method);
  };

  const Description = () => (
    <span
      dangerouslySetInnerHTML={{
        // TRANSLATORS: The word 'directly' is key here. For example, booting to the installer media and then choosing
        // 'Boot from Hard Disk' from there will not work. Keep it sort (this is a hint in a form) but keep it clear.
        // Do not translate 'abbr' and 'title', they are part of the HTML markup.
        __html: _("The password will not be needed to boot and access the data if the <abbr title='Trusted Platform Module'>TPM</abbr> can verify the integrity of the system. TPM sealing requires the new system to be booted directly on its first run.")
      }}
    />
  );

  return (
    <Form id={id} onSubmit={submitForm}>
      <PasswordAndConfirmationInput
        value={password}
        onChange={changePassword}
        onValidation={onValidate}
      />
      <If
        condition={methods.includes(tpmId)}
        then={
          <Checkbox
            id="encryption_method"
            label={_("Use the TPM to decrypt automatically on each boot")}
            description={<Description />}
            isChecked={method === tpmId}
            onChange={changeMethod}
          />
        }
      />
    </Form>
  );
};

/**
 * Allows to define snapshots enablement
 * @component
 *
 * @param {object} props
 * @param {ProposalSettings} props.settings - Settings used for calculating a proposal.
 * @param {(config: SnapshotsConfig) => void} [props.onChange=noop] - On change callback
 *
 * @typedef {object} SnapshotsConfig
 * @property {boolean} active
 * @property {ProposalSettings} settings
 */
const SnapshotsField = ({
  settings,
  onChange = noop
}) => {
  const rootVolume = (settings.volumes || []).find((i) => i.mountPath === "/");

  // no root volume is probably some error or still loading
  if (rootVolume === undefined) {
    return <Skeleton width="25%" />;
  }

  const isChecked = rootVolume !== undefined && hasFS(rootVolume, "Btrfs") && rootVolume.snapshots;

  const switchState = () => {
    onChange({ active: !isChecked, settings });
  };

  if (!rootVolume.outline.snapshotsConfigurable) return;

  const explanation = _("Uses Btrfs for the root file system allowing to boot to a previous \
version of the system after configuration changes or software upgrades.");

  return (
    <SwitchField
      label={_("Btrfs Snapshots")}
      value={isChecked ? _("enabled") : _("disabled")}
      isChecked={isChecked}
      onClick={switchState}
      description={explanation}
    />
  );
};

/**
 * Allows to define encryption
 * @component
 *
 * @param {object} props
 * @param {string} [props.password=""] - Password for encryption
 * @param {string} [props.method=""] - Encryption method
 * @param {string[]} [props.methods] - Possible encryption methods
 * @param {boolean} [props.isChecked=false] - Whether encryption is selected
 * @param {boolean} [props.isLoading=false] - Whether to show the selector as loading
 * @param {(config: EncryptionConfig) => void} [props.onChange=noop] - On change callback
 *
 * @typedef {object} EncryptionConfig
 * @property {string} password
 * @property {string} [method]
 */
const EncryptionField = ({
  password = "",
  method = "",
  methods,
  isChecked: defaultIsChecked = false,
  isLoading = false,
  onChange = noop
}) => {
  const [isChecked, setIsChecked] = useState(defaultIsChecked);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => setIsFormOpen(false);

  const acceptForm = (newPassword, newMethod) => {
    closeForm();
    onChange({ isChecked: newPassword.length > 0, password: newPassword, method: newMethod });
  };

  const cancelForm = () => {
    setIsChecked(defaultIsChecked);
    closeForm();
  };

  const validateForm = (valid) => setIsFormValid(valid);

  // const changeSelected = (_, value) => {
  //   setIsChecked(value);
  //
  //   if (value && password.length === 0) openForm();
  //
  //   if (!value) {
  //     setPassword("");
  //     onChange({ isChecked: false, password: "" });
  //   }
  // };

  if (isLoading) return <Skeleton width="25%" />;

  return (
    <SettingsField
      label={_("Encryption")}
      description={_("Full disk encryption (FDE) allows to protect the information stored at the device, including data, programs, and system files.")}
      value={isChecked ? _("using LUKS2") : _("none")}
      onClick={openForm}
    >
      <Popup title={_("Encryption settings")} isOpen={isFormOpen}>
        <EncryptionSettingsForm
          id="encryptionSettingsForm"
          password={password}
          method={method}
          methods={methods}
          onSubmit={acceptForm}
          onValidate={validateForm}
        />
        <Popup.Actions>
          <Popup.Confirm form="encryptionSettingsForm" type="submit" isDisabled={!isFormValid}>{_("Accept")}</Popup.Confirm>
          <Popup.Cancel onClick={cancelForm} />
        </Popup.Actions>
      </Popup>
    </SettingsField>
  );
};

/**
 * Allows to select the space policy.
 * @component
 *
 * @param {object} props
 * @param {SpacePolicy|undefined} props.policy
 * @param {SpaceAction[]} props.actions
 * @param {StorageDevice[]} props.devices
 * @param {boolean} props.isLoading
 * @param {(config: SpacePolicyConfig) => void} props.onChange
 *
 * @typedef {object} SpacePolicyConfig
 * @property {SpacePolicy} spacePolicy
 * @property {SpaceAction[]} spaceActions
 */
const SpacePolicyField = ({
  policy,
  actions,
  devices,
  isLoading,
  onChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);

  const closeDialog = () => setIsDialogOpen(false);

  const onAccept = ({ spacePolicy, spaceActions }) => {
    closeDialog();
    onChange({ spacePolicy, spaceActions });
  };

  if (isLoading || !policy) {
    return <Skeleton screenreaderText={_("Waiting for information about space policy")} width="25%" />;
  }

  let currentValue;

  // eslint-disable-next-line agama-i18n/string-literals
  if (policy.summaryLabels.length === 1) currentValue = _(policy.summaryLabels[0]);

  // eslint-disable-next-line agama-i18n/string-literals
  currentValue = sprintf(n_(policy.summaryLabels[0], policy.summaryLabels[1], devices.length), devices.length);

  const description = _("Allocating the file systems might need to find free space \
in the installation device(s).");

  return (
    <SettingsField
      label={_("Find space")}
      value={currentValue}
      onClick={openDialog}
      description={description}
    >
      <If
        condition={isDialogOpen}
        then={
          <SpacePolicyDialog
            isOpen
            policy={policy}
            actions={actions}
            devices={devices}
            onAccept={onAccept}
            onCancel={closeDialog}
          />
        }
      />
    </SettingsField>
  );
};

/**
 * Section for editing the proposal settings
 * @component
 *
 * @param {object} props
 * @param {ProposalSettings} props.settings
 * @param {StorageDevice[]} [props.availableDevices=[]]
 * @param {String[]} [props.encryptionMethods=[]]
 * @param {Volume[]} [props.volumeTemplates=[]]
 * @param {boolean} [props.isLoading=false]
 * @param {(settings: object) => void} [props.onChange=noop]
 */
export default function ProposalSettingsSection({
  settings,
  availableDevices = [],
  encryptionMethods = [],
  volumeTemplates = [],
  isLoading = false,
  onChange = noop
}) {
  const changeEncryption = ({ password, method }) => {
    onChange({ encryptionPassword: password, encryptionMethod: method });
  };

  const changeBtrfsSnapshots = ({ active, settings }) => {
    const rootVolume = settings.volumes.find((i) => i.mountPath === "/");

    if (active) {
      rootVolume.fsType = "Btrfs";
      rootVolume.snapshots = true;
    } else {
      rootVolume.snapshots = false;
    }

    onChange({ volumes: settings.volumes });
  };

  const changeVolumes = (volumes) => {
    onChange({ volumes });
  };

  const changeSpacePolicy = ({ spacePolicy, spaceActions }) => {
    onChange({
      spacePolicy: spacePolicy.id,
      spaceActions
    });
  };

  const changeBoot = ({ configureBoot, bootDevice }) => {
    onChange({
      configureBoot,
      bootDevice: bootDevice?.name
    });
  };

  const changeTargetDevice = ({ ...settings }) => {
    onChange(settings);
  };

  const lvm = settings.target === "newLvmVg" || settings.target === "reusedLvmVg";
  const encryption = settings.encryptionPassword !== undefined && settings.encryptionPassword.length > 0;
  const { volumes = [], installationDevices = [], spaceActions = [] } = settings;
  const bootDevice = availableDevices.find(d => d.name === settings.bootDevice);
  const defaultBootDevice = availableDevices.find(d => d.name === settings.defaultBootDevice);
  const spacePolicy = SPACE_POLICIES.find(p => p.id === settings.spacePolicy);

  // Templates for already existing mount points are filtered out
  const usefulTemplates = () => {
    const mountPaths = volumes.map(v => v.mountPath);
    return volumeTemplates.filter(t => (
      t.mountPath.length > 0 && !mountPaths.includes(t.mountPath)
    ));
  };

  return (
    <>
      <Section title="Proposal">
        <ProposalDeviceSection
          settings={settings}
          availableDevices={availableDevices}
          onChange={changeTargetDevice}
        />

        <EncryptionField
          password={settings.encryptionPassword || ""}
          method={settings.encryptionMethod}
          methods={encryptionMethods}
          isChecked={encryption}
          isLoading={settings.encryptionPassword === undefined}
          onChange={changeEncryption}
        />
        <SnapshotsField
          settings={settings}
          onChange={changeBtrfsSnapshots}
        />
        <ProposalVolumes
          volumes={volumes}
          templates={usefulTemplates()}
          options={{ lvm, encryption }}
          isLoading={isLoading && settings.volumes === undefined}
          onChange={changeVolumes}
          configureBoot={settings.configureBoot}
          bootDevice={bootDevice}
          defaultBootDevice={defaultBootDevice}
          devices={availableDevices}
          onBootChange={changeBoot}
        />

        <SpacePolicyField
          policy={spacePolicy}
          actions={spaceActions}
          devices={installationDevices}
          isLoading={isLoading}
          onChange={changeSpacePolicy}
        />
      </Section>
    </>
  );
}

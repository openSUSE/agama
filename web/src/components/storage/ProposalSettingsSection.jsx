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

import React, { useEffect, useState } from "react";
import { Button, Checkbox, Form, Skeleton, Switch, Tooltip } from "@patternfly/react-core";

import { sprintf } from "sprintf-js";
import { _, n_ } from "~/i18n";
import { BootSelectionDialog, ProposalVolumes, SpacePolicyDialog } from "~/components/storage";
import { If, PasswordAndConfirmationInput, Section, Popup } from "~/components/core";
import { Icon } from "~/components/layout";
import { noop } from "~/utils";
import { hasFS, deviceLabel, SPACE_POLICIES } from "~/components/storage/utils";

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

  useEffect(() => {
    if (password.length === 0) onValidate(false);
  }, [password, onValidate]);

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

  const switchState = (_, checked) => {
    onChange({ active: checked, settings });
  };

  if (!rootVolume.outline.snapshotsConfigurable) return;

  const explanation = _("Uses Btrfs for the root file system allowing to boot to a previous \
version of the system after configuration changes or software upgrades.");

  return (
    <div>
      <Switch
        id="snapshots"
        label={_("Btrfs Snapshots")}
        isChecked={isChecked}
        onChange={switchState}
      />
      <div style={{ color: "gray", marginInlineStart: "calc(40px + 1ch)", marginBlockStart: "var(--spacer-smaller)" }}>
        {explanation}
      </div>
    </div>
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
    onChange({ password: newPassword, method: newMethod });
  };

  const cancelForm = () => {
    setIsChecked(defaultIsChecked);
    closeForm();
  };

  const validateForm = (valid) => setIsFormValid(valid);

  const changeSelected = (_, value) => {
    setIsChecked(value);

    if (value && password.length === 0) openForm();

    if (!value) {
      onChange({ password: "" });
    }
  };

  const ChangeSettingsButton = ({ isDisabled }) => {
    return (
      <Button isDisabled={isDisabled || undefined} variant="link" isInline onClick={openForm}>
        { _("Change encryption settings") }
      </Button>
    );
  };

  if (isLoading) return <Skeleton width="25%" />;

  return (
    <>
      <div>
        <Switch
          id="encryption"
          label={_("Encryption")}
          isChecked={isChecked}
          onChange={changeSelected}
        />

        <div style={{ color: "gray", marginInlineStart: "calc(40px + 1ch)", marginBlockStart: "var(--spacer-small)" }}>
          <ChangeSettingsButton isDisabled={!isChecked} />
        </div>
      </div>

      <Popup aria-label={_("Encryption settings")} title={_("Encryption settings")} isOpen={isFormOpen}>
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
    </>
  );
};

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

  const label = _("Boot partition");
  let value;

  if (!configureBoot) {
    value = _("none (manual boot setup)");
  } else if (!bootDevice) {
    value = _("at the installation device");
  } else {
    value = sprintf(_("at %s"), deviceLabel(bootDevice));
  }

  if (isLoading) {
    return <Skeleton screenreaderText={_("Waiting for information about boot config")} width="25%" />;
  }

  return (
    <div>
      <div className="agama-field">
        <Tooltip content={_("Change boot device")} aria="labelledby">
          <button className="plain-control" onClick={openDialog}>
            <Icon name="settings" />
          </button>
        </Tooltip>
        <span><b>{label}</b> {value}</span>
      </div>
      <div style={{ color: "gray", marginInlineStart: "calc(40px + 1ch)" }}>
        {_(
          "To ensure the new system is able to boot, the installer may need to create or configure some \
          partitions in the appropriate disk."
        )}
      </div>
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
    </div>
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

  const label = () => {
    // eslint-disable-next-line agama-i18n/string-literals
    if (policy.summaryLabels.length === 1) return _(policy.summaryLabels[0]);

    // eslint-disable-next-line agama-i18n/string-literals
    return sprintf(n_(policy.summaryLabels[0], policy.summaryLabels[1], devices.length), devices.length);
  };

  if (isLoading || !policy) {
    return <Skeleton screenreaderText={_("Waiting for information about space policy")} width="25%" />;
  }

  return (
    <div className="split">
      <span>{_("Find space")}</span>
      <Button variant="link" isInline onClick={openDialog}>{label()}</Button>
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
    </div>
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
        {/* <div className="subheader"> */}
        {/*   <span>{_("Settings")}</span> */}
        {/* </div> */}
        {/**/}
        <div>
          <div className="agama-field">
            <Tooltip content={_("Change instalaltion device")} aria="labelledby">
              <button className="plain-control">
                <Icon name="settings" />
              </button>
            </Tooltip>
            <span><b>{_("Installation device")}</b> {_("/dev/vdc")}</span>
          </div>
          <div style={{ color: "gray", marginInlineStart: "calc(40px + 1ch)" }}>
            <span
              dangerouslySetInnerHTML={{
                // TRANSLATORS: The storage "Device" sections's description. Do not
                // translate 'abbr' and 'title', they are part of the HTML markup.
                __html: _("Select the main disk or <abbr title='Logical Volume Manager'>LVM</abbr> \
        Volume Group for installation.")
              }}
            />
          </div>
        </div>

        <BootConfigField
          configureBoot={settings.configureBoot}
          bootDevice={bootDevice}
          defaultBootDevice={defaultBootDevice}
          devices={availableDevices}
          isLoading={isLoading}
          onChange={changeBoot}
        />
        <SnapshotsField
          settings={settings}
          onChange={changeBtrfsSnapshots}
        />
        <EncryptionField
          password={settings.encryptionPassword || ""}
          method={settings.encryptionMethod}
          methods={encryptionMethods}
          isChecked={encryption}
          isLoading={settings.encryptionPassword === undefined}
          onChange={changeEncryption}
        />

        <ProposalVolumes
          volumes={volumes}
          templates={usefulTemplates()}
          options={{ lvm, encryption }}
          isLoading={isLoading && settings.volumes === undefined}
          onChange={changeVolumes}
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

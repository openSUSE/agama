/*
 * Copyright (c) [2022] SUSE LLC
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

import React from "react";
import { Button, Modal } from "@patternfly/react-core";

import { _ } from "~/i18n";
import { partition } from "~/utils";

/**
 * Wrapper component for holding Popup actions
 *
 * Useful and required for placing the components to be used as PF/Modal actions, usually a
 * Popup.Action or PF/Button
 *
 * @see Popup examples.
 *
 * @param {React.ReactNode} [props.children] - a collection of Action components
 */
const Actions = ({ children }) => <>{children}</>;

/**
 * A convenient component representing a Popup action
 *
 * Built on top of {@link https://www.patternfly.org/components/button PF/Button}
 *
 * @see Popup examples.
 *
 * @param {React.ReactNode} props.children - content of the action
 * @param {object} [props] - PF/Button props, see {@link https://www.patternfly.org/components/button#props}
 */
const Action = ({ children, ...props }) => (
  <Button { ...props }>
    {children}
  </Button>
);

/**
 * A Popup primary action
 *
 * It always set `variant` {@link https://www.patternfly.org/components/button PF/Button}
 * prop to "primary", no matter what given in `props`.
 *
 * @example <caption>Simple usage</caption>
 *   <PrimaryAction onClick={doSomething}>Let's go</PrimaryAction>
 *
 * @example <caption>Advanced usage</caption>
 *   <PrimaryAction onClick={upload}>
 *     <UploadIcon />
 *     <Text>Upload</Text>
 *   </PrimaryAction>
 *
 * @param {React.ReactNode} props.children - content of the action
 * @param {object} [props] - {@link Action} props
 */
const PrimaryAction = ({ children, ...props }) => (
  <Action { ...props } variant="primary">{ children }</Action>
);

/**
 * Shortcut for the primary "Confirm" action
 *
 * @example <caption>Using it with the default text</caption>
 *   <Confirm onClick={confirm} />
 *
 * @example <caption>Using it with a custom text</caption>
 *   <Confirm onClick={accept}>Accept</Confirm>
 *
 * @param {React.ReactNode} [props.children="confirm"] - content of the action
 * @param {object} [props] - {@link Action} props
 */
const Confirm = ({ children = _("Confirm"), ...props }) => (
  <PrimaryAction key="confirm" { ...props }>{ children }</PrimaryAction>
);

/**
 * A Popup secondary action
 *
 * It always set `variant` {@link https://www.patternfly.org/components/button PF/Button}
 * prop to "secondary", no matter what given in `props`.
 *
 * @example <caption>Simple usage</caption>
 *   <SecondaryAction onClick={cancel}>Cancel</SecondaryAction>
 *
 * @example <caption>Advanced usage</caption>
 *   <SecondaryAction onClick={upload}>
 *     <DismissIcon />
 *     <Text>Dismiss</Text>
 *   </SecondaryAction>
 *
 * @param {React.ReactNode} props.children - content of the action
 * @param {object} [props] - {@link Action} props
 */
const SecondaryAction = ({ children, ...props }) => (
  <Action { ...props } variant="secondary">{ children }</Action>
);

/**
 * Shortcut for the secondary "Cancel" action
 *
 * @example <caption>Using it with the default text</caption>
 *   <Cancel onClick={cancel} />
 *
 * @example <caption>Using it with a custom text</caption>
 *   <Cancel onClick={dismiss}>Dismiss</Confirm>
 *
 * @param {React.ReactNode} [props.children="Cancel"] - content of the action
 * @param {object} [props] - {@link Action} props
 */
const Cancel = ({ children = _("Cancel"), ...props }) => (
  <SecondaryAction key="cancel" { ...props }>{ children }</SecondaryAction>
);

/**
 * A Popup additional action, rendered as a link
 *
 * It always set `variant` {@link https://www.patternfly.org/components/button PF/Button} prop
 * to "link", no matter what is given in `props`
 *
 * @example <caption>Simple usage</caption>
 *   <AncillaryAction onClick={turnUserSettingsOff}>Do not set this</AncillaryAction>
 *
 * @example <caption>Advanced usage</caption>
 *   <AncillaryAction onClick={turnUserSettingsOff}>
 *     <RemoveIcon />
 *     <Text>Do not set</Text>
 *   </AncillaryAction>
 *
 * @param {React.ReactNode} props.children - content of the action
 * @param {object} [props] - {@link Action} props
 */
const AncillaryAction = ({ children, ...props }) => (
  <Action { ...props } variant="link">{ children }</Action>
);

/**
 * Agama component for displaying a popup
 *
 * Built on top of {@link https://www.patternfly.org/components/modal PF/Modal}, it
 * manipulates the children object for extracting {Actions}.
 *
 * @example <caption>Usage example</caption>
 *   <Popup
 *     title="Users"
 *     isOpen={showUserSettings}
 *   >
 *     <UserSettingsForm />
 *     <Popup.Actions>
 *       <Popup.PrimaryAction key="confirm" onClick={updateUserSetting}>Confirm</Popup.PrimaryAction>
 *       <Popup.SecondaryAction key="cancel" onClick={cancel}>Cancel</Popup.SecondaryAction>
 *       <Popup.AncillaryAction key="unset" onClick={turnUserSettingsOff}>
 *         Do not set a user
 *       </Popup.AncillaryAction>
 *     </Popup.Actions>
 *   </Popup>
 *
 * @example <caption>Usage example using shortcuts actions</caption>
 *   <Popup
 *     title="Users"
 *     isOpen={showUserSettings}
 *   >
 *     <UserSettingsForm />
 *     <Popup.Actions>
 *       <Popup.Confirm onClick={updateUserSetting} />
 *       <Popup.Cancel onClick={cancel} />
 *       <Popup.AncillaryAction key="unset" onClick={turnUserSettingsOff}>
 *         Do not set a user
 *       </Popup.AncillaryAction>
 *     </Popup.Actions>
 *   </Popup>
 *
 * @param {object} props - component props
 * @param {boolean} [props.isOpen=false] - whether the popup is displayed or not
 * @param {boolean} [props.showClose=false] - whether the popup should include a "X" action for closing it
 * @param {string} [props.variant="small"] - the popup size, based on PF/Modal `variant` prop
 * @param {React.ReactNode} props.children - the popup content and actions
 * @param {object} [pfModalProps] - PF/Modal props, See {@link https://www.patternfly.org/components/modal#props}
 *
 */
const Popup = ({
  isOpen = false,
  showClose = false,
  variant = "small",
  children,
  ...pfModalProps
}) => {
  const [actions, content] = partition(React.Children.toArray(children), child => child.type === Actions);

  return (
    <Modal
      { ...pfModalProps }
      isOpen={isOpen}
      showClose={showClose}
      variant={variant}
      actions={actions}
    >
      { content }
    </Modal>
  );
};

Popup.Actions = Actions;
Popup.PrimaryAction = PrimaryAction;
Popup.Confirm = Confirm;
Popup.SecondaryAction = SecondaryAction;
Popup.Cancel = Cancel;
Popup.AncillaryAction = AncillaryAction;

export default Popup;

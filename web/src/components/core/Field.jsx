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

import React from "react";
import { Icon } from "~/components/layout";

const Field = ({ children, icon, iconSize, onClick, label, value, description, ...props }) => {
  return (
    <div {...props} data-type="agama/field">
      <div>
        <button className="plain-control" onClick={onClick}>
          <Icon name={icon} size={iconSize || "s"} /> <b>{label}</b>
        </button> {value}
      </div>
      <div>
        {description}
      </div>
      <div>
        { children }
      </div>
    </div>
  );
};

const SettingsField = ({ ...props }) => {
  return <Field {...props} icon="settings_alt" />;
};

const SwitchField = ({ isChecked, ...props }) => {
  const iconName = isChecked ? "toggle_on" : "toggle_off";
  const className = isChecked ? "on" : "off";

  return <Field {...props} icon={iconName} className={className} />;
};

const ExpandableField = ({ isExpanded, ...props }) => {
  const iconName = isExpanded ? "expand_all" : "collapse_all";
  const className = isExpanded ? "expanded" : "collapsed";

  return <Field {...props} icon={iconName} className={className} />;
};

export default Field;
export { SwitchField, ExpandableField, SettingsField };

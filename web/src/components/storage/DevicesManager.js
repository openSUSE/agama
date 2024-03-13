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

import { compact, uniq } from "~/utils";

/**
 * @typedef {import ("~/clients/storage").StorageDevice} StorageDevice
 * @typedef {import ("~/clients/storage").Action} Action
 */

/**
 * Class for managing storage devices.
 */
export default class DevicesManager {
  /**
   * @param {StorageDevice[]} system - Devices representing the current state of the system.
   * @param {StorageDevice[]} staging - Devices representing the target state of the system.
   * @param {Action[]} actions - Actions to perform from system to staging.
   */
  constructor(system, staging, actions) {
    this.system = system;
    this.staging = staging;
    this.actions = actions;
  }

  /**
   * System device with the given SID.
   *
   * @param {Number} sid
   * @returns {StorageDevice|undefined}
   */
  systemDevice(sid) {
    return this.#device(sid, this.system);
  }

  /**
   * Staging device with the given SID.
   *
   * @param {Number} sid
   * @returns {StorageDevice|undefined}
   */
  stagingDevice(sid) {
    return this.#device(sid, this.staging);
  }

  /**
   * Whether the given device exists in system.
   *
   * @param {StorageDevice} device
   * @returns {Boolean}
   */
  existInSystem(device) {
    return this.#exist(device, this.system);
  }

  /**
   * Whether the given device exists in staging.
   *
   * @param {StorageDevice} device
   * @returns {Boolean}
   */
  existInStaging(device) {
    return this.#exist(device, this.staging);
  }

  /**
   * Whether the given device is going to be formatted.
   *
   * @param {StorageDevice} device
   * @returns {Boolean}
   */
  hasNewFilesystem(device) {
    if (!device.filesystem) return false;

    const systemDevice = this.systemDevice(device.sid);
    const systemFilesystemSID = systemDevice?.filesystem?.sid;

    return device.filesystem.sid !== systemFilesystemSID;
  }

  /**
   * Whether the given device is going to be shrunk.
   *
   * @param {StorageDevice} device
   * @returns {Boolean}
   */
  isShrunk(device) {
    return this.shrinkSize(device) > 0;
  }

  /**
   * Amount of bytes the given device is going to be shrunk.
   *
   * @param {StorageDevice} device
   * @returns {Number}
   */
  shrinkSize(device) {
    const systemDevice = this.systemDevice(device.sid);
    const stagingDevice = this.stagingDevice(device.sid);

    if (!systemDevice || !stagingDevice) return 0;

    const amount = systemDevice.size - stagingDevice.size;
    return amount > 0 ? amount : 0;
  }

  /**
   * Disk devices and LVM volume groups used for the installation.
   *
   * @note The used devices are extracted from the actions.
   *
   * @returns {StorageDevice[]}
   */
  usedDevices() {
    const isTarget = (device) => device.isDrive || device.type === "lvmVg";

    // Check in system devices to detect removals.
    const targetSystem = this.system.filter(isTarget);
    const targetStaging = this.staging.filter(isTarget);

    const sids = targetSystem.concat(targetStaging)
      .filter(d => this.#isUsed(d))
      .map(d => d.sid);

    return compact(uniq(sids).map(sid => this.stagingDevice(sid)));
  }

  #device(sid, source) {
    return source.find(d => d.sid === sid);
  }

  #exist(device, source) {
    return this.#device(device.sid, source) !== undefined;
  }

  #isUsed(device) {
    const sids = uniq(compact(this.actions.map(a => a.device)));

    const partitions = device.partitionTable?.partitions || [];
    const lvmLvs = device.logicalVolumes || [];

    return sids.includes(device.sid) ||
      partitions.find(p => this.#isUsed(p)) !== undefined ||
      lvmLvs.find(l => this.#isUsed(l)) !== undefined;
  }
}

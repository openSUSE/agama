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

import { get } from "./http";
import { fetchInstallerStatus } from "./status";

const mockGetFn = jest.fn().mockImplementation(() => {
  return { 
    phase:	2,
    busy:	[],
    iguana:	false,
    canInstall:	false
  };
});

jest.mock("./http", () => {
    return {
      // TODO: fix mocking of get. How to do it for api tests?
      // get: mockGetFn,
    };
});

describe("#fetchInstallerStatus", () => {
    it.skip("parses response from manager/installer", async() => {
        const response = await fetchInstallerStatus();
        expect(response.isBusy).toEqual(false);
    });
});
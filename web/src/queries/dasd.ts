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

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { _ } from "~/i18n";
import {
  disableDASD,
  disableDiag,
  enableDASD,
  enableDiag,
  fetchDASDDevices,
} from "~/api/dasd";
import { useInstallerClient } from "~/context/installer";
import React from "react";
import { hex } from "~/utils";
import { DASDDevice, FormatJob } from "~/types/dasd";
import { fetchStorageJobs, findStorageJob } from "~/api/storage";

/**
 * Returns a query for retrieving the dasd devices
 */
const DASDDevicesQuery = () => ({
  queryKey: ["dasd", "devices"],
  queryFn: fetchDASDDevices,
});

/**
 * Hook that returns DASD devices.
 */
const useDASDDevices = () => {
  const { data: devices } = useSuspenseQuery(DASDDevicesQuery());
  return devices.map((d) => ({ ...d, hexId: hex(d.id) }));
};

/**
 * Returns a query for retrieving DASD format jobs
 */
const DASDFormatJobsQuery = () => ({
  queryKey: ["dasd", "formatJobs"],
  queryFn: () => fetchStorageJobs(),
});

/**
 * Hook that returns DASD format jobs.
 */
const useDASDFormatJobs = () => {
  const { data: jobs } = useSuspenseQuery(DASDFormatJobsQuery());
  return jobs;
};

/**
 * Returns a query for retrieving the dasd format job
 */
const DASDFormatJobQuery = (id: string) => ({
  queryKey: ["dasd", "formatJob", id],
  queryFn: () => findStorageJob(id).then((sj) => ({jobId: sj.id})),
});

/**
 * Hook that returns and specific DASD format job.
 */
const useDASDFormatJob = (id: string) : FormatJob => {
  const { data: job } = useSuspenseQuery(DASDFormatJobQuery(id));
  return job;
};

/**
 * Listens for DASD format job changes.
 */
const useDASDFormatJobChanges = (id: string) : FormatJob => {
  const client = useInstallerClient();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!client) return;

    return client.ws().onEvent((event) => {
      // TODO: for simplicity we now just invalidate query instead of manually adding, removing or changing devices
      if (
        event.type === "DASDFormatJobChanged" && event.jobId === id
      ) {
        const data = queryClient.getQueryData(["dasd", "formatJob", id]) as FormatJob;
        const merged_summary = { ...data.summary, ...event.summary };
        const job = { ...data, summary: merged_summary };
        queryClient.setQueryData(["dasd", "formatJob", id], job);
      }
    });
  });
  const { data: formatJob } = useSuspenseQuery(DASDFormatJobQuery(id));
  return formatJob;
};

/**
 * Returns seleced DASD ids
 */
const selectedDASDQuery = () => ({
  queryKey: ["dasd", "selected"],
  queryFn: async () => {
    return Promise.resolve([]);
  },
  staleTime: Infinity,
});

const useSelectedDASD = (): DASDDevice[] => {
  const { data } = useQuery(selectedDASDQuery());

  return data || [];
}

const useSelectedDASDChange = () => {
  type SelectDASD = {
    unselect?: boolean,
    device?: DASDDevice,
    devices?: DASDDevice[]
  }

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SelectDASD): Promise<SelectDASD> => Promise.resolve(data),
    onSuccess: (data: SelectDASD) => queryClient.setQueryData(["dasd", "selected"], (prev: DASDDevice[]) => {
      if (data.unselect) {
        if (data.device) return prev.filter((d) => d.id !== data.device.id);
        if (data.devices) return [];

      } else {
        if (data.device) return [...prev, data.device];
        if (data.devices) return data.devices;
      }
    }),
  });

  return mutation;
};

/**
 * Returns DASD filters
 */
const filterDASDQuery = () => ({
  queryKey: ["dasd", "filter"],
  queryFn: async () => {
    return Promise.resolve({ minChannel: "", maxChannel: "" });
  },
  staleTime: Infinity,
});

const useFilterDASD = (): { minChannel?: string, maxChannel?: string } => {
  const { data } = useQuery(filterDASDQuery());

  return data || { minChannel: "", maxChannel: "" };
}

const useFilterDASDChange = () => {
  type FilterDASD = {
    maxChannel?: string;
    minChannel?: string;
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FilterDASD): Promise<FilterDASD> => Promise.resolve(data),
    onSuccess: (data: FilterDASD) => {
      queryClient.setQueryData(["dasd", "filter"], (prev: FilterDASD) => ({
        ...prev,
        ...data
      }));
    },
  });

  return mutation;
};

/**
 * Listens for DASD devices changes.
 */
const useDASDDevicesChanges = () => {
  const client = useInstallerClient();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!client) return;

    return client.ws().onEvent((event) => {
      if (event.type === "DASDDeviceAdded") {
        const device: DASDDevice = event.device;
        queryClient.setQueryData(["dasd", "devices"], (prev: DASDDevice[]) => {
          // do not use push here as updater has to be immutable
          const res = prev.concat([device]);
          return res;
        });
      } else if (event.type === "DASDDeviceRemoved") {
        const device: DASDDevice = event.device;
        const { id } = device;
        queryClient.setQueryData(["dasd", "devices"], (prev: DASDDevice[]) => {
          const res = prev.filter(dev => dev.id !== id);
          return res;
        });
      } else if (event.type === "DASDDeviceChanged") {
        const device: DASDDevice = event.device;
        const { id } = device;
        queryClient.setQueryData(["dasd", "devices"], (prev: DASDDevice[]) => {
          // deep copy of original to have it immutable
          const res = [...prev];
          const index = res.findIndex(dev => dev.id === id);
          res[index] = device;
          return res;
        });
      }
    });
  });
  const { data: devices } = useSuspenseQuery(DASDDevicesQuery());
  return devices;
};

const useDASDEnableMutation = () => {
  const queryClient = useQueryClient();
  const query = {
    mutationFn: enableDASD,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dasd", "devices"] });
    },
  };
  return useMutation(query);
};

const useDASDDisableMutation = () => {
  const queryClient = useQueryClient();
  const query = {
    mutationFn: disableDASD,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dasd", "devices"] });
    },
  };
  return useMutation(query);
};

const useDiagEnableMutation = () => {
  const queryClient = useQueryClient();
  const query = {
    mutationFn: enableDiag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dasd", "devices"] });
    },
  };
  return useMutation(query);
};

const useDiagDisableMutation = () => {
  const queryClient = useQueryClient();
  const query = {
    mutationFn: disableDiag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dasd", "devices"] });
    },
  };
  return useMutation(query);
};

export {
  useDASDDevices, useDASDDevicesChanges, useDASDEnableMutation, useDASDDisableMutation, useDiagDisableMutation,
  useDiagEnableMutation, useFilterDASDChange, filterDASDQuery, useFilterDASD, useSelectedDASD, useSelectedDASDChange, selectedDASDQuery,
  useDASDFormatJobChanges, useDASDFormatJob, useDASDFormatJobs
};

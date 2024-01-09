# Designing the Btrfs management UI for Agama

## About this Document

The general approach for presenting the storage options to the Agama users is discussed at
[Initial storage screen](./storage_ui.md) and summarized by this mock-up.

![Initial storage screen](images/storage_ui/agama_guided.png)

But choosing Btrfs for the root file-system opens many possibilities and can even change the way the
devices are organized. For example, using subvolumes instead of separate file-systems or spreading
the Btrfs over several block devices (using Btrfs RAID).

This document aims to serve as a base to discuss possibilities in the UI design and to summarize the
adopted solutions.

## Btrfs Implications

In YaST, Btrfs is just another file-system type that can be chosen (like ext4 or xfs). But it
actually has many implications like:

- Btrfs is forced in case of transactional systems
- Possibility to enable snapshots (with the corresponding impact in the suggested sizes for the
  underlying block device)
- [Subvolumes](https://github.com/yast/yast-storage-ng/blob/master/doc/btrfs-subvolumes.md)
  (including shadowing)
- Possibility to define subvolume quotas
- Multi-device file-systems (RAID)

All that happens because Btrfs goes conceptually beyond the traditional Linux file-systems. It
simply works in a different way at several levels.

## Solutions

WIP: this is what we have to write now. There are several options.

Maybe using Btrfs for the root file-system should be a top-level setting like using LVM or encryption.

Maybe we should display some of the Btrfs features (eg. snapshots, transactional, multi-device) as
top-level settings without even mentioning Btrfs (it could be considered an implementation detail).

We also need to consider how to represent subvolumes. Maybe as some special property for the root
volume at the table of volumes. Maybe with each subvolume being an entry in the table of volumes...

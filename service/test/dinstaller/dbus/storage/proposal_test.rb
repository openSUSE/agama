# frozen_string_literal: true

# Copyright (c) [2022] SUSE LLC
#
# All Rights Reserved.
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of version 2 of the GNU General Public License as published
# by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, contact SUSE LLC.
#
# To contact SUSE LLC about this file by physical or electronic mail, you may
# find current contact information at www.suse.com.

require_relative "../../../test_helper"
require "dinstaller/dbus/storage/proposal"
require "dinstaller/dbus/interfaces/service_status"
require "dinstaller/storage/proposal"
require "dinstaller/storage/proposal_settings"
require "dinstaller/storage/volume"
require "y2storage"

describe DInstaller::DBus::Storage::Proposal do
  subject { described_class.new(backend, logger) }

  let(:logger) { Logger.new($stdout, level: :warn) }

  let(:backend) do
    instance_double(DInstaller::Storage::Proposal, on_calculate: nil, calculated_settings: settings)
  end

  let(:settings) { nil }

  let(:service_status_interface) do
    DInstaller::DBus::Interfaces::ServiceStatus::SERVICE_STATUS_INTERFACE
  end

  before do
    allow_any_instance_of(described_class).to receive(:register_service_status_callbacks)
  end

  it "defines ServiceStatus D-Bus interface" do
    expect(subject.intfs.keys).to include(service_status_interface)
  end

  describe ".new" do
    it "configures callbacks from ServiceStatus interface" do
      expect_any_instance_of(described_class).to receive(:register_service_status_callbacks)
      subject
    end
  end

  describe "#available_devices" do
    before do
      allow(backend).to receive(:available_devices).and_return(devices)
    end

    context "if there is no available devices" do
      let(:devices) { [] }

      it "returns an empty list" do
        expect(subject.available_devices).to eq([])
      end
    end

    context "if there are available devices" do
      before do
        allow(backend).to receive(:device_label).with(device1).and_return("Device 1")
        allow(backend).to receive(:device_label).with(device2).and_return("Device 2")
      end

      let(:devices) { [device1, device2] }

      let(:device1) { instance_double(Y2Storage::Disk, name: "/dev/vda") }
      let(:device2) { instance_double(Y2Storage::Disk, name: "/dev/vdb") }

      it "retuns the device name and label for each device" do
        result = subject.available_devices

        expect(result).to contain_exactly(
          ["/dev/vda", "Device 1", {}],
          ["/dev/vdb", "Device 2", {}]
        )
      end
    end
  end

  describe "#candidate_devices" do
    context "if a proposal has not been calculated yet" do
      let(:settings) { nil }

      it "returns an empty list" do
        expect(subject.candidate_devices).to eq([])
      end
    end

    context "if a proposal has been calculated" do
      let(:settings) do
        instance_double(DInstaller::Storage::ProposalSettings,
          candidate_devices: ["/dev/vda", "/dev/vdb"])
      end

      it "returns the candidate devices used by the proposal" do
        expect(subject.candidate_devices).to contain_exactly("/dev/vda", "/dev/vdb")
      end
    end
  end

  describe "#lvm" do
    context "if a proposal has not been calculated yet" do
      let(:settings) { nil }

      it "returns false" do
        expect(subject.lvm).to eq(false)
      end
    end

    context "if a proposal has been calculated" do
      let(:settings) do
        instance_double(DInstaller::Storage::ProposalSettings, lvm: true)
      end

      it "return whether LVM was used" do
        expect(subject.lvm).to eq(true)
      end
    end
  end

  describe "#encryption_password" do
    context "if a proposal has not been calculated yet" do
      let(:settings) { nil }

      it "returns an empty string" do
        expect(subject.encryption_password).to eq("")
      end
    end

    context "if a proposal has been calculated" do
      let(:settings) do
        instance_double(DInstaller::Storage::ProposalSettings, encryption_password: "n0ts3cr3t")
      end

      it "return the encryption password used by the proposal" do
        expect(subject.encryption_password).to eq("n0ts3cr3t")
      end
    end
  end

  describe "#volume_templates" do
    before do
      allow(backend).to receive(:volume_templates).and_return(templates)
    end

    context "if there are no volume templates" do
      let(:templates) { [] }

      it "returns an empty list" do
        expect(subject.volume_templates).to eq([])
      end
    end

    context "if there are volume templates" do
      let(:templates) { [volume1_template, volume2_template] }

      let(:volume1_template) do
        DInstaller::Storage::Volume.new(Y2Storage::VolumeSpecification.new({})).tap do |volume|
          volume.mount_point = "/test"
          volume.device_type = :partition
          volume.encrypted = true
          volume.fs_type = Y2Storage::Filesystems::Type::EXT3
          volume.min_size = Y2Storage::DiskSize.new(1024)
          volume.max_size = Y2Storage::DiskSize.new(2048)
          volume.fixed_size_limits = true
          volume.snapshots = true
        end
      end

      let(:volume2_template) { DInstaller::Storage::Volume.new }

      before do
        allow(volume1_template).to receive(:size_relevant_volumes).and_return(["/home"])
        allow(volume1_template).to receive(:fs_types)
          .and_return([Y2Storage::Filesystems::Type::EXT3])
      end

      it "returns a list with a hash for each volume template" do
        expect(subject.volume_templates.size).to eq(2)
        expect(subject.volume_templates).to all(be_a(Hash))

        template1, template2 = subject.volume_templates

        expect(template1).to eq({
          "MountPoint"            => "/test",
          "Optional"              => false,
          "DeviceType"            => "partition",
          "Encrypted"             => true,
          "FsTypes"               => ["Ext3"],
          "FsType"                => "Ext3",
          "MinSize"               => 1024,
          "MaxSize"               => 2048,
          "FixedSizeLimits"       => true,
          "AdaptiveSizes"         => true,
          "Snapshots"             => true,
          "SnapshotsConfigurable" => false,
          "SnapshotsAffectSizes"  => false,
          "SizeRelevantVolumes"   => ["/home"]
        })

        expect(template2).to eq({
          "Optional"              => true,
          "AdaptiveSizes"         => false,
          "SnapshotsConfigurable" => false,
          "SnapshotsAffectSizes"  => false
        })
      end
    end
  end

  describe "#volumes" do
    let(:settings) do
      DInstaller::Storage::ProposalSettings.new.tap { |s| s.volumes = calculated_volumes }
    end

    context "if the calculated settings has no volumes" do
      let(:calculated_volumes) { [] }

      it "returns an empty list" do
        expect(subject.volumes).to eq([])
      end
    end

    context "if the calculated settings has volumes" do
      let(:calculated_volumes) { [calculated_volume1, calculated_volume2] }

      let(:calculated_volume1) do
        DInstaller::Storage::Volume.new.tap do |volume|
          volume.mount_point = "/test1"
        end
      end

      let(:calculated_volume2) do
        DInstaller::Storage::Volume.new.tap do |volume|
          volume.mount_point = "/test2"
        end
      end

      it "returns a list with a hash for each volume" do
        expect(subject.volumes.size).to eq(2)
        expect(subject.volumes).to all(be_a(Hash))

        volume1, volume2 = subject.volumes

        expect(volume1).to include("MountPoint" => "/test1")
        expect(volume2).to include("MountPoint" => "/test2")
      end
    end
  end

  describe "#actions" do
    before do
      allow(backend).to receive(:actions).and_return(actions)
    end

    context "if there are no actions" do
      let(:actions) { [] }

      it "returns an empty list" do
        expect(subject.actions).to eq([])
      end
    end

    context "if there are actions" do
      let(:actions) { [action1, action2] }

      let(:action1) do
        instance_double(Y2Storage::CompoundAction,
          sentence: "test1", device_is?: false, delete?: false)
      end

      let(:action2) do
        instance_double(Y2Storage::CompoundAction,
          sentence: "test2", device_is?: true, delete?: true)
      end

      it "returns a list with a hash for each action" do
        expect(subject.actions.size).to eq(2)
        expect(subject.actions).to all(be_a(Hash))

        action1, action2 = subject.actions

        expect(action1).to eq({
          "Text"   => "test1",
          "Subvol" => false,
          "Delete" => false
        })

        expect(action2).to eq({
          "Text"   => "test2",
          "Subvol" => true,
          "Delete" => true
        })
      end
    end
  end

  describe "#calculate" do
    let(:dbus_settings) do
      {
        "CandidateDevices"   => ["/dev/vda"],
        "LVM"                => true,
        "EncryptionPassword" => "n0ts3cr3t",
        "Volumes"            => dbus_volumes
      }
    end

    let(:dbus_volumes) do
      [
        { "MountPoint" => "/" },
        { "MountPoint" => "swap" }
      ]
    end

    it "calculates a proposal with settings having values from D-Bus" do
      expect(backend).to receive(:calculate) do |settings|
        expect(settings).to be_a(DInstaller::Storage::ProposalSettings)
        expect(settings.candidate_devices).to contain_exactly("/dev/vda")
        expect(settings.lvm).to eq(true)
        expect(settings.encryption_password).to eq("n0ts3cr3t")
        expect(settings.volumes).to contain_exactly(
          an_object_having_attributes(mount_point: "/"),
          an_object_having_attributes(mount_point: "swap")
        )
      end

      subject.calculate(dbus_settings)
    end

    context "when the D-Bus settings does not include some values" do
      let(:dbus_settings) { {} }

      it "calculates a proposal with settings having default values for the missing settings" do
        expect(backend).to receive(:calculate) do |settings|
          expect(settings).to be_a(DInstaller::Storage::ProposalSettings)
          expect(settings.candidate_devices).to eq([])
          expect(settings.lvm).to be_nil
          expect(settings.encryption_password).to be_nil
          expect(settings.volumes).to eq([])
        end

        subject.calculate(dbus_settings)
      end
    end

    context "when the D-Bus settings includes a volume" do
      let(:dbus_volumes) { [dbus_volume1] }

      let(:dbus_volume1) do
        {
          "DeviceType"      => "lvm_lv",
          "Encrypted"       => true,
          "MountPoint"      => "/",
          "FixedSizeLimits" => true,
          "MinSize"         => 1024,
          "MaxSize"         => 2048,
          "FsType"          => "Ext3",
          "Snapshots"       => true
        }
      end

      it "calculates a proposal with settings having a volume with values from D-Bus" do
        expect(backend).to receive(:calculate) do |settings|
          volume = settings.volumes.first

          expect(volume.device_type).to eq(:lvm_lv)
          expect(volume.encrypted).to eq(true)
          expect(volume.mount_point).to eq("/")
          expect(volume.fixed_size_limits).to eq(true)
          expect(volume.min_size.to_i).to eq(1024)
          expect(volume.max_size.to_i).to eq(2048)
          expect(volume.snapshots).to eq(true)
        end

        subject.calculate(dbus_settings)
      end

      context "and the D-Bus volume does not include some values" do
        let(:dbus_volume1) { { "MountPoint" => "/" } }

        it "calculates a proposal with settings having a volume with missing values" do
          expect(backend).to receive(:calculate) do |settings|
            volume = settings.volumes.first

            expect(volume.device_type).to be_nil
            expect(volume.encrypted).to be_nil
            expect(volume.mount_point).to eq("/")
            expect(volume.fixed_size_limits).to be_nil
            expect(volume.min_size).to be_nil
            expect(volume.max_size).to be_nil
            expect(volume.snapshots).to be_nil
          end

          subject.calculate(dbus_settings)
        end
      end
    end
  end
end

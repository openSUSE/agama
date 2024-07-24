# frozen_string_literal: true

# Copyright (c) [2024] SUSE LLC
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

require "agama/storage/config"
require "agama/storage/config_conversions/drive/from_json"

module Agama
  module Storage
    module ConfigConversions
      # Config conversion from JSON hash according to schema.
      class FromJSON
        # @todo Replace product_config param by a ProductDefinition.
        #
        # @param config_json [Hash]
        # @param product_config [Agama::Config]
        def initialize(config_json, product_config:)
          @config_json = config_json
          @product_config = product_config
        end

        # Performs the conversion from Hash according to the JSON schema.
        #
        # @return [Storage::Config]
        def convert
          # @todo Raise error if config_json does not match the JSON schema.
          # boot_settings = boot_conversion
          Agama::Storage::Config.new.tap do |config|
            config.drives = convert_drives
          end
        end

      private

        # @return [Hash]
        attr_reader :config_json

        # @return [Agama::Config]
        attr_reader :product_config

        # def boot_conversion
        #   boot_json = config_json[:boot]
        #   return unless boot_json

        #   Agama::Storage::BootSettings.new.tap do |boot_settings|
        #     boot_settings.configure = boot_json[:configure]
        #     boot_settings.device = boot_json[:device]
        #   end
        # end

        # @return [Array<Configs::Drive>]
        def convert_drives
          drives_json = config_json[:drives]
          return [] unless drives_json

          drives_json.map { |d| convert_drive(d) }
        end

        # @return [Configs::Drive]
        def convert_drive(drive_json)
          Drive::FromJSON.new(drive_json,
            settings: settings, volume_builder: volume_builder).convert
        end

        # @return [ProposalSettings]
        def settings
          @settings ||= ProposalSettingsReader.new(product_config).read
        end

        # @return [VolumeTemplatesBuilder]
        def volume_builder
          @volume_builder ||= VolumeTemplatesBuilder.new_from_config(product_config)
        end
      end
    end
  end
end

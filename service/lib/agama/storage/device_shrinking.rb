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

require "yast/i18n"
require "y2storage"

module Agama
  module Storage
    class DeviceShrinking
      include Yast::I18n

      def initialize(device)
        textdomain "agama"

        @device = device
      end

      def supported?
        (!device.exists_in_probed? || has_content?) && has_min_size? && !has_reasons?
      end

      def min_size
        return nil unless supported?

        device.resize_info.min_size
      end

      def unsupported_reasons
        return nil if supported?

        [content_reason, shrinking_reason, resize_reason].compact
      end

    private

      attr_reader :device

      SHRINKING_REASONS = [
        :RB_SHRINK_NOT_SUPPORTED_BY_FILESYSTEM,
        :RB_SHRINK_NOT_SUPPORTED_BY_MULTIDEVICE_FILESYSTE,
        :RB_MIN_SIZE_FOR_FILESYSTEM,
        :RB_MIN_SIZE_FOR_PARTITION,
        :RB_SHRINK_NOT_SUPPORTED_FOR_LVM_LV_TYPE,
        :RB_MIN_SIZE_FOR_LVM_LV,
        :RB_FILESYSTEM_FULL
      ].freeze
      private_constant :SHRINKING_REASONS

      RESIZE_REASONS = [
        :RB_RESIZE_NOT_SUPPORTED_BY_DEVICE,
        :RB_MIN_MAX_ERROR,
        :RB_FILESYSTEM_INCONSISTENT,
        :RB_EXTENDED_PARTITION,
        :RB_ON_IMPLICIT_PARTITION_TABLE,
        :RB_RESIZE_NOT_SUPPORTED_FOR_LVM_LV_TYPE,
        :RB_RESIZE_NOT_SUPPORTED_DUE_TO_SNAPSHOTS,
        :RB_PASSWORD_REQUIRED
      ].freeze
      private_constant :RESIZE_REASONS

      def has_content?
        @device.descendants.any?
      end

      def has_min_size?
        min_size = device.resize_info.min_size

        min_size > 0 && min_size != device.size
      end

      def has_reasons?
        has_shrinking_reasons? || has_resize_reasons?
      end

      def has_shrinking_reasons?
        device.resize_info.reasons.any? { |r| SHRINKING_REASONS.include?(r) }
      end

      def has_resize_reasons?
        device.resize_info.reasons.any? { |r| RESIZE_REASONS.include?(r) }
      end

      def content_reason
        return nil if has_content?

        _("Neither a file system nor a storage system was detected on the device. In case the " \
          "device does contain a file system or a storage system that is not supported, resizing " \
          "will most likely cause data loss.")
      end

      def shrinking_reason
        return nil if has_min_size? && !has_shrinking_reasons?

        _("The device does not allow shrinking")
      end

      def resize_reason
        return nil unless has_resize_reasons?

        _("The device does not allow resizing")
      end
    end
  end
end

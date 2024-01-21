#!/bin/sh
set -x

echo "Get the list of locales (using a method call without arguments)"
curl -X PUT -H "Content-Type: application/json" http://localhost:9091/dbus/call \
	-d @examples/call_method_no_args.json
echo

echo "Set the first user (using a method call with arguments)"
curl -X PUT -H "Content-Type: application/json" http://localhost:9091/dbus/call \
	-d @examples/call_method_with_args.json
echo

echo "Set the locale (using a method call)"
echo "TODO: fix the return value"
curl -X PUT -H "Content-Type: application/json" http://localhost:9091/dbus/call \
	-d @examples/call_method_with_variant_args.json
echo

echo "Get the first user (using properties Get)"
curl -X GET -H "Content-Type: application/json" http://localhost:9091/dbus/properties \
	-d @examples/get_property.json
echo

echo "Set the locale (using properties Set)"
curl -X PUT -H "Content-Type: application/json" http://localhost:9091/dbus/properties \
	-d @examples/set_property.json
echo

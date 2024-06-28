import { atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { createDefaultClient } from "~/client";

const client = await createDefaultClient();
// const response = await fetch("/api/l10n/config");

const config = atom({}, async (get, set) => {
  const response = await fetch("/api/l10n/config");
  set(await response.json());
});

const locales = atom(async () => {
  const response = await fetch("/api/l10n/locales");
  const values = await response.json();
  return values.map(({ id, language, territory }) => ({ id, name: language, territory }));
});

const selectedLocales = atom(async (get) => {
  const { locales } = await get(config);
  return locales;
});

const keymaps = atom([]);
const timezones = atom([]);

const configSubscription = atomEffect((get, set) => {
  return client.l10n.onLocalesChange((locales) => {
    const currentConfig = get(config);
    set(config, { ...currentConfig, locales });
  });
});

export {
  locales,
  selectedLocales,
  keymaps,
  timezones,
  configSubscription
};

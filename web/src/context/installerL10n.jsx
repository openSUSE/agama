/*
 * Copyright (c) [2023] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
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

// cspell:ignore localectl setxkbmap xorg
// @ts-check

import React, { useCallback, useEffect, useState } from "react";
import { useCancellablePromise, locationReload, setLocationSearch } from "~/utils";
import { useInstallerClientStatus } from "./installer";
import agama from "~/agama";
import supportedLanguages from "~/languages.json";
import { fetchConfig, updateConfig } from "~/api/l10n";

const L10nContext = React.createContext(null);

/**
 * Installer localization context.
 *
 * @typedef {object} L10nContext
 * @property {string|undefined} language - Current language.
 * @property {string|undefined} keymap - Current keymap.
 * @property {(language: string) => Promise<void>} changeLanguage - Function to change the current language.
 * @property {(keymap: string) => Promise<void>} changeKeymap - Function to change the current keymap.
 *
 * @return {L10nContext}
 */
function useInstallerL10n() {
  const context = React.useContext(L10nContext);

  if (!context) {
    throw new Error("useInstallerL10n must be used within a InstallerL10nContext");
  }

  return context;
}

/**
 * Current language (in xx_XX format).
 *
 * It takes the language from the agamaLang cookie.
 *
 * @return {string|undefined} Undefined if language is not set.
 */
function agamaLanguage() {
  // language from cookie, empty string if not set (regexp taken from Cockpit)
  // https://github.com/cockpit-project/cockpit/blob/98a2e093c42ea8cd2431cf15c7ca0e44bb4ce3f1/pkg/shell/shell-modals.jsx#L91
  const languageString = decodeURIComponent(
    document.cookie.replace(/(?:(?:^|.*;\s*)agamaLang\s*=\s*([^;]*).*$)|^.*$/, "$1"),
  );
  if (languageString) {
    return languageString.toLowerCase();
  }
}

/**
 * Helper function for storing the Agama language.
 *
 * Automatically converts the language from xx_XX to xx-xx, as it is the one used by Agama.
 *
 * @param {string} language - The new locale (e.g., "cs", "cs_CZ").
 * @return {boolean} True if the locale was changed.
 */
function storeAgamaLanguage(language) {
  const current = agamaLanguage();
  if (current === language) return false;

  // Code taken from Cockpit.
  const cookie =
    "agamaLang=" + encodeURIComponent(language) + "; path=/; expires=Sun, 16 Jul 3567 06:23:41 GMT";
  document.cookie = cookie;

  // for backward compatibility, CockpitLang cookie is needed to load correct po.js content from Cockpit
  // TODO: remove after dropping Cockpit completely
  const cockpit_cookie =
    "CockpitLang=" +
    encodeURIComponent(language) +
    "; path=/; expires=Sun, 16 Jul 3567 06:23:41 GMT";
  document.cookie = cockpit_cookie;
  window.localStorage.setItem("cockpit.lang", language);

  return true;
}

/**
 * Returns the language tag from the query string.
 *
 * Query supports 'xx-xx', 'xx_xx', 'xx-XX' and 'xx_XX' formats.
 *
 * @return {string|undefined} Undefined if not set.
 */
function languageFromQuery() {
  const lang = new URLSearchParams(window.location.search).get("lang");
  if (!lang) return undefined;

  const [language, country] = lang.toLowerCase().split(/[-_]/);
  return country ? `${language}-${country}` : language;
}

/**
 * Generates a RFC 5646 (or BCP 78) language tag from a locale.
 *
 * @param {string} locale
 * @return {string}
 *
 * @private
 * @see https://datatracker.ietf.org/doc/html/rfc5646
 * @see https://www.rfc-editor.org/info/bcp78
 */
function languageFromLocale(locale) {
  const [language] = locale.split(".");
  return language.replace("_", "-").toLowerCase();
}

/**
 * Converts a RFC 5646 language tag to a locale.
 *
 * It forces the encoding to "UTF-8".
 *
 * @param {string} language
 * @return {string}
 *
 * @private
 * @see https://datatracker.ietf.org/doc/html/rfc5646
 * @see https://www.rfc-editor.org/info/bcp78
 */
function languageToLocale(language) {
  const [lang, country] = language.split("-");
  const locale = country ? `${lang}_${country.toUpperCase()}` : lang;
  return `${locale}.UTF-8`;
}

/**
 * List of RFC 5646 (or BCP 78) language tags from the navigator.
 *
 * @return {Array<string>}
 */
function navigatorLanguages() {
  return navigator.languages.map((l) => l.toLowerCase());
}

/**
 * Returns the first supported language from the given list.
 *
 * @param {Array<string>} languages
 * @return {string|undefined} Undefined if none of the given languages is supported.
 */
function findSupportedLanguage(languages) {
  const supported = Object.keys(supportedLanguages);

  for (const candidate of languages) {
    const [language, country] = candidate.split("-");

    const match = supported.find((s) => {
      const [supportedLanguage, supportedCountry] = s.split("-");
      if (language === supportedLanguage) {
        return country === undefined || country === supportedCountry;
      } else {
        return false;
      }
    });
    if (match) return match;
  }
}

/**
 * Reloads the page.
 *
 * It uses the window.location.replace instead of the reload function synchronizing the "lang"
 * argument from the URL if present.
 *
 * @param {string} newLanguage
 */
function reload(newLanguage) {
  const query = new URLSearchParams(window.location.search);
  if (query.has("lang") && query.get("lang") !== newLanguage) {
    query.set("lang", newLanguage);
    // Setting location search with a different value makes the browser to navigate to the new URL.
    setLocationSearch(query.toString());
  } else {
    locationReload();
  }
}

/**
 * This provider sets the installer locale. By default, it uses the URL "lang" query parameter or
 * the preferred locale from the browser and synchronizes the UI and the backend locales. To
 * activate a new locale it reloads the whole page.
 *
 * Additionally, it offers a function to change the current locale.
 *
 * The format of the language tag in the query parameter follows the
 * [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646) specification.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children] - Content to display within the wrapper.
 *
 * @see useInstallerL10n
 */
function InstallerL10nProvider({ children }) {
  const { connected } = useInstallerClientStatus();
  const [language, setLanguage] = useState(undefined);
  const [keymap, setKeymap] = useState(undefined);
  const [backendPending, setBackendPending] = useState(false);
  const { cancellablePromise } = useCancellablePromise();

  const storeInstallerLanguage = useCallback(
    async (newLanguage) => {
      if (!connected) {
        setBackendPending(true);
        return false;
      }

      const config = await cancellablePromise(fetchConfig());
      const currentLanguage = languageFromLocale(config.uiLocale);

      if (currentLanguage !== newLanguage) {
        // FIXME: fallback to en-US if the language is not supported.
        await cancellablePromise(updateConfig({ uiLocale: languageToLocale(newLanguage) }));
        return true;
      }

      return false;
    },
    [connected, cancellablePromise],
  );

  const changeLanguage = useCallback(
    async (lang) => {
      const wanted = lang || languageFromQuery();

      if (wanted === "xx" || wanted === "xx-xx") {
        agama.language = wanted;
        setLanguage(wanted);
        return;
      }

      const current = agamaLanguage();
      const candidateLanguages = [wanted, current].concat(navigatorLanguages()).filter((l) => l);
      const newLanguage = findSupportedLanguage(candidateLanguages) || "en-us";

      let mustReload = storeAgamaLanguage(newLanguage);
      mustReload = (await storeInstallerLanguage(newLanguage)) || mustReload;

      if (mustReload) {
        reload(newLanguage);
      } else {
        setLanguage(newLanguage);
      }
    },
    [storeInstallerLanguage, setLanguage],
  );

  const changeKeymap = useCallback(
    async (id) => {
      if (!connected) return;

      setKeymap(id);
      updateConfig({ uiKeymap: id });
    },
    [setKeymap, connected],
  );

  useEffect(() => {
    if (!language) changeLanguage();
  }, [changeLanguage, language]);

  useEffect(() => {
    if (!connected || !backendPending) return;

    storeInstallerLanguage(language);
    setBackendPending(false);
  }, [connected, language, backendPending, storeInstallerLanguage]);

  useEffect(() => {
    if (!connected) return;
    fetchConfig().then((c) => setKeymap(c.uiKeymap));
  }, [setKeymap, connected]);

  const value = { language, changeLanguage, keymap, changeKeymap };

  return <L10nContext.Provider value={value}>{children}</L10nContext.Provider>;
}

export { InstallerL10nProvider, useInstallerL10n };

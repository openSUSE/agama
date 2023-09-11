/*
 * Copyright (c) [2023] SUSE LLC
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

import React from "react";

import { Page, Section } from "~/components/core";
import { Icon } from "~/components/layout";
import { Menu, MenuContent, MenuList, MenuItem } from "@patternfly/react-core";
import { _ } from "~/i18n";

/* eslint-disable */
const languages = {
  "ach": "Acholi",
  "af": "Afrikaans",
  "an": "Aragonés",
  "ar": "العربية",
  "ast": "Asturianu",
  "az": "Azərbaycanca",
  "be": "Беларуская",
  "bg": "Български",
  "br": "Brezhoneg",
  "brx": "बड़ो",
  "bs": "Bosanski",
  "ca": "Català",
  "ca-valencia": "Català (Valencià)",
  "cak": "Kaqchikel",
  "cs": "Čeština",
  "cy": "Cymraeg",
  "da": "Dansk",
  "de": "Deutsch",
  "dsb": "Dolnoserbšćina",
  "el": "Ελληνικά",
  "en-CA": "English (CA)",
  "en-GB": "English (GB)",
  "en-US": "English (US)",
  "eo": "Esperanto",
  "es-AR": "Español (AR)",
  "es-CL": "Español (CL)",
  "es-ES": "Español (ES)",
  "es-MX": "Español (MX)",
  "et": "Eesti",
  "eu": "Euskara",
  "fa": "فارسی",
  "ff": "Pulaar",
  "fi": "Suomi",
  "fr": "Français",
  "fur": "Furlan",
  "fy-NL": "Frysk",
  "ga-IE": "Gaeilge",
  "gd": "Gàidhlig",
  "gl": "Galego",
  "gn": "Guarani",
  "he": "עברית",
  "hi-IN": "हिन्दी",
  "hr": "Hrvatski",
  "hsb": "Hornjoserbšćina",
  "hu": "Magyar",
  "hy-AM": "հայերեն",
  "ia": "Interlingua",
  "id": "Indonesia",
  "is": "Islenska",
  "it": "Italiano",
  "ja": "日本語",
  "ja-JP-mac": "日本語",
  "ka": "ქართული",
  "kab": "Taqbaylit",
  "kk": "қазақ тілі",
  "ko": "한국어",
  "lij": "Ligure",
  "lo": "ລາວ",
  "lt": "Lietuvių",
  "ltg": "Latgalīšu",
  "lv": "Latviešu",
  "mk": "македонски",
  "mr": "मराठी",
  "ms": "Melayu",
  "nb-NO": "Norsk Bokmål",
  "ne-NP": "नेपाली",
  "nl": "Nederlands",
  "nn-NO": "Nynorsk",
  "oc": "Occitan",
  "pl": "Polski",
  "pt-BR": "Português (BR)",
  "pt-PT": "Português (PT)",
  "rm": "Rumantsch",
  "ro": "Română",
  "ru": "Русский",
  "sc": "Sardu",
  "sco": "Scots",
  "sk": "Slovenčina",
  "sl": "Slovenščina",
  "son": "Soŋay",
  "sq": "Shqip",
  "sr": "Cрпски",
  "sv-SE": "Svenska",
  "szl": "Ślōnsko",
  "tg": "Тоҷикӣ",
  "th": "ไทย",
  "tl": "Tagalog",
  "tr": "Türkçe",
  "trs": "Triqui",
  "uk": "Українська",
  "ur": "اردو",
  "uz": "O‘zbek",
  "vi": "Tiếng Việt",
  "wo": "Wolof",
  "xh": "IsiXhosa",
  "zh-CN": "简体中文",
  "zh-TW": "正體中文"
}

/**
 * Page to show all issues per section
 * @component
 */
export default function WelcomePage() {
  /* eslint-disable i18next/no-literal-string */
  return (
    <Page
      title="Welcome"
      actionLabel={<Icon name="arrow_forward" size="24" />}
      navigateTo={-1}
    >
      <>
        <Section title={_("Language")} icon="translate">
          <Menu id="language" activeItemId="cs" aria-label="Choose the installer language" isPlain isScrollable>
            <MenuContent>
              <MenuList isActive>
                { Object.keys(languages).map((id) => {
                  return <MenuItem key={id} itemId={id}>{languages[id]}</MenuItem>
                })}
              </MenuList>
            </MenuContent>
          </Menu>
        </Section>
      </>
    </Page>
  );
}

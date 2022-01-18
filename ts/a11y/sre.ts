/*************************************************************
 *
 *  Copyright (c) 2018-2021 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * @fileoverview  Provides the interface functionality to SRE.
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import {MathJax as MJGlobal} from '../components/global.js';

declare namespace window {
  let SREfeature: {[key: string]: any};
}

declare namespace global {
  let SREfeature: {[key: string]: any};
}

// This sets up the correct link to the mathmaps files.
//
// We could also use a custom method for loading locales that are webpacked into
// the distribution.
(() => {
  if (typeof window !== 'undefined') {
    window.SREfeature = {json: MJGlobal.config.loader.source['[sre]'] + '/mathmaps'};
  } else {
    // TODO: This is does not yet work correctly!
    global.SREfeature = {json: MJGlobal.config.loader.paths.mathjax + '/sre/mathmaps'};
  }
})();

export {engineReady as sreReady, setupEngine, engineSetup, toEnriched} from 'speech-rule-engine/js/common/system.js';
export {Walker} from 'speech-rule-engine/js/walker/walker.js';
export * as WalkerFactory from 'speech-rule-engine/js/walker/walker_factory.js';
export {SpeechGenerator} from 'speech-rule-engine/js/speech_generator/speech_generator.js';
export * as SpeechGeneratorFactory from 'speech-rule-engine/js/speech_generator/speech_generator_factory.js';
export * as EngineConst from 'speech-rule-engine/js/common/engine_const.js';
export {ClearspeakPreferences} from 'speech-rule-engine/js/speech_rules/clearspeak_preferences.js';
export {Highlighter} from 'speech-rule-engine/js/highlighter/highlighter.js';
export * as HighlighterFactory from 'speech-rule-engine/js/highlighter/highlighter_factory.js';

import {Variables} from 'speech-rule-engine/js/common/variables.js';

export const Locales = Variables.LOCALES;

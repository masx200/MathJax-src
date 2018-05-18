/*************************************************************
 *
 *  Copyright (c) 2017 The MathJax Consortium
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
 * @fileoverview Singleton class for handling symbol maps.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import {AbstractSymbolMap, SymbolMap} from './SymbolMap.js';
import {ParseInput, ParseResult, ParseMethod} from './Types.js';
import *  as sm from './SymbolMap.js';
import ParseMethods from './ParseMethods.js';
import {Configuration} from './Configuration.js';


export type HandlerType = 'delimiter' | 'macro' | 'character' | 'environment';

export class MapHandler {

  private static instance: MapHandler;

  private maps: Map<string, SymbolMap> = new Map();

  /**
   * @return {MapHandler} The singleton MapHandler object.
   */
  public static getInstance(): MapHandler {
    if (!MapHandler.instance) {
      MapHandler.instance = new MapHandler();
    }
    return MapHandler.instance;
  }


  /**
   * Adds a new symbol map to the map handler. Might overwrite an existing
   * symbol map of the same name.
   *
   * @param {SymbolMap} map Registers a new symbol map.
   */
  public register(map: SymbolMap): void {
    this.maps.set(map.name, map);
  }


  /**
   * Looks up a symbol map if it exists.
   *
   * @param {string} name The name of the symbol map.
   * @return {SymbolMap} The symbol map with the given name or null.
   */
  public getMap(name: string): SymbolMap {
    return this.maps.get(name);
  }


  // Temporary function to allow setting values from legacy code.
  /**
   * @return {SymbolMap[]} All maps in the handler.
   */
  public allMaps(): SymbolMap[] {
    return Array.from(this.maps.values());
  }


  /**
   * Dummy constructor
   * @constructor
   */
  private constructor() { }

}


// Defining empty handlers for declaring new commands, macros, etc.
// TODO: Make sure multiple runs do not interfere!
new sm.MacroMap('new-Character', {}, {});
new sm.DelimiterMap('new-Delimiter', ParseMethods.delimiter, {});
new sm.CommandMap('new-Macro', {}, {});
new sm.EnvironmentMap('new-Environment', ParseMethods.environment, {}, {});
const emptyConf = new Configuration(
  'empty',
  {character: ['new-Character'],
   delimiter: ['new-Delimiter'],
   macro: ['new-Macro'],
   environment: ['new-Environment']
  }, {}, {});


/**
 * Class of symbol mappings that are active in a configuration.
 */
export class SubHandler {

  private _configuration: SymbolMap[] = [];

  /**
   * @constructor
   * @param {Array.<string>} maps Names of the maps included in this
   *     configuration.
   */
  constructor(maps: string[], private _fallback: ParseMethod) {
    for (const name of maps) {
      this.add(name);
    }
  }


  /**
   * Adds a symbol map to the configuration if it exists.
   * @param {string} name of the symbol map.
   */
  public add(name: string): void {
    let map = MapHandler.getInstance().getMap(name);
    if (!map) {
      this.warn('Configuration ' + name + ' not found! Omitted.');
      return;
    }
    this._configuration.push(map);
  }


  /**
   * Parses the given input with the first applicable symbol map.
   * @param {ParseInput} input The input for the parser.
   * @return {ParseResult} The output of the parsing function.
   */
  public parse(input: ParseInput): ParseResult {
    for (let map of this._configuration) {
      const result = map.parse(input);
      if (result) {
        return result;
      }
    }
    let [env, symbol] = input;
    this._fallback(env, symbol);
  }


  /**
   * Maps a symbol to its "parse value" if it exists.
   *
   * @param {string} symbol The symbol to parse.
   * @return {T} A boolean, Character, or Macro.
   */
  public lookup<T>(symbol: string): T {
    let map = this.applicable(symbol) as AbstractSymbolMap<T>;
    return map ? map.lookup(symbol) : null;
  }


  /**
   * Checks if a symbol is contained in one of the symbol mappings of this
   * configuration.
   *
   * @param {string} symbol The symbol to parse.
   * @return {boolean} True if the symbol is contained in the mapping.
   */
  public contains(symbol: string): boolean {
    return this.applicable(symbol) ? true : false;
  }


  /**
   * @override
   */
  public toString(): string {
    return this._configuration
      .map(function(x: SymbolMap) {return x.name; })
      .join(', ');
  }


  /**
   * Retrieves the first applicable symbol map in the configuration.
   * @param {string} symbol The symbol to parse.
   * @return {SymbolMap} A map that can parse the symbol.
   */
  private applicable(symbol: string): SymbolMap {
    for (let map of this._configuration) {
      if (map.contains(symbol)) {
        return map;
      }
    }
    return null;
  }


  /**
   * Prints a warning message.
   * @param {string} message The warning.
   */
  private warn(message: string) {
    console.log('TexParser Warning: ' + message);
  }

}


// TODO: This should be an extension of Map, but that only works in ES6 proper!
export class SubHandlers {

  private map = new Map<HandlerType, SubHandler>();
  
  /**
   * Sets a new configuration for the map handler.
   * @param {Configuration} configuration A setting for the map handler.
   */
  constructor(config: Configuration) {
    config.append(emptyConf);
    for (const key of Object.keys(config.handler)) {
      let name = key as HandlerType;
      let subHandler = new SubHandler(config.handler[name] || [],
                                      config.fallback[name]); // A dummy?
      this.set(name, subHandler);
    }
  }

  public set(name: HandlerType, subHandler: SubHandler) {
    this.map.set(name, subHandler);
  }

  public get(name: HandlerType): SubHandler {
    return this.map.get(name);
  }

  public keys(): IterableIterator<string> {
    return this.map.keys();
  }

}
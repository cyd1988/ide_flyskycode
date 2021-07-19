/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Object.defineProperty(exports, "__esModule", { value: true });
import fs = require('fs');
import { Util } from '../Util';

import { MessageService } from './../lib/webSocket';


/*

 * Config class handles getting values from config.json.
 */
export class Config {
    version: number;
    static _configJsonContent: any = undefined;

    static _config_json_sublime_list: any = undefined;

    constructor() {
        this.version = 2;
        Config.configJsonContent();
    }


    static configJsonSublime_list(file: string) {

        if (this._config_json_sublime_list === undefined) {
            this._config_json_sublime_list = [];
        }
        let hashCode = function (strings: string) {
            var hash = 0, i, chr;
            if (strings.length === 0) return hash;
            for (i = 0; i < strings.length; i++) {
                chr = strings.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        };

        let keys = hashCode(file);

        if (!this._config_json_sublime_list[keys]) {
            this._config_json_sublime_list[keys] = this.loadConfig(file);
        }
        return this._config_json_sublime_list[keys];
    }

    static configJsonContent(file: string = "") {
        if (file === "") {
            file = Util.DIR() + '/src/config.json';
        }
        if (this._configJsonContent === undefined) {
            this._configJsonContent = this.loadConfig(file);
        }
        return this._configJsonContent;
    }

    static sGet(key: string, def?: any) {
        if (
            Object.keys(MessageService.SystemKeysList).length > 0 &&
            MessageService.SystemKeysList[key]
        ) {
            return MessageService.SystemKeysList[key];
        } else {
            return def;
        }

    }




    getServiceVersion() {
        return this.version;
    }
    getSqlToolsConfigValue(configKey: string) {
        let json = Config.configJsonContent;
        return json;
    }

    getWorkspaceConfig(key: string | number, defaultValue: any) {
        let json: any = Config.configJsonContent;
        let configValue = json[key];
        if (!configValue) {
            configValue = defaultValue;
        }
        return configValue;
    }
    static loadConfig(files: string) {
        let configContent = fs.readFileSync(files + '', "utf-8");
        return JSON.parse(configContent);
    }






}



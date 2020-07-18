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

    constructor() {
        this.version = 2;
        Config.configJsonContent();
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



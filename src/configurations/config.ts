/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Object.defineProperty(exports, "__esModule", { value: true });
import fs = require('fs');
import path = require("path");
// import Constants = require("constants");


import {Util}  from '../Util';

import * as vscode from 'vscode';


/*

 * Config class handles getting values from config.json.
 */
export class Config {
    version:number;
    static _configJsonContent: any = undefined;

    constructor() {
        this.version = 2;
        Config.configJsonContent();
    }
    static configJsonContent() {
        if (this._configJsonContent === undefined) {
            this._configJsonContent = this.loadConfig();
        }
        return this._configJsonContent;
    }

    getServiceVersion() {
        return this.version;
    }
    getSqlToolsConfigValue(configKey:string) {
        let json = Config.configJsonContent;
        return json;
    }

    getWorkspaceConfig(key: string | number, defaultValue: any) {
        let json:any = Config.configJsonContent;
        let configValue = json[key];
        if (!configValue) {
            configValue = defaultValue;
        }
        return configValue;
    }
    static loadConfig() {
        let files = Util.DIR()+'/src/config.json';
        let configContent = fs.readFileSync(files+'', "utf-8");
        return JSON.parse(configContent);
    }
}



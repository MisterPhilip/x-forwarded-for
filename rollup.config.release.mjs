import typescript from "@rollup/plugin-typescript";
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import ZipPack from 'unplugin-zip-pack/rollup'

import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import copy from "rollup-plugin-copy";
import { readFileSync } from "fs";
import del from "rollup-plugin-delete";

const packageFile = readFileSync("./package.json");
const packageJson = JSON.parse(packageFile.toString());

const platforms = ["chromium", "firefox"];

const extensionEnv = `"production"`;
const extensionName = "X-Forwarded-For Header";

const configs = [];

platforms.forEach((platformName) => {
    const dest = `releases/${platformName}`;
    configs.push(
        {
            input: './src/*.html',
            plugins: [
                del({
                    targets: [
                        `${dest}/*`,
                        `releases/${platformName}-${packageJson.version}.zip`
                    ]
                }),
                replace({
                    values: {
                        '__buildVersion__': packageJson.version,
                        'process.env.NODE_ENV': extensionEnv,
                    },
                    preventAssignment: true,
                }),
                typescript({
                    compilerOptions: {
                        outDir: dest,
                    }
                }),
                url(),
                html(),
                resolve({ browser: true }),
            ],
            output: {
                dir: dest,
            },
            preserveEntrySignatures: 'strict',
        },
        {
            input: "./src/serviceWorker.ts",
            plugins: [
                replace({
                    values: {
                        '__buildVersion__': packageJson.version,
                        '__buildName__': extensionName,
                        'process.env.NODE_ENV': extensionEnv,
                    },
                    preventAssignment: true,
                }),
                typescript({
                    compilerOptions: {
                        outDir: dest,
                    }
                }),
                resolve({ browser: true }),
                copy({
                    targets: [
                        {
                            src: `./src/platforms/${platformName}/manifest.json`,
                            dest,
                            transform: (contents) => {
                                return contents.toString()
                                    .replace(/__buildVersion__/g, packageJson.version)
                                    .replace(/__buildName__/g, extensionName)
                            }
                        },
                        {
                            src: `./src/assets/*`,
                            dest: `${dest}/assets`,
                        },
                        {
                            src: `./src/_locales/*`,
                            dest: `${dest}/_locales`,
                        }
                    ]
                }),
                ZipPack({
                    in: dest,
                    out: `releases/${platformName}-${packageJson.version}.zip`,
                }),
            ],
            output: {
                dir: dest,
                inlineDynamicImports: true,
            },
            preserveEntrySignatures: 'strict',
        }
    );
});
export default configs;

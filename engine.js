import * as fs from 'node:fs/promises'
import {join} from 'node:path'
import {existsSync} from 'node:fs'

/*
    Views
 */

let views = {}

export function view(name, vars) {
    return views[name](vars)
}

export function registerView(name, func) {
    views[name] = func
}

export function removeView(name) {
    delete views[name]
}

export function clearViews() {
    views = {}
}

export function getViews() {
    return Object.assign({}, views)
}

export async function registerViewDir(dirPath, recursive = true, ext = '.html') {
    if (!existsSync(dirPath)) return;

    for (const file of await fs.readdir(dirPath, {recursive})) {
        if (!file.endsWith(ext)) continue;

        const content = await fs.readFile(join(dirPath, file), 'utf8')
        let viewName = file.replace(ext, '').replace(/([\/\\])/g, '.')
        if (viewName.startsWith('.')) {
            viewName = viewName.substring(1)
        }
        views[viewName] = create(content, ['data'])
    }
}

/*
    Includes
 */

let includes = {}

function include(name, vars) {
    return includes[name](vars)
}

export function registerInclude(name, func) {
    includes[name] = func
}

export function removeInclude(name) {
    delete includes[name]
}

export function clearIncludes() {
    includes = {}
}

export function getIncludes() {
    return Object.assign({}, includes)
}

export async function registerIncludeDir(dirPath, recursive = true, ext = '.html') {
    if (!existsSync(dirPath)) return;

    for (const file of await fs.readdir(dirPath, {recursive})) {
        if (!file.endsWith(ext)) continue;

        const content = await fs.readFile(join(dirPath, file), 'utf8')
        let includeName = file.replace(ext, '').replace(/([\/\\])/g, '.')
        if (includeName.startsWith('.')) {
            includeName = includeName.substring(1)
        }
        includes[includeName] = create(content, ['data'])
    }
}

/*
    Helpers
 */

let helpers = {}

export function registerHelper(name, func) {
    helpers[name] = func
}

export function removeHelper(name) {
    delete helpers[name]
}

export function clearHelpers() {
    helpers = {}
}

export function getHelpers() {
    return Object.assign({}, helpers)
}

/*
    Templates
 */

export function create(template, varNames = ['data']) {
    const fn = new Function('helpers', 'include', ...varNames, `return \`${template}\``)
    return (...args) => fn(helpers, include, ...args)
}

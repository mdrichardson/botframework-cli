/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {CLIError, Command, flags} from '@microsoft/bf-cli-command'
import {camelCase, kebabCase, upperFirst} from 'lodash'
import * as path from 'path'
const fs = require('fs-extra')
const exception = require('./../../../../node_modules/@microsoft/bf-lu/lib/parser/utils/exception')
const file = require('./../../../../node_modules/@microsoft/bf-lu/lib/utils/filehelper')
const LuisToTsConverter = require('./../../../../node_modules/@microsoft/bf-lu/lib/parser/converters/luistotsconverter')

export default class LuisGenerateTs extends Command {
  static description = 'Generate:ts generates a strongly typed typescript source code from an exported (json) LUIS model.'

  static flags: flags.Input<any> = {
    in: flags.string({char: 'i', description: 'Path to the file containing the LUIS application JSON model'}),
    out: flags.string({char: 'o', description: 'Output file or folder name. If not specified stdout will be used as output', default: ''}),
    className: flags.string({description: 'Name of the autogenerated class'}),
    force: flags.boolean({char: 'f', description: 'If --out flag is provided with the path to an existing file, overwrites that file', default: false}),
    help: flags.help({char: 'h', description: 'luis:generate:ts help'}),
  }

  reorderEntities(app: any, name: string): void {
    if (app[name] !== null && app[name] !== undefined) {
      app[name].sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    }
  }

  async run() {
    try {
      const {flags} = this.parse(LuisGenerateTs)
      const stdInput = await this.readStdin()

      if (!flags.in && !stdInput) {
        throw new CLIError('Missing input. Please use stdin or pass a file location with --in flag')
      }

      const pathPrefix = flags.in && path.isAbsolute(flags.in) ? '' : process.cwd()
      let app: any
      try {
        app = stdInput ? JSON.parse(stdInput as string) : await fs.readJSON(path.join(pathPrefix, flags.in))
      } catch (error) {
        throw new CLIError(error)
      }

      flags.className = flags.className || app.name
      flags.className = upperFirst(camelCase(flags.className))

      this.reorderEntities(app, 'entities')
      this.reorderEntities(app, 'prebuiltEntities')
      this.reorderEntities(app, 'closedLists')
      this.reorderEntities(app, 'regex_entities')
      this.reorderEntities(app, 'patternAnyEntities')
      this.reorderEntities(app, 'composites')

      const outputPath = flags.out ? file.validatePath(flags.out, kebabCase(flags.className) + '.ts', flags.force) : flags.out

      this.log(
        `Generating file at ${outputPath || 'stdout'} that contains class ${flags.className}.`
      )

      await LuisToTsConverter.writeFromLuisJson(app, flags.className, outputPath)
    } catch (error) {
      if (error instanceof exception) {
        throw new CLIError(error.text)
      }
      throw error
    }
  }
}

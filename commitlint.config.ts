import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w+)\](?:\s+\w+-\d+\s+-\s+|\s+- |\s+)(.*)/,
      headerCorrespondence: ['type', 'subject']
    }
  },
  rules: {
    'type-enum': [
      2,
      'always',
      ['TASK', 'FEATURE', 'BUGFIX', 'OBSIDIAN', 'CLAUDE']
    ],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 120]
  }
}

export default config

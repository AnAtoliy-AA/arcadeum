module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'footer-max-line-length': [0, 'always'],
    'header-max-length': [0, 'always'],
  },
  ignores: [(commit) => commit === ''],
  helps: {
    footer: 'Use (ARC-XXX) for Jira/issue tracking',
  },
};

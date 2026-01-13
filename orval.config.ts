import { defineConfig } from 'orval'

export default defineConfig({
  auth: {
    input: {
      target: '../auth/api/docs/swagger.yaml',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/auth',
      schemas: 'src/api/auth/model',
      client: 'vue-query',
      baseUrl: '/api/v1/auth',
      mock: true,
      override: {
        mutator: {
          path: 'src/api/auth-mutator.ts',
          name: 'authMutator',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },

  nakup: {
    input: {
      target: '../nakup/api/docs/swagger.yaml',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/nakup',
      schemas: 'src/api/nakup/model',
      client: 'vue-query',
      baseUrl: '/api/v1/nakup',
      mock: true,
      override: {
        mutator: {
          path: 'src/api/nakup-mutator.ts',
          name: 'nakupMutator',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },

  spored: {
    input: {
      target: '../spored/api/docs/swagger.yaml',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/spored',
      schemas: 'src/api/spored/model',
      client: 'vue-query',
      baseUrl: '/api/v1/spored',
      mock: true,
      override: {
        mutator: {
          path: 'src/api/spored-mutator.ts',
          name: 'sporedMutator',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },

  reklame: {
    input: {
      target: '../reklame/api/docs/swagger.yaml',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/reklame',
      schemas: 'src/api/reklame/model',
      client: 'vue-query',
      baseUrl: '/api/v1/reklame',
      mock: true,
      override: {
        mutator: {
          path: 'src/api/reklame-mutator.ts',
          name: 'reklameMutator',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
})

import { defineConfig } from 'orval'

export default defineConfig({
  nakup: {
    output: {
      mode: 'tags-split',
      target: 'src/api/nakup',
      schemas: 'src/api/nakup/model',
      client: 'vue-query',
      mock: true,
    },
    input: {
      target: '../nakup/api/docs/swagger.yaml',
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
})

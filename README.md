## Overview

This Github action allows you to use [Orquesta](https://orquesta.dev/) rules in your workflows. With this action, you can configure your applications using the remote configurations from Orquesta, enable or disable features or jobs using feature flags, or customize your applications based on different parameters.

### Demo

The follow example will use the `api-rate-limit` Orquesta rule of type `number` created in a demo workspaces.

<img height="260" alt="image" src="https://user-images.githubusercontent.com/73107451/210444354-64b58da5-5d90-4e93-b87c-e5a214f46000.png">

#### Usage

To use this action, create a new workflow in your GitHub repository's `.github/workflows directory` (e.g. `orquesta-action.yml`). Then, copy and paste the following code:

```yaml
on:
  push:
    branches: [main]

jobs:
  orquesta:
    runs-on: ubuntu-latest
    name: Evaluate your Orquesta rule
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: orquestadev/orquesta-action@1.0
        id: api_rate_limit
        with:
          apiKey: ${{secrets.ORQUESTA_API_KEY}}
          ruleKey: api-rate-limit
          context: '{"environments": "production", "customer-tier": "freemium"}'

      - name: Use your rule result
        run: |
          echo "The result of the rule evaluation is ${{ steps.api_rate_limit.outputs.result }}"

# The result of this operation will be 150, as this is the first row in the table that meets the specified criteria (as shown in the above image). The row 2 is identified as the first row that matches the context provided in the action.
```

You can find your Orquesta API Key in the settings for your Orquesta workspace. We recommend using [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to store your API Key securely.

### Inputs

| input     | required | description                                                                    |
| --------- | -------- | ------------------------------------------------------------------------------ |
| `apiKey`  | yes      | Your workspace API key                                                         |
| `ruleKey` | yes      | Your workspace rule key                                                        |
| `context` | no       | Context to be used in the evaluation of the rule. Must be a valid JSON string. |

### Examples

Here are some additional examples of how you can use this action:

#### Using a rule of type boolean to disable a job

```yaml
on:
  push:
    branches: [main]

jobs:
  orquesta:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: orquestadev/orquesta-action@1.0
        id: code_freeze_enabled
        with:
          apiKey: ${{secrets.ORQUESTA_API_KEY}}
          ruleKey: code_freeze_enabled
          context: '{"environments": "production"}'

      - name: Backend deployment
        if: steps.code_freeze_enabled.outputs.result == 'false'
        ...
```

#### Using a rule of type json to configure your Github actifacts upload

```yaml
on:
  push:
    branches: [main]

jobs:
  orquesta:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: orquestadev/orquesta-action@1.0
        id: artifacts_config
        with:
          apiKey: ${{secrets.ORQUESTA_API_KEY}}
          ruleKey: artifacts_config
          context: '{"accountId": "account007", "cloudProvider": "aws"}'

      - uses: actions/upload-artifact@v3
        with:
          name: ${{fromJSON(steps.artifacts_config.outputs.result)['name']}}
          path: ${{fromJSON(steps.artifacts_config.outputs.result)['path']}}
```

### About Orquesta

[Orquesta](https://orquesta.dev/) provides you, as a developer, with a fast and intuitive platform to manage and run all your feature flags, configurations and complex business rules for rapid application development, stress-free operations and smooth orchestration of complex IT landscapes.

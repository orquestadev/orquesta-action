import * as core from '@actions/core'
import axios from 'axios'

const orquestaApiKey = core.getInput('apiKey')
const orquestaRuleKey = core.getInput('ruleKey')
const orquestaContext = core.getInput('context')

const EVALUATION_API_URL = 'https://api.orquesta.dev/evaluate'

async function run(): Promise<void> {
  core.debug('Checking required inputs...')

  const requiredInputs = ['apiKey', 'ruleKey']

  for (const inputKey of requiredInputs) {
    if (!core.getInput(inputKey)) {
      core.setFailed(`Missing required input: ${inputKey}`)
      return
    }
  }

  core.debug('All required inputs are present')

  let context = {}

  core.debug('Checking if context was provided')

  if (orquestaContext) {
    try {
      core.debug('Parsing context')
      context = JSON.parse(orquestaContext)
    } catch (error) {
      core.setFailed(error as Error)
      return
    }
  }

  try {
    core.debug('Sending request to Orquesta Evaluation API...')

    const response = await axios.post(
      EVALUATION_API_URL,
      {
        rule_key: orquestaRuleKey,
        context
      },
      {
        headers: {
          Authorization: `Bearer ${orquestaApiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-SDK-Version': '@orquestadev/orquesta-action@v1'
        }
      }
    )

    const data = await response.data

    const result = data[orquestaRuleKey]

    core.debug('Rule evaluation result: ${result}')

    core.setOutput('result', result)
  } catch (error: any) {
    const detail = error.response?.data?.detail

    if (detail === 'missing_authorization_header') {
      core.setFailed(
        `Missing API Key. Please provide a valid Orquesta API Key.`
      )
    }

    if (detail === 'invalid_api_key') {
      core.setFailed(
        `Failed to authenticate with the Orquesta Evaluation API. Check your API Key.`
      )
    }

    if (detail === 'invalid_request') {
      core.setFailed(`Invalid request. Please check your inputs and try again.`)
    }

    if (['workspace_not_found', 'empty_evaluation'].includes(detail)) {
      core.setFailed(`The provided rule key does not exists.`)
    }

    if (error instanceof Error) core.setFailed(error)
  }
}

run()

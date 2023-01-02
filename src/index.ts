import * as core from '@actions/core'
import axios from 'axios'

const orquestaApiKey = core.getInput('apiKey')
const orquestaRuleKey = core.getInput('ruleKey')
const orquestaJsonContext = core.getInput('jsonContext')
const orquestaMultilineContext = core.getMultilineInput('multilineContext')

const EVALUATION_API_URL = 'https://api.orquesta.dev/evaluate'

async function run(): Promise<void> {
  const requiredInputs = ['apiKey', 'ruleKey']

  for (const inputKey of requiredInputs) {
    if (!core.getInput(inputKey)) {
      core.setFailed(`Missing required input: ${inputKey}`)
      return
    }
  }

  let context = {}

  if (orquestaJsonContext) {
    try {
      context = JSON.parse(orquestaJsonContext)
    } catch (error) {
      core.setFailed(`Invalid JSON provided for contextAsJson`)
      return
    }
  }

  if (!orquestaJsonContext && orquestaMultilineContext) {
    context = orquestaMultilineContext.reduce((acc, line) => {
      const [key, value] = line.split(':')

      return {
        ...acc,
        [key]: value
      }
    }, {})
  }

  try {
    const response = await axios.post(
      EVALUATION_API_URL,
      {
        rule_key: orquestaRuleKey,
        context
      },
      {
        headers: {
          Authorization: `Bearer ${orquestaApiKey}`
        }
      }
    )

    const result = await response.data[orquestaApiKey]

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

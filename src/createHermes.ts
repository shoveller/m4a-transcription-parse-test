import memoize from 'lodash-es/memoize';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const createHermes = memoize((env: Env) => {
	const hermes = createOpenAICompatible({
		name: 'hermes',
		baseURL: 'https://hermes.illuwa.click/v1',
		apiKey: env.HERMES_KEY
	})

	return hermes('coding')
})

export default createHermes

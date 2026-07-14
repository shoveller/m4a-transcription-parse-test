import memoize from 'lodash-es/memoize'
import { createWorkersAI } from "workers-ai-provider";

const createCfModel = memoize((env: Env) => {
	const workersAi = createWorkersAI({ binding: env.AI });

	return workersAi('@cf/google/gemma-4-26b-a4b-it')
})

export default createCfModel

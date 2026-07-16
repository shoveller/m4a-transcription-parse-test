import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { generateText } from 'ai';
import createCfModel from './createCfModel';

export type QueryWorkflowPayload = { message: string }

export class QueryWorkflow extends WorkflowEntrypoint<Env, QueryWorkflowPayload> {
	async run(event: Readonly<WorkflowEvent<QueryWorkflowPayload>>, step: WorkflowStep) {
		// await step.sleep('테스트 슬립', 10000)

		return step.do('query llm', async () => {
			const model = createCfModel(this.env)
			const { text } = await generateText({
				model,
				prompt: event.payload.message
			})

			return text
		})
	}
}

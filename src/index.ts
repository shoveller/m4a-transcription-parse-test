/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { QueryWorkflowPayload } from './QueryWorkflow';
import createHermes from './createHermes';
import { generateText } from 'ai';
export type { QueryWorkflowPayload }
export { QueryWorkflow } from './QueryWorkflow'

type WorkflowMetadata = {
	instanceId: string
	status: string
	createdAt: string
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url)

		if (request.method === 'POST' && url.pathname === '/api/event/audio/nextcloud') {
			const body = await request.json<QueryWorkflowPayload>()
			console.log('body', body)
			await env.SERVICE_QUEUE.send(body)
			return new Response('ok')
		}

		if (request.method === 'GET' && url.pathname === '/api/event/audio/nextcloud/status') {
			const instanceId = url.searchParams.get('id')
			if (!instanceId) {
				return Response.json({ error: 'Missing id parameter' }, { status: 400 })
			}

			const metadata = await env.WORKFLOW_RESULT.get(`workflow:${instanceId}`, 'json') as WorkflowMetadata | null
			if (!metadata) {
				return Response.json({ error: 'Workflow not found' }, { status: 404 })
			}

			const instance = await env.QUERY_WORKFLOW.get(instanceId)
			const status = await instance.status()

			return Response.json({
				instanceId,
				status: status.status,
				output: status.output,
				error: status.error,
				createdAt: metadata.createdAt,
			})
		}

		// const model = createHermes(env)
		// const { text } = await generateText({
		// 	model,
		// 	prompt: '너는 누구니'
		// })
		//
		// return new Response(text)

		return Response.json({ result: 'ok' })
	},
	async queue(batch, env, ctx) {
		await Promise.all(batch.messages.map(async (message) => {
			const instanceId = crypto.randomUUID()

			await env.QUERY_WORKFLOW.create({
				id: instanceId,
				params: message.body,
			})

			const metadata: WorkflowMetadata = {
				instanceId,
				status: 'created',
				createdAt: new Date().toISOString(),
			}

			await env.WORKFLOW_RESULT.put(
				`workflow:${instanceId}`,
				JSON.stringify(metadata)
			)
		}))
	}
} satisfies ExportedHandler<Env, QueryWorkflowPayload>;

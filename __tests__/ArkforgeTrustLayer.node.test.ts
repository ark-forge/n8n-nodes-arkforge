import { ArkforgeTrustLayer } from '../nodes/ArkforgeTrustLayer/ArkforgeTrustLayer.node';

// Mock n8n execution context
function createMockExecuteFunctions(params: Record<string, unknown>, credentials: Record<string, unknown>) {
	const nodeParams = { ...params };
	let httpRequestArgs: Record<string, unknown> | null = null;

	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string, _index: number, fallback?: unknown) => {
			if (name in nodeParams) return nodeParams[name];
			return fallback;
		},
		getCredentials: async () => credentials,
		getNode: () => ({ name: 'ArkForge Trust Layer' }),
		continueOnFail: () => false,
		helpers: {
			httpRequest: async (opts: Record<string, unknown>) => {
				httpRequestArgs = opts;
				return { proof: { proof_id: 'prf_test_123' }, service_response: { status_code: 200, body: {} } };
			},
		},
		getLastHttpRequestArgs: () => httpRequestArgs,
	};
}

describe('ArkforgeTrustLayer Node', () => {
	let node: ArkforgeTrustLayer;

	beforeEach(() => {
		node = new ArkforgeTrustLayer();
	});

	describe('description', () => {
		it('has correct metadata', () => {
			expect(node.description.name).toBe('arkforgeTrustLayer');
			expect(node.description.displayName).toBe('ArkForge Trust Layer');
			expect(node.description.version).toBe(1);
		});

		it('requires arkforgeApi credentials', () => {
			expect(node.description.credentials).toEqual([
				{ name: 'arkforgeApi', required: true },
			]);
		});

		it('has certify and verify operations', () => {
			const opProp = node.description.properties.find(p => p.name === 'operation');
			expect(opProp).toBeDefined();
			const options = (opProp as any).options;
			expect(options).toHaveLength(2);
			expect(options[0].value).toBe('certify');
			expect(options[1].value).toBe('verify');
		});
	});

	describe('execute — certify', () => {
		it('calls POST /v1/proxy with correct payload', async () => {
			const creds = { apiKey: 'mcp_free_test123', baseUrl: 'https://trust.arkforge.tech' };
			const params: Record<string, unknown> = {
				operation: 'certify',
				target: 'https://api.anthropic.com/v1/messages',
				method: 'POST',
				payload: '{"model":"claude-sonnet-4-20250514","messages":[]}',
				description: 'test call',
				agentIdentity: 'n8n-test',
				agentVersion: '0.1.0',
				extraHeaders: { header: [{ name: 'Authorization', value: 'Bearer sk-test' }] },
			};

			const ctx = createMockExecuteFunctions(params, creds);
			const result = await node.execute.call(ctx as any);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toHaveProperty('proof');

			const args = ctx.getLastHttpRequestArgs()!;
			expect(args.method).toBe('POST');
			expect(args.url).toBe('https://trust.arkforge.tech/v1/proxy');
			expect(args.headers).toMatchObject({
				'Content-Type': 'application/json',
				'X-Api-Key': 'mcp_free_test123',
				'X-Agent-Identity': 'n8n-test',
				'X-Agent-Version': '0.1.0',
			});
			expect((args.body as any).target).toBe('https://api.anthropic.com/v1/messages');
			expect((args.body as any).extra_headers).toEqual({ Authorization: 'Bearer sk-test' });
		});

		it('uses default baseUrl when none provided', async () => {
			const creds = { apiKey: 'mcp_free_x', baseUrl: '' };
			const params: Record<string, unknown> = {
				operation: 'certify',
				target: 'https://example.com/api',
				method: 'POST',
				payload: '{}',
				description: '',
				agentIdentity: '',
				agentVersion: '',
				extraHeaders: {},
			};

			const ctx = createMockExecuteFunctions(params, creds);
			await node.execute.call(ctx as any);

			const args = ctx.getLastHttpRequestArgs()!;
			expect(args.url).toBe('https://trust.arkforge.tech/v1/proxy');
		});

		it('throws on invalid JSON payload', async () => {
			const creds = { apiKey: 'mcp_free_x', baseUrl: 'https://trust.arkforge.tech' };
			const params: Record<string, unknown> = {
				operation: 'certify',
				target: 'https://example.com/api',
				method: 'POST',
				payload: 'not-json',
				description: '',
				agentIdentity: '',
				agentVersion: '',
				extraHeaders: {},
			};

			const ctx = createMockExecuteFunctions(params, creds);
			await expect(node.execute.call(ctx as any)).rejects.toThrow('Invalid JSON');
		});
	});

	describe('execute — verify', () => {
		it('calls GET /v1/proof/:id', async () => {
			const creds = { apiKey: 'mcp_free_test123', baseUrl: 'https://trust.arkforge.tech' };
			const params: Record<string, unknown> = {
				operation: 'verify',
				proofId: 'prf_20260312_155129_11b6cb',
			};

			const ctx = createMockExecuteFunctions(params, creds);

			// Override httpRequest for verify response
			(ctx.helpers as any).httpRequest = async (opts: Record<string, unknown>) => {
				(ctx as any)._httpArgs = opts;
				return { proof_id: 'prf_20260312_155129_11b6cb', valid: true };
			};
			(ctx as any).getLastHttpRequestArgs = () => (ctx as any)._httpArgs;

			const result = await node.execute.call(ctx as any);

			expect(result[0][0].json).toHaveProperty('valid', true);
			const args = (ctx as any).getLastHttpRequestArgs();
			expect(args.method).toBe('GET');
			expect(args.url).toBe('https://trust.arkforge.tech/v1/proof/prf_20260312_155129_11b6cb');
			expect(args.headers).toMatchObject({ 'X-Api-Key': 'mcp_free_test123' });
		});
	});
});

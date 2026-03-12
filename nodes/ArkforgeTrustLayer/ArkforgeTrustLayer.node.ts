import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

export class ArkforgeTrustLayer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ArkForge Trust Layer',
		name: 'arkforgeTrustLayer',
		icon: 'file:arkforge.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Certify any AI API call with cryptographic proof of execution — works across any model, any provider, any infrastructure',
		defaults: {
			name: 'ArkForge Trust Layer',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'arkforgeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Certify API Call',
						value: 'certify',
						description: 'Proxy an API call through the Trust Layer and get a cryptographic proof',
						action: 'Certify an API call',
					},
					{
						name: 'Verify Proof',
						value: 'verify',
						description: 'Verify an existing proof by its ID',
						action: 'Verify a proof',
					},
				],
				default: 'certify',
			},

			// === Certify operation fields ===
			{
				displayName: 'Target URL',
				name: 'target',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				placeholder: 'https://api.anthropic.com/v1/messages',
				description: 'The upstream API URL to call through the Trust Layer',
			},
			{
				displayName: 'HTTP Method',
				name: 'method',
				type: 'options',
				options: [
					{ name: 'POST', value: 'POST' },
					{ name: 'GET', value: 'GET' },
				],
				default: 'POST',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				description: 'HTTP method for the upstream API call',
			},
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				placeholder: '{"model": "claude-sonnet-4-20250514", "messages": [{"role": "user", "content": "Hello"}]}',
				description: 'JSON payload to send to the upstream API',
			},
			{
				displayName: 'Extra Headers',
				name: 'extraHeaders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				description: 'Additional headers to forward to the upstream API (e.g. Authorization for the target API)',
				options: [
					{
						name: 'header',
						displayName: 'Header',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'Authorization',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: 'Bearer sk-...',
							},
						],
					},
				],
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				description: 'Optional description attached to the proof metadata',
			},
			{
				displayName: 'Agent Identity',
				name: 'agentIdentity',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				description: 'Optional agent identity string recorded in the proof',
			},
			{
				displayName: 'Agent Version',
				name: 'agentVersion',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				description: 'Optional agent version string recorded in the proof',
			},

			// === Verify operation fields ===
			{
				displayName: 'Proof ID',
				name: 'proofId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['verify'],
					},
				},
				placeholder: 'prf_20260312_155129_11b6cb',
				description: 'The proof ID to verify',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('arkforgeApi');
		const baseUrl = (credentials.baseUrl as string) || 'https://trust.arkforge.tech';
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'certify') {
					const target = this.getNodeParameter('target', i) as string;
					const method = this.getNodeParameter('method', i) as string;
					const payloadRaw = this.getNodeParameter('payload', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const agentIdentity = this.getNodeParameter('agentIdentity', i, '') as string;
					const agentVersion = this.getNodeParameter('agentVersion', i, '') as string;
					const extraHeadersData = this.getNodeParameter('extraHeaders', i, {}) as {
						header?: Array<{ name: string; value: string }>;
					};

					let payload: object;
					try {
						payload = typeof payloadRaw === 'string' ? JSON.parse(payloadRaw) : payloadRaw;
					} catch {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON in Payload field', { itemIndex: i });
					}

					const body: Record<string, unknown> = {
						target,
						method,
						payload,
					};

					if (description) body.description = description;

					const extraHeaders: Record<string, string> = {};
					if (extraHeadersData.header) {
						for (const h of extraHeadersData.header) {
							if (h.name) extraHeaders[h.name] = h.value;
						}
					}
					if (Object.keys(extraHeaders).length > 0) {
						body.extra_headers = extraHeaders;
					}

					const headers: Record<string, string> = {
						'Content-Type': 'application/json',
						'X-Api-Key': apiKey,
					};
					if (agentIdentity) headers['X-Agent-Identity'] = agentIdentity;
					if (agentVersion) headers['X-Agent-Version'] = agentVersion;

					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/v1/proxy`,
						headers,
						body,
						json: true,
						returnFullResponse: false,
					});

					returnData.push({
						json: response as IDataObject,
						pairedItem: { item: i },
					});

				} else if (operation === 'verify') {
					const proofId = this.getNodeParameter('proofId', i) as string;

					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/v1/proof/${proofId}`,
						headers: {
							'X-Api-Key': apiKey,
						},
						json: true,
						returnFullResponse: false,
					});

					returnData.push({
						json: response as IDataObject,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

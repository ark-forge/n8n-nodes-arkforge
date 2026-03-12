import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ArkforgeApi implements ICredentialType {
	name = 'arkforgeApi';
	displayName = 'ArkForge Trust Layer API';
	documentationUrl = 'https://arkforge.tech/trust';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your ArkForge Trust Layer API key (starts with mcp_free_, mcp_pro_, or mcp_enterprise_)',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://trust.arkforge.tech',
			description: 'Trust Layer API base URL (change only for self-hosted instances)',
		},
	];
}

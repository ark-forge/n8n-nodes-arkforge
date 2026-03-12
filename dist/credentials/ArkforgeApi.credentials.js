"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArkforgeApi = void 0;
class ArkforgeApi {
    constructor() {
        this.name = 'arkforgeApi';
        this.displayName = 'ArkForge Trust Layer API';
        this.documentationUrl = 'https://arkforge.tech/trust';
        this.properties = [
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
}
exports.ArkforgeApi = ArkforgeApi;
//# sourceMappingURL=ArkforgeApi.credentials.js.map
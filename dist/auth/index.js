import fs from "fs/promises";
import path from "path";
import { AuthConfigSchema } from "../schemas/index.js";
import { AUTH_FILE } from "../config/index.js";
class AuthManager {
    authDir;
    constructor() {
        this.authDir = path.dirname(AUTH_FILE);
    }
    async ensureAuthDir() {
        await fs.mkdir(this.authDir, { recursive: true });
    }
    async loadConfig() {
        try {
            const data = await fs.readFile(AUTH_FILE, "utf-8");
            const parsed = JSON.parse(data);
            return AuthConfigSchema.parse(parsed);
        }
        catch {
            return {};
        }
    }
    async saveConfig(config) {
        await this.ensureAuthDir();
        await fs.writeFile(AUTH_FILE, JSON.stringify(config, null, 2), "utf-8");
    }
    async saveKey(provider, apiKey) {
        const config = await this.loadConfig();
        config[provider] = { apiKey };
        await this.saveConfig(config);
    }
    async removeKey(provider) {
        const config = await this.loadConfig();
        delete config[provider];
        await this.saveConfig(config);
    }
    async getKey(provider) {
        const config = await this.loadConfig();
        return config[provider]?.apiKey ?? null;
    }
    async validateKey(provider, apiKey) {
        try {
            if (provider === "openai") {
                const { default: OpenAI } = await import("openai");
                const client = new OpenAI({ apiKey });
                await client.models.list();
                return true;
            }
            else if (provider === "anthropic") {
                const { default: Anthropic } = await import("@anthropic-ai/sdk");
                const client = new Anthropic({ apiKey });
                await client.messages.create({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1,
                    messages: [{ role: "user", content: "ping" }],
                });
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
    async isConnected(provider) {
        const key = await this.getKey(provider);
        if (!key)
            return false;
        return this.validateKey(provider, key);
    }
}
export const authManager = new AuthManager();
//# sourceMappingURL=index.js.map
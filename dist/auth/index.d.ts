import { AuthConfig, Provider } from "../types/index.js";
declare class AuthManager {
    private authDir;
    constructor();
    ensureAuthDir(): Promise<void>;
    loadConfig(): Promise<AuthConfig>;
    saveConfig(config: AuthConfig): Promise<void>;
    saveKey(provider: Provider, apiKey: string): Promise<void>;
    removeKey(provider: Provider): Promise<void>;
    getKey(provider: Provider): Promise<string | null>;
    validateKey(provider: Provider, apiKey: string): Promise<boolean>;
    isConnected(provider: Provider): Promise<boolean>;
}
export declare const authManager: AuthManager;
export {};
//# sourceMappingURL=index.d.ts.map
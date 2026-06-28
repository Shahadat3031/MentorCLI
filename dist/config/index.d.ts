export declare const ROOT_DIR: string;
export declare const MENTOR_DIR = ".mentor";
export declare const SESSIONS_DIR: string;
export declare const LOGS_DIR: string;
export declare const MEMORY_DIR: string;
export declare const STATE_FILE: string;
export declare const PROJECT_FILE: string;
export declare const AUTH_FILE: string;
export declare function getProjectRoot(): string;
export declare function getMentorDir(projectRoot: string): string;
export declare function getSessionsDir(projectRoot: string): string;
export declare function getLogsDir(projectRoot: string): string;
export declare function getMemoryDir(projectRoot: string): string;
export declare function getStateFile(projectRoot: string): string;
export declare function getProjectFile(projectRoot: string): string;
export declare function ensureMentorDir(projectRoot: string): Promise<void>;
export declare const RETRY_POLICY: {
    readonly MAX_FIX_ATTEMPTS: 5;
    readonly MAX_TEST_RETRIES: 3;
    readonly MAX_REVIEW_RETRIES: 3;
    readonly MAX_PLANNER_ESCALATIONS: 2;
};
export declare const SCAN_MAX_DEPTH = 4;
export declare const SCAN_MAX_FILES = 25;
export declare const SCAN_SOURCE_DIRS: string[];
export declare const SCAN_IGNORE_DIRS: string[];
export declare const TERMINAL_COLORS: {
    readonly planner: "blue";
    readonly executor: "green";
    readonly tester: "yellow";
    readonly reviewer: "magenta";
    readonly git: "cyan";
    readonly human: "red";
};
//# sourceMappingURL=index.d.ts.map
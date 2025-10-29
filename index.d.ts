declare module 'atlas-server' {
    export class Database {
        private config: DatabaseConfig;
        constructor(config: DatabaseConfig);
        connect(): Promise<boolean>;
    }

    export interface DatabaseConfig {
        subdomain: string;
        username: string;
        password: string;
        cluster: string;
        dbName: string;
    }

    export class Server {
        private port: number;
        private server: any; // express.Application
        constructor(port: number);
        connectFrontend(frontendUrl: string): void;
        start(): Promise<void>;
        Use(route: string, router: any): void; // router: express.Router
    }

    export class Github {
        private username: string;
        private token: string;
        constructor(username: string, token: string);
        private get headers(): {
            Authorization: string;
            Accept: string;
        };
        repoInfo(repoName: string): Promise<{
            repoData: any;
            readme?: string;
            contributors?: any[];
            releases?: any[];
            logo?: string;
        }>;
    }
}
// types adapted from https://docs.microsoft.com/en-us/azure/static-web-apps/configuration
export interface StaticWebAppConfig {
	routes?: Route[];
	navigationFallback?: NavigationFallback;
}

export interface Route {
	route: string;
	methods?: HttpMethod[];
	rewrite?: string;
	redirect?: string;
	statusCode?: number;
	headers?: Record<string, string>;
	allowedRoles?: string[];
}

export interface NavigationFallback {
	rewrite: string;
	exclude?: string[];
}

export type HttpMethod =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'CONNECT'
	| 'OPTIONS'
	| 'TRACE'
	| 'PATCH';

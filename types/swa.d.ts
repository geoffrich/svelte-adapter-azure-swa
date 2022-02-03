// types adapted from https://docs.microsoft.com/en-us/azure/static-web-apps/configuration
export interface StaticWebAppConfig {
	routes?: Route[];
	navigationFallback?: NavigationFallback;
	globalHeaders?: Record<string, string>;
	responseOverrides?: Record<OverridableResponseCodes, ResponseOverride>;
	mimeTypes?: Record<string, string>;
}

export type CustomStaticWebAppConfig = Omit<StaticWebAppConfig, 'navigationFallback'>;

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

export interface ResponseOverride {
	rewrite?: string;
	statusCode?: number;
	redirect?: string;
}

export type OverridableResponseCodes = '400' | '401' | '403' | '404';

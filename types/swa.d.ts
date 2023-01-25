// types and documentation adapted from https://docs.microsoft.com/en-us/azure/static-web-apps/configuration
export interface StaticWebAppConfig {
	routes?: Route[];
	navigationFallback?: NavigationFallback;
	globalHeaders?: Record<string, string>;
	responseOverrides?: Record<OverridableResponseCodes, ResponseOverride>;
	mimeTypes?: Record<string, string>;
	platform?: Platform;
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

export interface Platform {
	apiRuntime: string;
}

/**
 * Client principal as presented to the render functions of a SWA.
 *
 * @see The official {@link https://learn.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript#client-principal-data documentation}
 * this was adapted from.
 */
export interface ClientPrincipal {
	/**
	 * The name of the identity provider.
	 *
	 * @remarks
	 *
	 * Currently, the default providers use the following values here:
	 * | Provider | value   |
	 * |----------|---------|
	 * | Azure AD | aad     |
	 * | GitHub   | github  |
	 * | Twitter  | twitter |
	 */
	identityProvider: string;

	/**
	 * An Azure Static Web Apps-specific unique identifier for the user.
	 *
	 *  - The value is unique on a per-app basis. For instance, the same user
	 *    returns a different userId value on a different Static Web Apps
	 *    resource.
	 *  - The value persists for the lifetime of a user. If you delete and add
	 *    the same user back to the app, a new userId is generated.
	 */
	userId: string;

	/**
	 * Username or email address of the user. Some providers return the user's
	 * email address, while others send the user handle.
	 *
	 * @remarks
	 *
	 * Currently, the default providers use the following types of values here:
	 * | Provider | value         |
	 * |----------|---------------|
	 * | Azure AD | email address |
	 * | GitHub   | username      |
	 * | Twitter  | username      |
	 */
	userDetails: string;

	/**
	 * An array of the user's assigned roles.
	 *
	 * All users (both authenticated and not) will always have the role
	 * `anonymous` and authenticated users will always have the role
	 * `authenticated`. Additional custom roles might be present as well.
	 */
	userRoles: string[];
}

export interface ClientPrincipalWithClaims extends ClientPrincipal {
	claims: ClientPrincipalClaim[];
}

export interface ClientPrincipalClaim {
	/**
	 * The type of claim.
	 *
	 * Usually a standardized type like `name` or `ver`, or a schema url like
	 * `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`.
	 */
	typ: string;

	/**
	 * The value of the claim.
	 */
	val: string;
}

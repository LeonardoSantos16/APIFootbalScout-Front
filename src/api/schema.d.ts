export interface paths {
    "/api/Acompanhamento": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AbrirAcompanhamentoRequestDto"];
                    "text/json": components["schemas"]["AbrirAcompanhamentoRequestDto"];
                    "application/*+json": components["schemas"]["AbrirAcompanhamentoRequestDto"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AbrirAcompanhamentoResult"];
                        "application/json": components["schemas"]["AbrirAcompanhamentoResult"];
                        "text/json": components["schemas"]["AbrirAcompanhamentoResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Acompanhamento/{jogadorId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jogadorId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ConsultarMudancaAcompanhamentoResponseDto"];
                        "application/json": components["schemas"]["ConsultarMudancaAcompanhamentoResponseDto"];
                        "text/json": components["schemas"]["ConsultarMudancaAcompanhamentoResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Analise/{jogadorId}/metricas-por-90": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    CompeticaoId?: number;
                    TemporadaId?: number;
                    Contexto?: components["schemas"]["ContextoDeRecorteDto"];
                };
                header?: never;
                path: {
                    jogadorId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["MetricasPor90ResponseDto"];
                        "application/json": components["schemas"]["MetricasPor90ResponseDto"];
                        "text/json": components["schemas"]["MetricasPor90ResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Analise/comparacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    JogadorA?: number;
                    JogadorB?: number;
                    CompeticaoId?: number;
                    TemporadaId?: number;
                    Contexto?: components["schemas"]["ContextoDeRecorteDto"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ComparacaoDiretaResponseDto"];
                        "application/json": components["schemas"]["ComparacaoDiretaResponseDto"];
                        "text/json": components["schemas"]["ComparacaoDiretaResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SignUpRequestDto"];
                    "text/json": components["schemas"]["SignUpRequestDto"];
                    "application/*+json": components["schemas"]["SignUpRequestDto"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AuthResponseDto"];
                        "application/json": components["schemas"]["AuthResponseDto"];
                        "text/json": components["schemas"]["AuthResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/signin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SignInRequestDto"];
                    "text/json": components["schemas"]["SignInRequestDto"];
                    "application/*+json": components["schemas"]["SignInRequestDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AuthResponseDto"];
                        "application/json": components["schemas"]["AuthResponseDto"];
                        "text/json": components["schemas"]["AuthResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RefreshTokenRequestDto"];
                    "text/json": components["schemas"]["RefreshTokenRequestDto"];
                    "application/*+json": components["schemas"]["RefreshTokenRequestDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AuthResponseDto"];
                        "application/json": components["schemas"]["AuthResponseDto"];
                        "text/json": components["schemas"]["AuthResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/signout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RefreshTokenRequestDto"];
                    "text/json": components["schemas"]["RefreshTokenRequestDto"];
                    "application/*+json": components["schemas"]["RefreshTokenRequestDto"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/signout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ChangePasswordRequestDto"];
                    "text/json": components["schemas"]["ChangePasswordRequestDto"];
                    "application/*+json": components["schemas"]["ChangePasswordRequestDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AuthResponseDto"];
                        "application/json": components["schemas"]["AuthResponseDto"];
                        "text/json": components["schemas"]["AuthResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UsuarioAutenticadoDto"];
                        "application/json": components["schemas"]["UsuarioAutenticadoDto"];
                        "text/json": components["schemas"]["UsuarioAutenticadoDto"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Players/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    q?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["SofaSearchResponse"];
                        "application/json": components["schemas"]["SofaSearchResponse"];
                        "text/json": components["schemas"]["SofaSearchResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Players/{id}/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PlayerFullProfileDto"];
                        "application/json": components["schemas"]["PlayerFullProfileDto"];
                        "text/json": components["schemas"]["PlayerFullProfileDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Relatorio/{relatorioId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    relatorioId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RelatorioResponseDto"];
                        "application/json": components["schemas"]["RelatorioResponseDto"];
                        "text/json": components["schemas"]["RelatorioResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    relatorioId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EditarRascunhoRelatorioRequestDto"];
                    "text/json": components["schemas"]["EditarRascunhoRelatorioRequestDto"];
                    "application/*+json": components["schemas"]["EditarRascunhoRelatorioRequestDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RelatorioResponseDto"];
                        "application/json": components["schemas"]["RelatorioResponseDto"];
                        "text/json": components["schemas"]["RelatorioResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Relatorio/jogador/{jogadorId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jogadorId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RelatorioResponseDto"][];
                        "application/json": components["schemas"]["RelatorioResponseDto"][];
                        "text/json": components["schemas"]["RelatorioResponseDto"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Relatorio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AbrirRascunhoRelatorioRequestDto"];
                    "text/json": components["schemas"]["AbrirRascunhoRelatorioRequestDto"];
                    "application/*+json": components["schemas"]["AbrirRascunhoRelatorioRequestDto"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RelatorioResponseDto"];
                        "application/json": components["schemas"]["RelatorioResponseDto"];
                        "text/json": components["schemas"]["RelatorioResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Relatorio/{relatorioId}/finalizar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    relatorioId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RelatorioResponseDto"];
                        "application/json": components["schemas"]["RelatorioResponseDto"];
                        "text/json": components["schemas"]["RelatorioResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Relatorio/{relatorioId}/correcoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    relatorioId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CorrigirRelatorioRequestDto"];
                    "text/json": components["schemas"]["CorrigirRelatorioRequestDto"];
                    "application/*+json": components["schemas"]["CorrigirRelatorioRequestDto"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RelatorioResponseDto"];
                        "application/json": components["schemas"]["RelatorioResponseDto"];
                        "text/json": components["schemas"]["RelatorioResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Shortlist": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ShortlistResponseDto"][];
                        "application/json": components["schemas"]["ShortlistResponseDto"][];
                        "text/json": components["schemas"]["ShortlistResponseDto"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CriarShortlistRequestDto"];
                    "text/json": components["schemas"]["CriarShortlistRequestDto"];
                    "application/*+json": components["schemas"]["CriarShortlistRequestDto"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ShortlistResponseDto"];
                        "application/json": components["schemas"]["ShortlistResponseDto"];
                        "text/json": components["schemas"]["ShortlistResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Shortlist/{shortlistId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    shortlistId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ShortlistResponseDto"];
                        "application/json": components["schemas"]["ShortlistResponseDto"];
                        "text/json": components["schemas"]["ShortlistResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Shortlist/{shortlistId}/alvos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    shortlistId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AdicionarAlvoRequestDto"];
                    "text/json": components["schemas"]["AdicionarAlvoRequestDto"];
                    "application/*+json": components["schemas"]["AdicionarAlvoRequestDto"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ShortlistResponseDto"];
                        "application/json": components["schemas"]["ShortlistResponseDto"];
                        "text/json": components["schemas"]["ShortlistResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Shortlist/{shortlistId}/alvos/{jogadorId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    shortlistId: string;
                    jogadorId: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RepriorizarAlvoRequestDto"];
                    "text/json": components["schemas"]["RepriorizarAlvoRequestDto"];
                    "application/*+json": components["schemas"]["RepriorizarAlvoRequestDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ShortlistResponseDto"];
                        "application/json": components["schemas"]["ShortlistResponseDto"];
                        "text/json": components["schemas"]["ShortlistResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    shortlistId: string;
                    jogadorId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ShortlistResponseDto"];
                        "application/json": components["schemas"]["ShortlistResponseDto"];
                        "text/json": components["schemas"]["ShortlistResponseDto"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Tournament/tournament": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    tournamentId?: number;
                    seasonId?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["SofaTournamentFullDTO"];
                        "application/json": components["schemas"]["SofaTournamentFullDTO"];
                        "text/json": components["schemas"]["SofaTournamentFullDTO"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AbrirAcompanhamentoRequestDto: {
            /** Format: int32 */
            jogadorId?: number;
            /** Format: int32 */
            competicaoId?: number;
            /** Format: int32 */
            temporadaId?: number;
            contexto: components["schemas"]["ContextoDeRecorteDto"];
        };
        AbrirAcompanhamentoResult: {
            /** Format: uuid */
            dossieId: string;
            /** Format: date-time */
            abertoEm: string;
            /** Format: date-time */
            medidaEm: string;
        };
        AbrirRascunhoRelatorioRequestDto: {
            /** Format: int32 */
            jogadorId?: number;
            texto: string;
            /** Format: date-time */
            observadoEm: string;
        };
        AdicionarAlvoRequestDto: {
            /** Format: int32 */
            jogadorId?: number;
            /** Format: int32 */
            prioridade?: number;
            custoEstimado: components["schemas"]["DinheiroDto"];
        };
        AfericaoDeClubeDto: {
            resultado: components["schemas"]["ResultadoDaAfericaoDto"];
            anterior?: null | string;
            atual?: null | string;
            motivo?: null | components["schemas"]["MotivoDeIndisponibilidadeDto"];
        };
        AfericaoDeMinutagemDto: {
            resultado: components["schemas"]["ResultadoDaAfericaoDto"];
            /** Format: int32 */
            anterior?: null | number;
            /** Format: int32 */
            atual?: null | number;
            /** Format: int32 */
            variacaoAbsoluta?: null | number;
            motivo?: null | components["schemas"]["MotivoDeIndisponibilidadeDto"];
        };
        AfericaoDeValorDeMercadoDto: {
            resultado: components["schemas"]["ResultadoDaAfericaoDto"];
            anterior?: null | components["schemas"]["DinheiroDto"];
            atual?: null | components["schemas"]["DinheiroDto"];
            /** Format: double */
            variacaoPercentualAbsoluta?: null | number;
            motivo?: null | components["schemas"]["MotivoDeIndisponibilidadeDto"];
        };
        AlvoResponseDto: {
            /** Format: int32 */
            jogadorId: number;
            /** Format: int32 */
            prioridade: number;
            custoEstimado: components["schemas"]["DinheiroDto"];
        };
        AtributoComparadoDto: {
            tipo: components["schemas"]["TipoDeAtributoDto"];
            valores: {
                [key: string]: components["schemas"]["ValorComparadoDto"];
            };
        };
        AtributoDto: {
            tipo: components["schemas"]["TipoDeAtributoDto"];
            resultado: components["schemas"]["ResultadoDoCalculoDto"];
            /** Format: double */
            valor?: null | number;
            /** Format: int32 */
            amostraEmMinutos?: null | number;
            motivo?: null | components["schemas"]["MotivoDaRecusaDto"];
        };
        AuthResponseDto: {
            /** Format: uuid */
            userId: string;
            name: string;
            email: string;
            accessToken: string;
            /** Format: date-time */
            accessTokenExpiresAtUtc: string;
            refreshToken: string;
            /** Format: date-time */
            refreshTokenExpiresAtUtc: string;
        };
        ChangePasswordRequestDto: {
            currentPassword: string;
            newPassword: string;
        };
        ComparacaoDiretaResponseDto: {
            jogadores: {
                [key: string]: components["schemas"]["JogadorNaComparacaoDto"];
            };
            resultado: components["schemas"]["ResultadoDaComparacaoDto"];
            recorte?: null | components["schemas"]["RecorteDto"];
            motivo?: null | components["schemas"]["MotivoDaRecusaDaComparacaoDto"];
            atributos?: null | components["schemas"]["AtributoComparadoDto"][];
        };
        ConsultarMudancaAcompanhamentoResponseDto: {
            /** Format: uuid */
            dossieId: string;
            /** Format: int32 */
            jogadorId: number;
            janela: components["schemas"]["JanelaDaComparacaoDto"];
            clube: components["schemas"]["AfericaoDeClubeDto"];
            valorDeMercado: components["schemas"]["AfericaoDeValorDeMercadoDto"];
            minutagem: components["schemas"]["AfericaoDeMinutagemDto"];
        };
        /** @enum {string} */
        ContextoDeRecorteDto: "Clube" | "Selecao";
        CorrigirRelatorioRequestDto: {
            texto: string;
        };
        CriarShortlistRequestDto: {
            nome: string;
        };
        DinheiroDto: {
            /** Format: int64 */
            quantiaEmCentavos: number;
            moeda: string;
        };
        EditarRascunhoRelatorioRequestDto: {
            texto?: null | string;
            /** Format: double */
            nota?: null | number;
            pontosPositivos?: null | string[];
            pontosNegativos?: null | string[];
            parecer?: null | components["schemas"]["ParecerDto"];
        };
        JanelaDaComparacaoDto: {
            /** Format: date-time */
            de: string;
            /** Format: date-time */
            ate: string;
            /** Format: double */
            duracaoEmDias: number;
        };
        JogadorNaComparacaoDto: {
            nome: string;
            posicao?: null | components["schemas"]["PosicaoDto"];
        };
        MetricasPor90ResponseDto: {
            /** Format: int32 */
            jogadorId: number;
            recorte: components["schemas"]["RecorteDto"];
            atributos: components["schemas"]["AtributoDto"][];
        };
        /** @enum {string} */
        MotivoDaRecusaDaComparacaoDto: "PosicoesIncompativeis" | "PosicaoDesconhecida" | "RecorteDivergente" | "AmostraInsuficiente";
        /** @enum {string} */
        MotivoDaRecusaDto: "AmostraInsuficiente" | "FonteNaoAtribuiu";
        /** @enum {string} */
        MotivoDeIndisponibilidadeDto: "MoedaInesperada" | "TemporadaVirada";
        /** @enum {string} */
        ParecerDto: "Contratar" | "Monitorar" | "Reavaliar" | "Descartar";
        PlayerFullProfileDto: {
            details?: null | components["schemas"]["SofaPlayerDetail"];
            stats?: null | components["schemas"]["SofaSeasonStatisticItem"][];
            historyTransfer?: null | components["schemas"]["SofaTransfer"][];
            nationalTeamStats?: null | components["schemas"]["SofaNationalTeamStats"][];
            playerImage?: null | string;
        };
        /** @enum {string} */
        PosicaoDto: "Goleiro" | "Defesa" | "MeioCampo" | "Ataque";
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
        };
        RecorteDto: {
            /** Format: int32 */
            competicaoId: number;
            /** Format: int32 */
            temporadaId: number;
            contexto: components["schemas"]["ContextoDeRecorteDto"];
        };
        RefreshTokenRequestDto: {
            refreshToken: string;
        };
        RelatorioResponseDto: {
            /** Format: uuid */
            relatorioId: string;
            /** Format: int32 */
            jogadorId: number;
            status: components["schemas"]["StatusRelatorioDto"];
            texto: string;
            /** Format: date-time */
            observadoEm: string;
            /** Format: date-time */
            escritoEm: string;
            pontosPositivos: string[];
            pontosNegativos: string[];
            /** Format: double */
            nota?: null | number;
            parecer?: null | components["schemas"]["ParecerDto"];
            /** Format: date-time */
            finalizadoEm?: null | string;
            /** Format: uuid */
            corrigeRelatorioId?: null | string;
        };
        RepriorizarAlvoRequestDto: {
            /** Format: int32 */
            prioridade?: number;
        };
        /** @enum {string} */
        ResultadoDaAfericaoDto: "ComMudanca" | "SemMudancaRelevante" | "Indisponivel";
        /** @enum {string} */
        ResultadoDaComparacaoDto: "Realizada" | "Recusada";
        /** @enum {string} */
        ResultadoDoCalculoDto: "Calculada" | "Recusada";
        ShortlistResponseDto: {
            /** Format: uuid */
            shortlistId: string;
            nome: string;
            /** Format: int32 */
            limiteDeAlvos: number;
            alvos: components["schemas"]["AlvoResponseDto"][];
            custoTotal?: null | components["schemas"]["DinheiroDto"];
        };
        SignInRequestDto: {
            email: string;
            password: string;
        };
        SignUpRequestDto: {
            name: string;
            email: string;
            password: string;
        };
        SofaCategory: {
            /** Format: int32 */
            id: number;
            name: string;
            country: components["schemas"]["SofaCountrySummary"];
            flag: null | string;
        };
        SofaCategorySummary: {
            name: string;
            flag: null | string;
        };
        SofaCountry: {
            name: string;
            alpha2: string;
        };
        SofaCountrySummary: {
            name: string;
            alpha2: string;
        };
        SofaEntity: {
            /** Format: int32 */
            id: number;
            name: string;
            shortName: string;
            team: null | components["schemas"]["SofaTeam"];
            country: null | components["schemas"]["SofaCountry"];
            position: null | string;
            jerseyNumber: null | string;
            sofascoreId: null | string;
        };
        SofaHistoricalStats: {
            /** Format: double */
            rating: number;
            /** Format: int32 */
            appearances: number;
            /** Format: int32 */
            goals: number;
            /** Format: int32 */
            assists: number;
            /** Format: int32 */
            minutesPlayed: number;
            /** Format: double */
            expectedGoals: null | number;
            /** Format: double */
            expectedAssists: null | number;
            /** Format: double */
            accuratePassesPercentage: number;
            /** Format: int32 */
            keyPasses: number;
            /** Format: int32 */
            tackles: number;
            /** Format: int32 */
            interceptions: number;
            /** Format: int32 */
            yellowCards: number;
            /** Format: int32 */
            redCards: number;
        };
        SofaMarketValue: {
            /** Format: int64 */
            value: number;
            currency: string;
        };
        SofaNationalTeam: {
            /** Format: int32 */
            id: number;
            name: string;
            nameCode: string;
            /** Format: int32 */
            ranking: null | number;
            national: boolean;
        };
        SofaNationalTeamStats: {
            team: components["schemas"]["SofaNationalTeam"];
            /** Format: int32 */
            appearances: number;
            /** Format: int32 */
            goals: number;
            /** Format: int64 */
            debutTimestamp: number;
        };
        SofaPlayerDetail: {
            /** Format: int32 */
            id: number;
            name: string;
            slug: string;
            team: components["schemas"]["SofaTeamDetail"];
            position: string;
            positionsDetailed: string[];
            jerseyNumber: null | string;
            /** Format: int32 */
            height: number;
            /** Format: date-time */
            dateOfBirth: string;
            preferredFoot: null | string;
            /** Format: int32 */
            userCount: number;
            /** Format: int64 */
            proposedMarketValue: number;
            proposedMarketValueRaw: null | components["schemas"]["SofaMarketValue"];
        };
        SofaPlayerSummary: {
            /** Format: int32 */
            id: number;
            name: string;
            slug: string;
            position: string;
        };
        SofaPromotion: {
            text: string;
        };
        SofaSearchResponse: {
            results: components["schemas"]["SofaSearchResult"][];
        };
        SofaSearchResult: {
            entity: components["schemas"]["SofaEntity"];
            /** Format: float */
            score: number;
            type: string;
        };
        SofaSeasonInfo: {
            /** Format: int32 */
            id: number;
            name: string;
        };
        SofaSeasonStatisticItem: {
            year: string;
            team: components["schemas"]["SofaTeam"];
            uniqueTournament: components["schemas"]["SofaTournamentSummary"];
            statistics: components["schemas"]["SofaHistoricalStats"];
            season: components["schemas"]["SofaSeasonInfo"];
        };
        SofaStandingGroup: {
            rows: components["schemas"]["SofaStandingRow"][];
            type: string;
        };
        SofaStandingRow: {
            /** Format: int32 */
            position: number;
            team: components["schemas"]["SofaTeamSummary"];
            /** Format: int32 */
            matches: number;
            /** Format: int32 */
            wins: number;
            /** Format: int32 */
            draws: number;
            /** Format: int32 */
            losses: number;
            /** Format: int32 */
            scoresFor: number;
            /** Format: int32 */
            scoresAgainst: number;
            /** Format: int32 */
            points: number;
            scoreDiffFormatted: string;
            promotion: null | components["schemas"]["SofaPromotion"];
        };
        SofaTeam: {
            /** Format: int32 */
            id: number;
            name: string;
            gender: string;
        };
        SofaTeamDetail: {
            /** Format: int32 */
            id: number;
            name: string;
            nameCode: string;
            tournament: components["schemas"]["SofaTournament"];
            national: boolean;
            /** Format: int32 */
            userCount: number;
        };
        SofaTeamSummary: {
            /** Format: int32 */
            id: number;
            name: string;
            nameCode: string;
        };
        SofaTopPlayerItem: {
            player: components["schemas"]["SofaPlayerSummary"];
            team: components["schemas"]["SofaTeamSummary"];
            statistics: components["schemas"]["SofaTopPlayerStats"];
            playedEnough: boolean;
        };
        SofaTopPlayers: {
            rating: components["schemas"]["SofaTopPlayerItem"][];
        };
        SofaTopPlayerStats: {
            /** Format: int32 */
            id: number;
            /** Format: double */
            rating: number;
            /** Format: int32 */
            appearances: number;
        };
        SofaTournament: {
            /** Format: int32 */
            id: number;
            name: string;
        };
        SofaTournamentFullDTO: {
            details: null | components["schemas"]["SofaUniqueTournament"];
            topPlayers: null | components["schemas"]["SofaTopPlayers"];
            stading: null | components["schemas"]["SofaStandingGroup"][];
            image: string;
        };
        SofaTournamentSummary: {
            /** Format: int32 */
            id: number;
            name: string;
            competitionType: string;
            category: components["schemas"]["SofaCategorySummary"];
        };
        SofaTransfer: {
            /** Format: int32 */
            id: number;
            fromTeamName: string;
            toTeamName: string;
            transferFrom: components["schemas"]["SofaTransferTeam"];
            transferTo: components["schemas"]["SofaTransferTeam"];
            transferFeeDescription: null | string;
            /** Format: int64 */
            transferDateTimestamp: number;
            transferFeeRaw: null | components["schemas"]["SofaTransferFee"];
        };
        SofaTransferFee: {
            /** Format: int64 */
            value: number;
            currency: string;
        };
        SofaTransferTeam: {
            /** Format: int32 */
            id: number;
            name: string;
            shortName: string;
        };
        SofaUniqueTournament: {
            /** Format: int32 */
            id: number;
            name: string;
            category: components["schemas"]["SofaCategory"];
            /** Format: int32 */
            tier: number;
            /** Format: int32 */
            userCount: number;
            titleHolder: null | components["schemas"]["SofaTeamSummary"];
            mostTitlesTeams: components["schemas"]["SofaTeamSummary"][];
            /** Format: int64 */
            startDateTimestamp: null | number;
            /** Format: int64 */
            endDateTimestamp: null | number;
        };
        /** @enum {string} */
        StatusRelatorioDto: "Rascunho" | "Finalizado";
        /** @enum {string} */
        TipoDeAtributoDto: "Gols" | "Assistencias" | "PassesDecisivos" | "Desarmes" | "Interceptacoes" | "Rating" | "PrecisaoDePasse";
        UsuarioAutenticadoDto: {
            /** Format: uuid */
            userId: string;
            email: string;
            roles: string[];
        };
        ValorComparadoDto: {
            resultado: components["schemas"]["ResultadoDoCalculoDto"];
            /** Format: double */
            valor?: null | number;
            /** Format: int32 */
            amostraEmMinutos?: null | number;
            motivo?: null | components["schemas"]["MotivoDaRecusaDto"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;

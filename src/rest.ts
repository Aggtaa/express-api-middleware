/* eslint-disable @typescript-eslint/no-namespace */
import { camelCase } from 'change-case';
import handlebars from 'handlebars';
import express, {
    NextFunction, Request, Response,
} from 'express'; // eslint-disable-line import/no-extraneous-dependencies
import { isNullOrUndefined } from 'util';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export type RestApiOptions = {
    clientClassName: string;
};

// const defaultOptions: RestApiOptions = {
//     clientClassName: 'API',
// };

type ApiMethod = {
    name: string;
    params: string[];
    method: string;
    path: string;
    hasBody: boolean;
}

type ApiMethodSet = {
    url: string;
    name: string;
    methods: ApiMethod[];
}

type ExpressRoute = express.IRoute & {methods: {[method: string]: boolean}};

type ExpressLayer = {
    name: string;
    keys: string[];
    route: ExpressRoute;
    method: string;
}

export function rest(
    root: string,
    routers: {[root: string]: express.Router},
): express.RequestHandler {

    let browserScript: string;

    // const options: RestApiOptions = { ...defaultOptions/* , ...(opts || {})*/ };

    function getBrowserScript(req: Request, res: Response): void {
        res.contentType('text/javascript; charset=UTF-8');
        res.send(browserScript);
    }

    function buildBrowserScript(
        routers: {[root: string]: express.Router}, // eslint-disable-line no-shadow
    ): string {

        const apis: ApiMethodSet[] = [];

        function addHandler(
            api: ApiMethodSet,
            handler: ExpressLayer,
            path: string,
            params: string[],
        ): void {

            // console.log('--handler--');
            // console.log(path);
            // console.log(params);
            // console.dir(handler);

            const httpMethod: string = handler.method.toUpperCase();

            const hasBody: boolean = httpMethod !== 'GET' && httpMethod !== 'HEAD';

            if (hasBody)
                params.push('body');

            params.forEach((p: string) => {
                path = path.replace(':' + p, '${encodeURIComponent(' + p + ')}');
            });

            const method: ApiMethod = {
                name: handler.name,
                params,
                path: api.url.replace(/\/$/, '') + '/' + path.replace(/^\//, ''),
                method: handler.method.toUpperCase(),
                hasBody,
            };

            api.methods.push(method);
        }

        function addRoute(
            api: ApiMethodSet,
            route: ExpressRoute,
            params: {name: string}[],
        ): void {

            // console.log('--route--');
            // console.dir(params);
            // console.dir(route);

            for (const h of route.stack)
                addHandler(api, h, route.path, params.map((p: {name: string}) => p.name));
        }

        function addRouter(
            api: ApiMethodSet,
            router: express.Router, // eslint-disable-line no-shadow
        ): void {
            // console.dir(router);
            apis.push(api);
            for (const handler of router.stack) {

                // if (handler.handle && handler.handle.stack) {
                //     // console.dir(handler);
                //     const routerApi: ApiMethodSet = { name: 'asd', methods: [] };
                //     addRouter(routerApi, handler.handle);
                // }
                // else
                if (!isNullOrUndefined(handler.route)) {
                    addRoute(api, handler.route, handler.keys);
                }
            }
        }

        Object.entries(routers).forEach(([url, router]: [string, express.Router]) => {
            addRouter({ url, name: camelCase(url.replace(/api/gi, '')), methods: [] }, router);
        });

        const tmpl: handlebars.TemplateDelegate = handlebars.compile(readFileSync(resolve(__dirname, 'browser.js.hbs'), 'utf-8'));
        return tmpl({ className: 'API', apis });
    }

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        if (isNullOrUndefined(browserScript)) {
            browserScript = buildBrowserScript(routers);
            console.dir(require.resolve('handlebars'));
            // req.app.use(root + '/handlebars', require.resolve('handlebars'));
            req.app.get(root + '/browser.js', getBrowserScript);
        }
        next();
    };
}

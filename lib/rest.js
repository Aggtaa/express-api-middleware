"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-namespace */
const change_case_1 = require("change-case");
const handlebars_1 = tslib_1.__importDefault(require("handlebars"));
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = require("path");
function rest(root, routers) {
    let browserScript;
    // const options: RestApiOptions = { ...defaultOptions/* , ...(opts || {})*/ };
    function getBrowserScript(req, res) {
        res.contentType('text/javascript; charset=UTF-8');
        res.send(browserScript);
    }
    function buildBrowserScript(routers) {
        const apis = [];
        function addHandler(api, handler, path, params) {
            // console.log('--handler--');
            // console.log(path);
            // console.log(params);
            // console.dir(handler);
            const httpMethod = handler.method.toUpperCase();
            const hasBody = httpMethod !== 'GET' && httpMethod !== 'HEAD';
            if (hasBody)
                params.push('body');
            params.forEach((p) => {
                path = path.replace(':' + p, '${encodeURIComponent(' + p + ')}');
            });
            const method = {
                name: handler.name,
                params,
                path: api.url.replace(/\/$/, '') + '/' + path.replace(/^\//, ''),
                method: handler.method.toUpperCase(),
                hasBody,
            };
            api.methods.push(method);
        }
        function addRoute(api, route, params) {
            // console.log('--route--');
            // console.dir(params);
            // console.dir(route);
            for (const h of route.stack)
                addHandler(api, h, route.path, params.map((p) => p.name));
        }
        function addRouter(api, router) {
            // console.dir(router);
            apis.push(api);
            for (const handler of router.stack) {
                // if (handler.handle && handler.handle.stack) {
                //     // console.dir(handler);
                //     const routerApi: ApiMethodSet = { name: 'asd', methods: [] };
                //     addRouter(routerApi, handler.handle);
                // }
                // else
                if (!util_1.isNullOrUndefined(handler.route)) {
                    addRoute(api, handler.route, handler.keys);
                }
            }
        }
        Object.entries(routers).forEach(([url, router]) => {
            addRouter({ url, name: change_case_1.camelCase(url.replace(/api/gi, '')), methods: [] }, router);
        });
        const tmpl = handlebars_1.default.compile(fs_1.readFileSync(path_1.resolve(__dirname, 'browser.js.hbs'), 'utf-8'));
        return tmpl({ className: 'API', apis });
    }
    return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (util_1.isNullOrUndefined(browserScript)) {
            browserScript = buildBrowserScript(routers);
            console.dir(require.resolve('handlebars'));
            // req.app.use(root + '/handlebars', require.resolve('handlebars'));
            req.app.get(root + '/browser.js', getBrowserScript);
        }
        next();
    });
}
exports.rest = rest;

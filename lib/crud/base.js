"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCrud = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
function wrapExec(handler, req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const args = req.params;
        args.body = req.body;
        const result = yield handler(args);
        res.json(result);
        return result;
    });
}
function buildCrud(name, options) {
    const router = express_1.Router();
    router.className = name;
    const routes = new class {
        getAll(req, res, next) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield wrapExec(options.getAll, req, res, next);
            });
        }
        getOne(req, res, next) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield wrapExec(options.getOne, req, res, next);
            });
        }
        createOne(req, res, next) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield wrapExec(options.createOne, req, res, next);
            });
        }
        updateOne(req, res, next) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield wrapExec(options.updateOne, req, res, next);
            });
        }
        deleteOne(req, res, next) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield wrapExec(options.deleteOne, req, res, next);
            });
        }
    }();
    router.get('/all', routes.getAll);
    router.get('/:id', routes.getOne);
    router.post('/new', routes.createOne);
    router.post('/:id', routes.updateOne);
    router.delete('/:id', routes.deleteOne);
    return router;
}
exports.buildCrud = buildCrud;

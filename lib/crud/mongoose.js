"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMongooseCrud = void 0;
const tslib_1 = require("tslib");
const base_1 = require("./base");
function buildMongooseCrud(name, model) {
    return base_1.buildCrud(name, {
        getAll: () => tslib_1.__awaiter(this, void 0, void 0, function* () { return (yield model.find().exec()).map((obj) => obj.toObject()); }),
        getOne: ({ id }) => tslib_1.__awaiter(this, void 0, void 0, function* () { return (yield model.findById(id).exec()).toObject(); }),
        createOne: ({ body }) => tslib_1.__awaiter(this, void 0, void 0, function* () { return (yield model.create(body)).toObject(); }),
        updateOne: ({ id, body }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield model
                .findByIdAndUpdate(id, body, { new: true })
                .exec()).toObject();
        }),
        deleteOne: ({ id }) => tslib_1.__awaiter(this, void 0, void 0, function* () { return (yield model.findByIdAndDelete(id).exec()).toObject(); }),
    });
}
exports.buildMongooseCrud = buildMongooseCrud;

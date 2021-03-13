import { Document, Model, UpdateQuery } from 'mongoose'; // eslint-disable-line import/no-extraneous-dependencies
import { buildCrud, NamedRouter } from './base';

export function buildMongooseCrud<T extends Document>(
    name: string,
    model: Model<T>,
): NamedRouter {

    return buildCrud(
        name,
        {
            getAll:
                async () =>
                    (await model.find().exec()).map((obj: T) => obj.toObject()),
            getOne:
                async ({ id }: {id: string}) =>
                    (await model.findById(id).exec()).toObject(),
            createOne:
                async ({ body }: {body: unknown}) =>
                    (await model.create(body as T)).toObject(),
            updateOne:
                async ({ id, body }: {id: string, body: unknown}) =>
                    (
                        await model
                            .findByIdAndUpdate(id, body as UpdateQuery<T>, { new: true })
                            .exec()
                    ).toObject(),
            deleteOne:
                async ({ id }: {id: string}) =>
                    (await model.findByIdAndDelete(id).exec()).toObject(),
        },
    );
}

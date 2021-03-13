import { Router } from 'express';
export declare type NamedRouter = Router & {
    className: string;
};
export interface CrudApiOptions<T> {
    getAll: () => T[] | PromiseLike<T[]>;
    getOne: ({ id }: {
        id: string;
    }) => T | PromiseLike<T>;
    createOne: ({ body }: {
        body: unknown;
    }) => T | PromiseLike<T>;
    updateOne: ({ id, body }: {
        id: string;
        body: unknown;
    }) => T | PromiseLike<T>;
    deleteOne: ({ id }: {
        id: string;
    }) => T | PromiseLike<T>;
}
export declare function buildCrud<T>(name: string, options: CrudApiOptions<T>): NamedRouter;

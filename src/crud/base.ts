import {
    Request, Response, NextFunction, Router,
} from 'express';

export type NamedRouter = Router & {
    className: string;
};

export interface CrudApiOptions<T> {
    getAll: () => T[] | PromiseLike<T[]>,
    getOne: ({ id }: {id: string}) => T | PromiseLike<T>,
    createOne: ({ body }: {body: unknown}) => T | PromiseLike<T>,
    updateOne: ({ id, body }: {id: string, body: unknown}) => T | PromiseLike<T>,
    deleteOne: ({ id }: {id: string}) => T | PromiseLike<T>,
}

async function wrapExec<T>(
    handler: (
        args: {[key: string]: any}, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => T | PromiseLike<T>,
    req: Request,
    res: Response,
    next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<T> {

    const args: {[key: string]: string} = req.params;
    args.body = req.body;
    const result: T = await handler(args);

    res.json(result);

    return result;
}

export function buildCrud<T>(
    name: string,
    options: CrudApiOptions<T>,
): NamedRouter {

    const router: NamedRouter = Router() as NamedRouter;
    router.className = name;

    const routes = new class { // eslint-disable-line @typescript-eslint/typedef

        async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
            await wrapExec(options.getAll, req, res, next);
        }

        async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
            await wrapExec(options.getOne, req, res, next);
        }

        async createOne(req: Request, res: Response, next: NextFunction): Promise<void> {
            await wrapExec(options.createOne, req, res, next);
        }

        async updateOne(req: Request, res: Response, next: NextFunction): Promise<void> {
            await wrapExec(options.updateOne, req, res, next);
        }

        async deleteOne(req: Request, res: Response, next: NextFunction): Promise<void> {
            await wrapExec(options.deleteOne, req, res, next);
        }
    }();

    router.get('/all', routes.getAll);
    router.get('/:id', routes.getOne);
    router.post('/new', routes.createOne);
    router.post('/:id', routes.updateOne);
    router.delete('/:id', routes.deleteOne);

    return router;
}

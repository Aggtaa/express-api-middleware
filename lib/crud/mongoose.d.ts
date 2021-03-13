import { Document, Model } from 'mongoose';
import { NamedRouter } from './base';
export declare function buildMongooseCrud<T extends Document>(name: string, model: Model<T>): NamedRouter;

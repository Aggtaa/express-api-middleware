import express from 'express';
export declare type RestApiOptions = {
    clientClassName: string;
};
export declare function rest(root: string, routers: {
    [root: string]: express.Router;
}): express.RequestHandler;

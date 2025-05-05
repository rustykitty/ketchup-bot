export default class Procedures {
    db: D1Database;
    env: Env;
    ctx: ExecutionContext;

    constructor(db: D1Database, env: Env, ctx: ExecutionContext) {
        this.db = db;
        this.env = env;
        this.ctx = ctx;
    }
}

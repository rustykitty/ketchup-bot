import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";

import { sendDM, openDM } from "./scheduled.js";

type Params = RemindersRow;

class RemindersWorkflow extends WorkflowEntrypoint<Env, Params> {
    constructor(ctx: ExecutionContext, env: Env) {
        super(ctx, env);
    }

    async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<void> {
        const params: RemindersRow = event.payload;
        const { timestamp } = params;
        step.sleep("sleep until time for reminder", timestamp - +event.timestamp);
        sendDM(params, this.env);
    }
}

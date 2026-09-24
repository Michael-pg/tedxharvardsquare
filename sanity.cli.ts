/**
 * Config for the `sanity` CLI (login, cors, dataset, exec, typegen).
 */

import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({ api: { projectId, dataset } });

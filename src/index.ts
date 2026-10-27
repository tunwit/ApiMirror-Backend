import { app } from "./app";
import { env } from "./config/config";

app.listen(env.port);

console.log(`ApiMirror API listening on ${env.authURL}`);

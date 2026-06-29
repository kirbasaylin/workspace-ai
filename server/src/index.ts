import { createApp } from "./app.js";
import { env } from "./env.js";

const app = createApp();
app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`✓ API on http://localhost:${env.PORT}  (llm=${env.LLM_PROVIDER}, embeddings=${env.EMBEDDING_PROVIDER})`);
});

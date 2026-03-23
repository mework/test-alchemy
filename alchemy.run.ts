import alchemy from "alchemy";
import { Vite, Worker } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore } from "alchemy/state";

const app = await alchemy("temp-alchemy-app", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

const website = await Vite("website", {});

export const worker = await Worker("temp-worker", {
  entrypoint: "src/worker.ts",
});

console.log(`Worker deployed at: ${worker.url}`);

if (process.env.PULL_REQUEST) {
  // if this is a PR, add a comment to the PR with the preview URL
  // it will auto-update with each push
  await GitHubComment("preview-comment", {
    owner: "your-username",
    repository: "your-repo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `
## 🚀 Preview Deployed

Your changes have been deployed to a preview environment:

**🌐 Website:** ${website.url}

Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

+---
<sub>🤖 This comment updates automatically with each push.</sub>`,
  });
}

await app.finalize();

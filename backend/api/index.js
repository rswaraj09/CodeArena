const app = require('../src/app');
const { connectDB } = require('../src/config/db');

/**
 * Vercel serverless entrypoint. Vercel's Node runtime can invoke an Express
 * app directly as a request handler, so this just ensures the DB connection
 * is warm before delegating to it.
 *
 * What does NOT work here, by design of serverless functions:
 *  - The Docker judge (src/modules/submission/judge/dockerJudgeService.js)
 *    shells out to the `docker` CLI, which does not exist in a Vercel
 *    function's runtime. /problems/:slug/run and /submit will return a
 *    clear 503-style RUNTIME_ERROR verdict instead of crashing — see
 *    JUDGE_DISABLED in src/config/env.js. Point JUDGE_API_URL (if you wire
 *    one up) or the judge itself at an external host instead.
 *  - The Socket.IO live leaderboard (src/websocket/socket.js) needs a
 *    persistent connection between the client and one process; Vercel
 *    functions are stateless and short-lived. broadcastLeaderboard() is a
 *    no-op here — poll GET /api/leaderboard instead, or host the socket
 *    layer on a separate always-on service.
 *
 * See README.md → "Deploying to Vercel" for the recommended split.
 */
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};

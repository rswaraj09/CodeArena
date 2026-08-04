const Submission = require('../../models/Submission');
const userService = require('../user/user.service');

/**
 * Computes standings on demand from accepted submissions rather than
 * maintaining a separately-updated leaderboard table — mirrors
 * LeaderboardService.java.
 */
async function getLeaderboard(contestId) {
  const filter = contestId ? { contestId, verdict: 'ACCEPTED' } : { verdict: 'ACCEPTED' };
  const accepted = await Submission.find(filter).sort({ createdAt: 1 });

  const byUserId = new Map();
  for (const s of accepted) {
    if (!byUserId.has(s.userId)) byUserId.set(s.userId, []);
    byUserId.get(s.userId).push(s);
  }

  const standings = [...byUserId.entries()].map(([userId, subs]) => {
    const solvedProblemIds = new Set(subs.map((s) => String(s.problemId)));
    const solved = solvedProblemIds.size;
    const totalRuntimeMs = subs.reduce((sum, s) => sum + (s.runtimeMs || 0), 0);
    return { userId, solved, score: solved * 100, totalRuntimeMs };
  });

  standings.sort((a, b) => (b.score - a.score) || (a.totalRuntimeMs - b.totalRuntimeMs));

  const entries = [];
  for (let i = 0; i < standings.length; i++) {
    const s = standings[i];
    let user;
    try {
      user = await userService.getById(s.userId);
    } catch (_e) {
      console.warn(`Could not find user ${s.userId} for leaderboard entry`);
      continue;
    }
    entries.push({
      rank: i + 1,
      userId: user.id,
      name: user.name,
      college: user.college,
      solved: s.solved,
      score: s.score,
      totalRuntimeMs: s.totalRuntimeMs,
    });
  }
  return entries;
}

module.exports = { getLeaderboard };

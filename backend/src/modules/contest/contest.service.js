const Contest = require('../../models/Contest');
const ContestParticipant = require('../../models/ContestParticipant');
const Problem = require('../../models/Problem');
const { BadRequestException, ResourceNotFoundException } = require('../../common/errors');

async function create(request, creator) {
  if (!(new Date(request.endTime) > new Date(request.startTime))) {
    throw new BadRequestException('Contest end time must be after the start time.');
  }
  const problems = await Problem.find({ _id: { $in: request.problemIds } });
  if (problems.length !== request.problemIds.length) {
    throw new BadRequestException('One or more problem IDs are invalid.');
  }

  return Contest.create({
    title: request.title,
    description: request.description,
    startTime: request.startTime,
    endTime: request.endTime,
    negativeMarking: request.negativeMarking,
    createdById: creator.id,
    problemIds: problems.map((p) => p._id),
  });
}

async function list() {
  const contests = await Contest.find().sort({ startTime: -1 });
  return Promise.all(
    contests.map(async (c) => ({
      id: c.id,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
      status: c.getStatus(),
      problemCount: c.problemIds.length,
      participantCount: await ContestParticipant.countDocuments({ contestId: c._id }),
    }))
  );
}

async function getDetail(contestId, currentUser) {
  const contest = await getById(contestId);
  const registered = currentUser
    ? Boolean(await ContestParticipant.exists({ contestId: contest._id, userId: currentUser.id }))
    : false;

  const problems = await Problem.find({ _id: { $in: contest.problemIds } });
  const problemSummaries = problems.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    tags: p.tags,
    solved: false,
    acceptanceRate: 0,
  }));

  return {
    id: contest.id,
    title: contest.title,
    description: contest.description,
    startTime: contest.startTime,
    endTime: contest.endTime,
    negativeMarking: contest.negativeMarking,
    status: contest.getStatus(),
    problems: problemSummaries,
    registered,
  };
}

async function register(contestId, user) {
  const contest = await getById(contestId);
  if (contest.getStatus() === 'ENDED') {
    throw new BadRequestException('This contest has already ended.');
  }
  const exists = await ContestParticipant.exists({ contestId: contest._id, userId: user.id });
  if (exists) return; // idempotent — already registered

  await ContestParticipant.create({ contestId: contest._id, userId: user.id });
}

async function getById(id) {
  const contest = await Contest.findById(id).catch(() => null);
  if (!contest) throw ResourceNotFoundException.of('Contest', 'id', id);
  return contest;
}

module.exports = { create, list, getDetail, register, getById };

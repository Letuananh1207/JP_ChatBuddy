import { Types } from "mongoose";
import ArenaRoom, {
  IArenaRoom,
  IParticipant,
  IQuestion,
} from "../models/arenaRoomModel";
import Vocabulary from "../models/vocabularyModel";

const FALLBACK_QUESTIONS: IQuestion[] = [
  { word: "hello", meaning: "xin chào", isFallback: true },
  { word: "goodbye", meaning: "tạm biệt", isFallback: true },
  { word: "thank you", meaning: "cảm ơn", isFallback: true },
  { word: "sorry", meaning: "xin lỗi", isFallback: true },
  { word: "yes", meaning: "vâng", isFallback: true },
  { word: "no", meaning: "không", isFallback: true },
  { word: "please", meaning: "làm ơn", isFallback: true },
  { word: "water", meaning: "nước", isFallback: true },
  { word: "food", meaning: "thức ăn", isFallback: true },
  { word: "friend", meaning: "bạn bè", isFallback: true },
  { word: "school", meaning: "trường học", isFallback: true },
  { word: "book", meaning: "sách", isFallback: true },
  { word: "happy", meaning: "vui vẻ", isFallback: true },
  { word: "sad", meaning: "buồn", isFallback: true },
  { word: "family", meaning: "gia đình", isFallback: true },
  { word: "work", meaning: "công việc", isFallback: true },
  { word: "time", meaning: "thời gian", isFallback: true },
  { word: "money", meaning: "tiền", isFallback: true },
  { word: "day", meaning: "ngày", isFallback: true },
  { word: "night", meaning: "đêm", isFallback: true },
];

const generateRoomCode = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const shuffleArray = <T>(array: T[]) => {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
};

export const createRoom = async (hostId: string) => {
  let code = generateRoomCode();
  let existing = await ArenaRoom.findOne({ code });
  while (existing) {
    code = generateRoomCode();
    existing = await ArenaRoom.findOne({ code });
  }

  const room = new ArenaRoom({
    code,
    host: new Types.ObjectId(hostId),
    participants: [
      {
        user: new Types.ObjectId(hostId),
        ready: false,
        joinedAt: new Date(),
        answers: [],
        correctCount: 0,
        totalTime: 0,
        finished: false,
      },
    ],
    status: "waiting",
  });

  return await room.save();
};

export const getRoom = async (code: string) => {
  return await ArenaRoom.findOne({ code })
    .populate("host", "username email")
    .populate("participants.user", "username email");
};

export const joinRoom = async (code: string, userId: string) => {
  const room = await ArenaRoom.findOne({ code });
  if (!room || room.status !== "waiting") return null;

  const existing = room.participants.find(
    (p: IParticipant) => String(p.user) === userId,
  );
  if (existing) return room;

  room.participants.push({
    user: new Types.ObjectId(userId),
    ready: false,
    joinedAt: new Date(),
    answers: [],
    correctCount: 0,
    totalTime: 0,
    finished: false,
  });

  return await room.save();
};

export const leaveRoom = async (code: string, userId: string) => {
  const room = await ArenaRoom.findOne({ code });
  if (!room) return null;

  room.participants = room.participants.filter(
    (participant: IParticipant) => String(participant.user) !== userId,
  );

  if (String(room.host) === userId) {
    room.host = room.participants[0]?.user || room.host;
  }

  if (room.participants.length === 0) {
    await ArenaRoom.deleteOne({ code });
    return null;
  }

  return await room.save();
};

const buildQuestionSet = async (participantIds: string[]) => {
  const participantObjectIds = participantIds.map(
    (id) => new Types.ObjectId(id),
  );
  const vocabularies = await Vocabulary.find({
    user: { $in: participantObjectIds },
  }).lean();

  const questionPool: IQuestion[] = vocabularies.map((item) => ({
    word: String(item.word),
    meaning: String(item.meaning),
    isFallback: false,
  }));

  const selected = shuffleArray(questionPool).slice(0, 10);
  if (selected.length >= 10) return selected;

  const fallback = shuffleArray(FALLBACK_QUESTIONS).slice(
    0,
    10 - selected.length,
  );
  return [...selected, ...fallback];
};

export const setParticipantReady = async (
  code: string,
  userId: string,
  ready: boolean,
) => {
  const room = await ArenaRoom.findOne({ code });
  if (!room || room.status !== "waiting") return null;

  const participant = room.participants.find(
    (p: IParticipant) => String(p.user) === userId,
  );
  if (!participant) return null;

  participant.ready = ready;
  await room.save();

  const allReady =
    room.participants.length > 0 &&
    room.participants.every((p: IParticipant) => p.ready);
  if (allReady) {
    const questions = await buildQuestionSet(
      room.participants.map((p: IParticipant) => String(p.user)),
    );
    room.questions = questions;
    room.status = "running";
    room.startedAt = new Date();
    await room.save();
  }

  return room;
};

const isParticipantFinished = (
  participant: IParticipant,
  questionCount: number,
) => {
  return participant.finished || participant.answers.length >= questionCount;
};

export const submitResult = async (
  code: string,
  userId: string,
  score: number,
  duration: number,
) => {
  const room = await ArenaRoom.findOne({ code });
  if (!room || room.status !== "running") return null;

  const participant = room.participants.find(
    (p: IParticipant) => String(p.user) === userId,
  );
  if (!participant) return null;

  participant.correctCount = score;
  participant.totalTime = duration;
  participant.finished = true;

  const allDone = room.participants.every((p: IParticipant) =>
    isParticipantFinished(p, room.questions.length),
  );

  if (allDone) {
    room.status = "finished";
  }

  await room.save();
  return room;
};

export const submitAnswer = async (
  code: string,
  userId: string,
  questionIndex: number,
  answer: string,
  duration: number,
) => {
  const room = await ArenaRoom.findOne({ code });
  if (!room || room.status !== "running") return null;

  const participant = room.participants.find(
    (p: IParticipant) => String(p.user) === userId,
  );
  if (!participant) return null;

  const question = room.questions[questionIndex];
  if (!question) return null;

  const normalizedAnswer = answer.trim().toLowerCase();
  const normalizedMeaning = question.meaning.trim().toLowerCase();
  const correct = normalizedAnswer === normalizedMeaning;

  const existingAnswerIndex = participant.answers.findIndex(
    (a: { questionIndex: number }) => a.questionIndex === questionIndex,
  );
  if (existingAnswerIndex !== -1) {
    return room;
  }

  participant.answers.push({
    questionIndex,
    answer,
    correct,
    duration,
    answeredAt: new Date(),
  });

  if (correct) participant.correctCount += 1;
  participant.totalTime += duration;

  participant.finished = isParticipantFinished(
    participant,
    room.questions.length,
  );

  const allDone = room.participants.every((p: IParticipant) =>
    isParticipantFinished(p, room.questions.length),
  );

  if (allDone) {
    room.status = "finished";
  }

  await room.save();
  return room;
};

export const getRanking = async (code: string) => {
  const room = await ArenaRoom.findOne({ code }).populate(
    "participants.user",
    "username email",
  );
  if (!room) return null;

  const ranking = [...room.participants]
    .map((participant) => ({
      user: participant.user,
      ready: participant.ready,
      correctCount: participant.correctCount,
      totalTime: participant.totalTime,
      answers: participant.answers,
    }))
    .sort((a, b) => {
      if (b.correctCount !== a.correctCount)
        return b.correctCount - a.correctCount;
      return a.totalTime - b.totalTime;
    });

  return ranking;
};

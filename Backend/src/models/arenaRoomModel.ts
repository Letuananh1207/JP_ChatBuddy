import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAnswer {
  questionIndex: number;
  answer: string;
  correct: boolean;
  duration: number;
  answeredAt: Date;
}

export interface IParticipant {
  user: Types.ObjectId | string;
  ready: boolean;
  joinedAt: Date;
  answers: IAnswer[];
  correctCount: number;
  totalTime: number;
}

export interface IQuestion {
  word: string;
  meaning: string;
  isFallback: boolean;
}

export interface IArenaRoom extends Document {
  code: string;
  host: Types.ObjectId | string;
  status: "waiting" | "running" | "finished";
  participants: IParticipant[];
  questions: IQuestion[];
  startedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema(
  {
    questionIndex: { type: Number, required: true },
    answer: { type: String, required: true },
    correct: { type: Boolean, required: true },
    duration: { type: Number, required: true },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ParticipantSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ready: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    answers: { type: [AnswerSchema], default: [] },
    correctCount: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
  },
  { _id: false },
);

const QuestionSchema: Schema = new Schema(
  {
    word: { type: String, required: true },
    meaning: { type: String, required: true },
    isFallback: { type: Boolean, default: false },
  },
  { _id: false },
);

const ArenaRoomSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["waiting", "running", "finished"],
      default: "waiting",
    },
    participants: { type: [ParticipantSchema], default: [] },
    questions: { type: [QuestionSchema], default: [] },
    startedAt: { type: Date },
  },
  { timestamps: true },
);

ArenaRoomSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.ArenaRoom ||
  mongoose.model<IArenaRoom>("ArenaRoom", ArenaRoomSchema);

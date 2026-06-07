import { Request, Response } from "express";
import * as arenaService from "../services/arenaService";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const room = await arenaService.createRoom(userId);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error creating arena room", error });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { code } = req.params;
    if (!code)
      return res.status(400).json({ message: "Room code is required" });
    const room = await arenaService.joinRoom(code, userId);
    if (!room)
      return res
        .status(404)
        .json({ message: "Room not found or already started" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error joining arena room", error });
  }
};

export const leaveRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { code } = req.params;
    if (!code)
      return res.status(400).json({ message: "Room code is required" });
    const room = await arenaService.leaveRoom(code, userId);
    if (!room)
      return res.status(200).json({ message: "Left room or room closed" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error leaving arena room", error });
  }
};

export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    if (!code)
      return res.status(400).json({ message: "Room code is required" });
    const room = await arenaService.getRoom(code);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching arena room", error });
  }
};

export const setReady = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { code } = req.params;
    if (!code)
      return res.status(400).json({ message: "Room code is required" });
    const { ready } = req.body as { ready?: boolean };
    if (typeof ready !== "boolean") {
      return res.status(400).json({ message: "ready must be a boolean" });
    }

    const room = await arenaService.setParticipantReady(code, userId, ready);
    if (!room)
      return res
        .status(404)
        .json({ message: "Room not found or game already started" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error setting ready status", error });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { code } = req.params;
    if (!code)
      return res.status(400).json({ message: "Room code is required" });
    const { questionIndex, answer, duration } = req.body as {
      questionIndex: number;
      answer: string;
      duration: number;
    };

    if (
      typeof questionIndex !== "number" ||
      typeof answer !== "string" ||
      typeof duration !== "number"
    ) {
      return res
        .status(400)
        .json({ message: "questionIndex, answer and duration are required" });
    }

    const room = await arenaService.submitAnswer(
      code,
      userId,
      questionIndex,
      answer,
      duration,
    );
    if (!room)
      return res.status(404).json({ message: "Room not found or not running" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error submitting answer", error });
  }
};

export const getRanking = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    if (!code)
      return res.status(400).json({ message: "Room code is required" });
    const ranking = await arenaService.getRanking(code);
    if (!ranking) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ranking", error });
  }
};

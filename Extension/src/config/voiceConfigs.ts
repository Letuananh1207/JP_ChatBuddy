// src/config/voiceConfigs.ts

export const VOICEVOX_SPEAKERS = {
  METAN: 2,
  ZUNDAMON: 3,
  TSUMUGI: 8, // Giọng này rất rõ, chắc chắn và ít bị hụt hơi nhất
  SAYU: 46,
};

export const VOICE_SETTINGS = {
  // Chuyển sang TSUMUGI để giọng đọc chắc khỏe hơn
  SPEAKER_ID: VOICEVOX_SPEAKERS.TSUMUGI,

  SPEED_SCALE: 1.0, // Tốc độ chuẩn
  PITCH_SCALE: 0.0, // Cao độ chuẩn
  INTONATION_SCALE: 1.0, // Ngữ điệu chuẩn
  VOLUME_SCALE: 1.2, // Tăng nhẹ âm lượng để giọng đọc rõ và áp đảo tiếng thở
};

export const VOICEVOX_BASE_URL = "http://localhost:50021";

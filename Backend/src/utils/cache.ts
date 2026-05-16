import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 60 * 5 });

export const cacheKey = (text: string) => "gcheck:" + text.trim().slice(0, 200);

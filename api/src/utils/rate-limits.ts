import rateLimit from "express-rate-limit";

export const askLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 20, // limit each IP to 100 requests per windowMs
  message: "Limit reached, please try again after a minute",
});

export const addLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 2, // limit each IP to 100 requests per windowMs
  message: "Limit reached, please try again after a minute",
});

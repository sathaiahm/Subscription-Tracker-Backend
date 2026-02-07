import arject, { shield, tokenBucket, detectBot } from '@arcjet/node';
import { ARCJECT_KEY } from './env.js'; 

const aj = arject({
  key: ARCJECT_KEY, // Use the imported ARCJECT_KEY
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";
const isProd = paddleEnv === "production" || paddleEnv === "live";

// Pick correct key based on environment
const apiKey = isProd
  ? process.env.LIVE_PADDLE_API_KEY || process.env.PADDLE_API_KEY
  : process.env.PADDLE_API_KEY;

const environment = isProd ? Environment.Production : Environment.Sandbox;

if (!apiKey && typeof window === "undefined") {
  console.warn(
    "[paddleClient] Missing PADDLE_API_KEY in environment - server calls will fail",
  );
}

const paddleInstance = new Paddle(apiKey || '', { 
  environment 
})

export { paddleInstance as paddle }
export default paddleInstance

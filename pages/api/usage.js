import { getApiUsage } from "../../lib/apiUsage";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const usage = await getApiUsage();
  return res.status(200).json(usage);
}
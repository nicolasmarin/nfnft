import { db } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';
 
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const client = await db.connect();
  
  try {
    let { 
      slug
    } = JSON.parse(request.body);
    const project = await client.sql`SELECT * FROM projects WHERE projectslug = ${slug} LIMIT 1`;
    console.log("log", `SELECT * FROM projects WHERE projectslug = ${slug}`, project);

    return response.status(200).json({ project });
  } catch (error) {
    return response.status(500).json({ error });
  }
}

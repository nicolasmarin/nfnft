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
    const project = await client.sql`SELECT * FROM projects LIMIT 1`;

    return response.status(200).json({ project: project });
  } catch (error) {
    return response.status(500).json({ error });
  }
}

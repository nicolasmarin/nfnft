import { db } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';
 
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const client = await db.connect();
 
  try {
    await client.sql`CREATE TABLE Pets ( Name varchar(255), Owner varchar(255) );`;
  } catch (error) {
    return response.status(500).json({ error });
  }
  return response.status(200).json({ ok: "CREATE TABLES COMPLETE" });
}
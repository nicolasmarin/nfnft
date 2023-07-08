import { db } from '@vercel/postgres';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
 
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const client = await db.connect();
  
  try {
    let { 
      wallet
    } = JSON.parse(request.body);

    if (!ethers.utils.isAddress(wallet)) {
      return response.status(500).json({ error: "Wallet not valid." });
    }

    const projects = await client.sql`SELECT * FROM projects WHERE wallet = ${wallet}`;
    return response.status(200).json({ projects });
  } catch (error) {
    return response.status(500).json({ error });
  }
}
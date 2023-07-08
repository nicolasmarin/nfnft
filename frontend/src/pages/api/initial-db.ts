import { db } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';
 
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const client = await db.connect();
  
  try {
    await client.sql`CREATE TABLE Projects ( 
                                         wallet varchar(255),
                                         contractAddress varchar(255),
                                         network varchar(255),
                                         projectName varchar(255),
                                         projectSlug varchar(255),
                                         projectSymbol varchar(255),
                                         projectDescription text,
                                         projectFee varchar(255),
                                         projectSize varchar(255),
                                         projectSettingPrimarySale varchar(255),
                                         projectSettingSecondarySale varchar(255),
                                         projectSettingStakingRewards varchar(255),
                                         projectSettingPenalty varchar(255),
                                         projectSettingDaysPenalty varchar(255),
                                         artworkURL varchar(255)
                                       );`;
  } catch (error) {
    return response.status(500).json({ error });
  }
  return response.status(200).json({ ok: "CREATE TABLES COMPLETE" });
}
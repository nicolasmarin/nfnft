import { db } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';
 
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const client = await db.connect();
  
  try {
    let { 
      wallet,
      contractAddress,
      projectName,
      projectSymbol,
      projectDescription,
      projectFee,
      projectSize,
      projectSettingPrimarySale,
      projectSettingSecondarySale,
      projectSettingStakingRewards,
      projectSettingPenalty,
      projectSettingDaysPenalty,
      artworkURL
    } = JSON.parse(request.body);

    const projectSlug = projectName.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    await client.sql`INSERT INTO Projects (
                                        wallet,
                                        contractAddress,
                                        projectName,
                                        projectSlug,
                                        projectSymbol,
                                        projectDescription,
                                        projectFee,
                                        projectSize,
                                        projectSettingPrimarySale,
                                        projectSettingSecondarySale,
                                        projectSettingStakingRewards,
                                        projectSettingPenalty,
                                        projectSettingDaysPenalty,
                                        artworkURL
                                      ) 
                                      VALUES 
                                      (
                                        ${wallet},
                                        ${contractAddress},
                                        ${projectName},
                                        ${projectSlug},
                                        ${projectSymbol},
                                        ${projectDescription},
                                        ${projectFee},
                                        ${projectSize},
                                        ${projectSettingPrimarySale},
                                        ${projectSettingSecondarySale},
                                        ${projectSettingStakingRewards},
                                        ${projectSettingPenalty},
                                        ${projectSettingDaysPenalty},
                                        ${artworkURL}
                                      );`;
  } catch (error) {
    return response.status(500).json({ error });
  }
  return response.status(200).json({ ok: "SAVE PROJECT" });
}
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, provider } = req.query;

  if (!id || typeof id !== 'string') {
    console.error('Unified callback: Missing or invalid connection ID in query parameters.');
    res.redirect(`/?error=connection_failed${provider ? `&provider=${provider}` : ''}`);
    return;
  }

  console.log(`Received connection ID from Unified callback for provider ${provider || 'unknown'}:`, id);

  res.redirect(`/?connectionId=${id}&provider=${provider || ''}`); // Changed id to connectionId for consistency with HomePage
}

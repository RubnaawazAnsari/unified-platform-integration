// pages/api/unified/connect-link.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;

  if (!provider || typeof provider !== 'string') {
    return res.status(400).json({ error: 'Provider is required and must be a string.' });
  }

  const unifiedWorkspaceId = process.env.UNIFIED_WORKSPACE_ID;
  const unifiedApiKey = process.env.UNIFIED_API_KEY;

  if (!unifiedWorkspaceId || !unifiedApiKey) {
    return res.status(500).json({ error: 'Server configuration error: Unified API keys not set. Check your .env.local file.' });
  }

  try {
    const response = await axios.get(
      `https://api.unified.to/unified/integration/auth/${unifiedWorkspaceId}/${provider}`,
      {
        params: {
          redirect: false,
          success_redirect: `http://localhost:3000/api/unified/callback?provider=${provider}`,
          failure_redirect: `http://localhost:3000/?error=unified_auth_failed&provider=${provider}`,
          env: 'Sandbox',
        },
        headers: {
          Authorization: `Bearer ${unifiedApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ url: response.data.url || response.data });
  } catch (error: any) {
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to connect to Unified.to API. Please check server logs and Unified.to documentation.',
      details: error.response?.data || null,
    });
  }
}

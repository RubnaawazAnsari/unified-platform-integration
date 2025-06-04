import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { connectionId } = req.query;

  if (!connectionId || typeof connectionId !== 'string') {
    return res.status(400).json({ error: 'Connection ID is required.' });
  }

  const unifiedApiKey = process.env.UNIFIED_API_KEY;

  if (!unifiedApiKey) {
    console.error('Missing environment variable: UNIFIED_API_KEY');
    return res.status(500).json({ error: 'Server configuration error: Unified API key not set.' });
  }

  try {
    console.log('Attempting to fetch QuickBooks account data for connectionId:', connectionId);
    const response = await axios.get(
      `https://api.unified.to/accounting/${connectionId}/account`,
      {
        headers: {
          Authorization: `Bearer ${unifiedApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Unified quickbooks-account error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to fetch QuickBooks account data from Unified.to.',
      details: error.response?.data || null,
    });
  }
}

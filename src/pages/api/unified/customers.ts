import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Customer } from '../../../types/unified';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Customer[] | { error: string }>
) {
  const { connectionId } = req.query;

  if (!connectionId || typeof connectionId !== 'string') {
    return res.status(400).json({ error: 'connectionId is required' });
  }

  try {
    const response = await axios.get<{ customers: Customer[] }>(
      `https://api.unified.to/v1/accounting/customers?connectionId=${connectionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UNIFIED_API_KEY}`,
        },
      }
    );

    res.status(200).json(response.data.customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

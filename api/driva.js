// api/driva.js - Proxy da API Driva para contornar CORS
export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { cnpj, token } = req.query;

    if (!cnpj || !token) {
      return res.status(400).json({ error: 'CNPJ e token são obrigatórios' });
    }

    const cnpjClean = cnpj.toString().replace(/\D/g, '');
    if (cnpjClean.length !== 14) {
      return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
    }

    const url = 'https://services.driva.io/search/v2/empresas/export/rz3/' + cnpjClean + '?base=empresas';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: 'API Error ' + response.status,
        details: errorText.substring(0, 200)
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      type: error.constructor.name
    });
  }
}

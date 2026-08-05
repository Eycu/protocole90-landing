// api/spots.js
//
// Gère le compteur "places restantes" affiché sur la landing page.
// GET  -> public, renvoie { remaining, total }
// POST -> protégé par ADMIN_SECRET, pour mettre à jour le compteur toi-même
//         à chaque vente confirmée (ou pour relancer une nouvelle cohorte).
//
// Usage POST (à faire une fois par vente confirmée) :
//   curl -X POST "https://ton-projet.vercel.app/api/spots" \
//     -H "Content-Type: application/json" \
//     -d '{"secret":"TON_ADMIN_SECRET","action":"sold"}'
//
// Relancer une nouvelle cohorte (remet le compteur à 0 vente) :
//   curl -X POST "https://ton-projet.vercel.app/api/spots" \
//     -H "Content-Type: application/json" \
//     -d '{"secret":"TON_ADMIN_SECRET","action":"reset","total":10}'

import { kv } from '@vercel/kv';

const DEFAULT_TOTAL = parseInt(process.env.TOTAL_SPOTS || '10', 10);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const sold = (await kv.get('spots:sold')) || 0;
    const total = (await kv.get('spots:total')) || DEFAULT_TOTAL;
    const remaining = Math.max(0, total - sold);
    return res.status(200).json({ remaining, total });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const { secret, action, total } = req.body || {};
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  if (action === 'sold') {
    const sold = await kv.incr('spots:sold');
    const totalSpots = (await kv.get('spots:total')) || DEFAULT_TOTAL;
    return res.status(200).json({ ok: true, remaining: Math.max(0, totalSpots - sold), total: totalSpots });
  }

  if (action === 'reset') {
    const newTotal = parseInt(total, 10) || DEFAULT_TOTAL;
    await kv.set('spots:sold', 0);
    await kv.set('spots:total', newTotal);
    return res.status(200).json({ ok: true, remaining: newTotal, total: newTotal });
  }

  return res.status(400).json({ ok: false, error: 'unknown_action' });
}

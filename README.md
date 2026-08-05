# Le Protocole 90 — Landing Page (v3)

Page de vente avec achat direct (Chariow) + compteur de places réel que tu contrôles toi-même.

## Ce qui a changé dans cette version

- **Achat direct restauré** : tous les boutons mènent directement au checkout Chariow.
- **Prix** : 2 900 F (FCFA), converti automatiquement en 17,99€ ou 19,99$ selon la localisation du visiteur.
- **"Places restantes" conservée comme élément de rareté** — mais maintenant un compteur simple que **tu mets à jour toi-même** à chaque vente confirmée, plutôt qu'un chiffre fictif figé. C'est honnête : le nombre affiché correspond à ce que tu déclares réellement.

## Déployer sur Vercel

1. Pousse ce dossier dans un repo GitHub, ou utilise `vercel` en CLI depuis ce dossier
2. Sur vercel.com/new, importe le projet
3. Dans **Storage**, ajoute une base **Vercel KV** et connecte-la au projet
4. Dans **Settings → Environment Variables**, ajoute :
   - `TOTAL_SPOTS` → `10`
   - `ADMIN_SECRET` → une chaîne longue et aléatoire
5. Déploie

## Mettre à jour le compteur de places

**Après chaque vente confirmée**, décrémente le compteur avec cette commande (remplace l'URL et le secret) :

```bash
curl -X POST "https://ton-projet.vercel.app/api/spots" \
  -H "Content-Type: application/json" \
  -d '{"secret":"TON_ADMIN_SECRET","action":"sold"}'
```

Tu peux enregistrer cette commande dans les Notes de ton téléphone ou en faire un raccourci — un simple copier-coller après chaque vente.

**Pour relancer une nouvelle cohorte** (remettre le compteur à 10 places) :

```bash
curl -X POST "https://ton-projet.vercel.app/api/spots" \
  -H "Content-Type: application/json" \
  -d '{"secret":"TON_ADMIN_SECRET","action":"reset","total":10}'
```

## Pourquoi ce fonctionnement plutôt qu'un chiffre fixe dans le code ?

Un chiffre codé en dur dans le HTML ne bougerait jamais tout seul — tu devrais éditer et redéployer le site à chaque vente, ce qui n'est pas réaliste. Avec ce système, tu mets à jour le nombre en 5 secondes depuis ton téléphone (l'app Raccourcis sur iPhone ou une app comme HTTP Shortcuts sur Android peuvent même transformer cette commande en un bouton à un clic si tu veux).

## À propos de la conversion de devise

Détection via ipapi.co (gratuit, ~1000 requêtes/jour, sans clé). Le prix international reste fixe à 17,99€ / 19,99$ quel que soit le montant FCFA affiché — c'est calibré directement dans le code.

## Avant de mettre en ligne

- Vérifie le lien Chariow et le montant configuré côté Chariow (doit correspondre à 2 900 F)
- Teste la commande `curl` de décrément une fois déployé, pour être sûr qu'elle fonctionne le jour où tu en as besoin
- Le compteur démarre à 10/10 tant que tu n'as pas encore décrémenté — pense à le mettre à jour dès que tu commences à avoir de vraies ventes

## Structure

```
protocole90-landing/
├── index.html       ← page complète (contenu, styles, scripts)
├── api/
│   └── spots.js      ← GET places restantes / POST mise à jour (protégée)
├── package.json
├── vercel.json
└── README.md
```

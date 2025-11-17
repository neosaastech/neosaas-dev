# 🔐 Configuration Auth0 + Drizzle/Neon - Guide Complet

## ✅ Ce qui a été fait

L'intégration **Auth0 + Drizzle/Neon** a été implémentée avec succès. Voici ce qui a été configuré :

### 📁 Fichiers créés

1. **`lib/db.ts`** - Connexion Neon PostgreSQL via Drizzle
2. **`lib/schema.ts`** - Schéma de la table `users`
3. **`lib/auth.ts`** - Configuration Auth0
4. **`drizzle.config.ts`** - Configuration Drizzle Kit
5. **`app/api/auth/[auth0]/route.ts`** - Routes Auth0 (login/logout)
6. **`app/api/auth/callback/route.ts`** - Callback Auth0 + création utilisateur dans Neon
7. **`.env.local`** - Variables d'environnement (à compléter)

### 🔧 Fichiers modifiés

1. **`app/auth/login/page.tsx`** - Bouton Google activé avec Auth0
2. **`app/(private)/layout.tsx`** - Protection des routes privées
3. **`package.json`** - Dépendances et scripts ajoutés

### 📦 Dépendances installées

- `@auth0/nextjs-auth0` (v4.13.0)
- `drizzle-orm` (v0.44.7)
- `@neondatabase/serverless` (v1.0.2)
- `drizzle-kit` (v0.31.7 - dev)

---

## 🚀 Étapes pour finaliser la configuration

### 1️⃣ Configurer Auth0

1. Allez sur [https://manage.auth0.com/](https://manage.auth0.com/)
2. Créez un compte ou connectez-vous
3. Créez une nouvelle **Application** :
   - Type : **Regular Web Application**
   - Nom : `NeoSaaS` (ou au choix)
4. Dans les **Settings** de l'application, notez :
   - **Domain** (ex: `dev-xxxxxxxx.us.auth0.com`)
   - **Client ID**
   - **Client Secret**
5. Configurez les **URLs autorisées** :
   - **Allowed Callback URLs** : `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs** : `http://localhost:3000/auth/login`
   - **Allowed Web Origins** : `http://localhost:3000`
6. Dans **Connections**, activez **Google** (ou autres providers)
7. Sauvegardez

### 2️⃣ Configurer Neon Database

1. Allez sur [https://console.neon.tech/](https://console.neon.tech/)
2. Créez un compte ou connectez-vous
3. Créez un nouveau **Project**
4. Récupérez la **Connection String** :
   - Format : `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - Copiez-la entièrement

### 3️⃣ Compléter le fichier `.env.local`

Ouvrez le fichier `.env.local` et remplacez les valeurs :

```bash
# Générez un secret aléatoire avec : openssl rand -hex 32
AUTH0_SECRET='COLLEZ_ICI_LE_RESULTAT_DE_OPENSSL'

# URL de base (localhost en dev) - Variable attendue par @auth0/nextjs-auth0
APP_BASE_URL='http://localhost:3000'

# Domain Auth0 (depuis le dashboard Auth0) - Variable attendue par @auth0/nextjs-auth0
# Note: Utilisez uniquement le domaine (sans https://)
AUTH0_DOMAIN='dev-xxxxxxxx.us.auth0.com'

# Client ID et Secret (depuis le dashboard Auth0)
AUTH0_CLIENT_ID='VOTRE_CLIENT_ID'
AUTH0_CLIENT_SECRET='VOTRE_CLIENT_SECRET'

# Connection String Neon (depuis le dashboard Neon)
DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

### 4️⃣ Générer le secret Auth0

Dans votre terminal, exécutez :

```bash
openssl rand -hex 32
```

Copiez le résultat et collez-le dans `AUTH0_SECRET` dans `.env.local`.

### 5️⃣ Générer et appliquer les migrations Drizzle

Une fois `.env.local` complété, créez la table `users` dans Neon :

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations (push direct vers Neon)
npm run db:push
```

**Note** : `db:push` synchronise directement le schéma sans créer de fichiers de migration (idéal pour le dev).

### 6️⃣ Tester l'authentification

1. Lancez le serveur de développement :

```bash
npm run dev
```

2. Ouvrez [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
3. Cliquez sur **"Continue with Google"**
4. Vous serez redirigé vers Auth0 pour vous connecter
5. Après connexion, vous serez **automatiquement redirigé vers `/dashboard`**
6. L'utilisateur sera **créé dans la base Neon** s'il n'existe pas

### 7️⃣ Vérifier la création de l'utilisateur

Pour visualiser la base de données Neon, vous pouvez :

- **Option 1** : Utiliser Drizzle Studio (interface visuelle) :

```bash
npm run db:studio
```

- **Option 2** : Aller sur le dashboard Neon et exécuter :

```sql
SELECT * FROM users;
```

---

## 📊 Schéma de la table `users`

| Colonne     | Type        | Contrainte      | Description                    |
|-------------|-------------|-----------------|--------------------------------|
| `id`        | `text`      | PRIMARY KEY     | UUID généré                    |
| `email`     | `text`      | NOT NULL UNIQUE | Email de l'utilisateur         |
| `name`      | `text`      | NULL            | Nom de l'utilisateur           |
| `auth0_id`  | `text`      | NOT NULL UNIQUE | ID Auth0 (claim `sub`)         |
| `created_at`| `timestamp` | NOT NULL        | Date de création (auto)        |
| `updated_at`| `timestamp` | NOT NULL        | Date de modification (auto)    |

---

## 🔄 Flux d'authentification

1. Utilisateur clique sur **"Continue with Google"** (`/auth/login`)
2. Redirection vers **Auth0** (`/api/auth/login`)
3. Connexion via Google (ou autre provider)
4. Callback vers **`/api/auth/callback`** :
   - Récupération des infos utilisateur (email, nom, auth0Id)
   - Vérification si l'utilisateur existe dans Neon
   - Si inexistant : création automatique dans la table `users`
   - Création de la session Auth0
5. Redirection vers **`/dashboard`**
6. Le layout `(private)` vérifie la session
7. Accès au dashboard autorisé

---

## 🛡️ Protection des routes

### Routes protégées

Toutes les pages dans `app/(private)/` sont **automatiquement protégées** :

- `/dashboard` → Redirige vers `/auth/login` si non connecté
- `/dashboard/payments` → Protégé
- `/dashboard/users` → Protégé
- `/dashboard/enterprise` → Protégé

### Routes publiques

- `/auth/login` → Accessible sans authentification
- `/` (homepage) → Accessible sans authentification

---

## 🧪 Tests à effectuer

- [ ] La connexion via Google depuis `/auth/login` fonctionne
- [ ] L'utilisateur est créé dans Neon lors de la première connexion
- [ ] La redirection vers `/dashboard` est immédiate après connexion
- [ ] `/dashboard` est inaccessible si non connecté (redirige vers `/auth/login`)
- [ ] La déconnexion fonctionne (via `/api/auth/logout`)
- [ ] Un utilisateur existant peut se reconnecter sans erreur

---

## 🐛 Troubleshooting

### Erreur : `AUTH0_SECRET is not defined`

➡️ Vérifiez que `.env.local` est bien complété et que le serveur a été redémarré.

### Erreur : `DATABASE_URL is not defined`

➡️ Vérifiez que la connection string Neon est correcte dans `.env.local`.

### Erreur : `Callback URL mismatch`

➡️ Vérifiez que `http://localhost:3000/api/auth/callback` est bien dans les **Allowed Callback URLs** d'Auth0.

### L'utilisateur n'est pas créé dans Neon

➡️ Vérifiez les logs du serveur (`npm run dev`). Les erreurs DB apparaissent dans la console.

### Redirection infinie entre `/auth/login` et `/dashboard`

➡️ Vérifiez que la session est bien créée (cookies Auth0). Supprimez les cookies du navigateur et reconnectez-vous.

---

## 📚 Scripts disponibles

| Commande          | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Lance le serveur de développement               |
| `npm run build`   | Build de production                              |
| `npm run db:generate` | Génère les migrations Drizzle              |
| `npm run db:push`     | Synchronise le schéma avec Neon (dev)      |
| `npm run db:migrate`  | Applique les migrations (production)       |
| `npm run db:studio`   | Ouvre Drizzle Studio (interface visuelle)  |

---

## 🎯 Prochaines étapes (optionnelles)

1. **Ajouter un bouton de déconnexion** dans le header :

```tsx
// Dans PrivateHeader
<Link href="/api/auth/logout">
  <Button>Se déconnecter</Button>
</Link>
```

2. **Afficher les infos utilisateur** dans le header :

```tsx
// Dans PrivateHeader
import { getSession } from '@auth0/nextjs-auth0'

export default async function PrivateHeader() {
  const session = await getSession()
  return (
    <header>
      <p>Bonjour, {session?.user.name}</p>
    </header>
  )
}
```

3. **Ajouter des rôles utilisateurs** :

```ts
// Modifier lib/schema.ts
export const users = pgTable('users', {
  // ... autres champs
  role: text('role').default('user').notNull(), // 'user' | 'admin'
})
```

4. **Mettre à jour `.env.exemple`** avec les nouvelles variables Auth0

---

## ✅ Checklist finale

- [ ] Auth0 configuré (Application créée, URLs définies)
- [ ] Neon Database créé (Connection string récupérée)
- [ ] `.env.local` complété avec les vraies valeurs
- [ ] Migrations appliquées (`npm run db:push`)
- [ ] Serveur lancé (`npm run dev`)
- [ ] Connexion testée avec succès
- [ ] Utilisateur visible dans la base Neon

---

**Intégration réalisée avec succès !** 🎉

Pour toute question ou problème, consultez :
- [Documentation Auth0](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Documentation Drizzle](https://orm.drizzle.team/docs/overview)
- [Documentation Neon](https://neon.tech/docs/introduction)

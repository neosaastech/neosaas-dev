# --------
# Stage 1 : Build
# --------
FROM node:20-alpine AS build
WORKDIR /app

# Installer libs nécessaires pour Next.js (ex: sharp)
RUN apk add --no-cache libc6-compat python3 make g++

# Copier les manifests et installer les dépendances (toutes, pas que prod)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copier tout le code source
COPY . .

# Builder l’application Next.js
RUN npm run build


# --------
# Stage 2 : Runtime
# --------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Port par défaut de Next.js
EXPOSE 3000

# Copier uniquement les artefacts nécessaires depuis le build
COPY --from=build /app/package*.json ./ 
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

# Utilisateur non-root pour plus de sécurité (optionnel mais conseillé)
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 \
  && chown -R nextjs:nodejs /app
USER nextjs

# Commande de démarrage
CMD ["npm", "start"]

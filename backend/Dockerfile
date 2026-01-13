FROM node:18-alpine

# Installer les dépendances système pour les outils réseau
RUN apk add --no-cache \
    openssh-client \
    net-snmp-tools \
    iputils-ping

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier pour les logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 3000

# Variables d'environnement (peuvent être surchargées)
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["node", "src/index.js"]


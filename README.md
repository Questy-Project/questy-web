<h1 align="center">Questy Web</h1>

<p align="center">Frontend de <a href="https://github.com/Questy-Project/questy-api">Questy</a>, qui transforme la progression personnelle (sport, lecture, créativité, apprentissage...) en jeu de rôle.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white" alt="Nuxt 4" />
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-mobile--first-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-proprietary-lightgrey" alt="License" />
</p>

---

## Sommaire

- [À propos](#à-propos)
- [Pages](#pages)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Production](#production)
- [Déploiement](#déploiement)
- [Ressources](#ressources)

## À propos

Questy Web est l'interface utilisateur de Questy : journal d'activités, progression RPG d'un avatar, défis quotidiens (physiques et IA), quiz de lecture IA, combats de tournoi et classements. Application 100% client (SPA), consommant l'[API Questy](https://github.com/Questy-Project/questy-api) — aucune logique métier n'est présente côté serveur Nitro (`server/`).

Démo en ligne : [questy.vercel.app](https://questy.vercel.app)

## Pages

| Route | Description |
|---|---|
| `index` | Accueil |
| `auth` | Connexion / inscription |
| `dashboard` | Tableau de bord utilisateur |
| `activities` | Journal des activités (déclaration, historique) |
| `challenges` | Défis quotidiens et quiz de lecture IA |
| `tournament` | Combats de tournoi et classement |
| `profile` | Profil, avatar (progression RPG et personnalisation) |
| `admin` | Administration *(protégée par le middleware `admin`)* |
| `cgu` / `rgpd` | Pages légales |

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com/) (TypeScript, `<script setup>`) |
| UI | [Vue 3](https://vuejs.org/) + [Tailwind CSS](https://tailwindcss.com/) (mobile-first) |
| État global | [Pinia](https://pinia.vuejs.org/) — un store par domaine métier |
| Rendu | SPA (`ssr: false`), activable au cas par cas sur les routes publiques |

## Architecture

```
app/
├── pages/          # une route par fichier (voir tableau ci-dessus)
├── components/      # composants UI réutilisables
├── layouts/          # layout par défaut
├── middleware/       # auth, admin (guards de navigation)
├── stores/            # stores Pinia (activities, auth, avatar, challenges, parts, rank, tournament)
├── composables/        # useApi (fetch générique) + composables métier
├── constants/, types/, utils/
```

`useApi` centralise les appels HTTP vers l'API ; les composables/stores métier (un par domaine, alignés sur les modules `questy-api`) s'appuient dessus plutôt que d'appeler `fetch` directement.

## Prérequis

- Node.js 20+
- L'[API Questy](https://github.com/Questy-Project/questy-api) lancée (locale ou distante)

## Installation

```powershell
git clone https://github.com/Questy-Project/questy-web.git
cd questy-web
npm install
Copy-Item .env.example .env
```

## Configuration

| Variable | Description | Défaut |
|---|---|---|
| `NUXT_PUBLIC_API_URL` | URL de base de l'API Questy, exposée côté client via `runtimeConfig.public.apiUrl` | `http://localhost:3000/api` |

## Développement

```powershell
npm run dev      # http://localhost:3001
```

## Production

```powershell
npm run build
npm run preview   # prévisualisation locale du build de production
```

## Déploiement

Déployé sur [Vercel](https://vercel.com) en tant que SPA statique (`vercel.json` réécrit toutes les routes vers `index.html`, pas de SSR). Variable d'environnement de production à configurer sur Vercel : `NUXT_PUBLIC_API_URL=https://questy-api.onrender.com/api`.

## Ressources

- [Documentation Nuxt](https://nuxt.com/docs)
- [Documentation Pinia](https://pinia.vuejs.org/)
- [API backend (questy-api)](https://github.com/Questy-Project/questy-api)

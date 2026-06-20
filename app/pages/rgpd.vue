<template>
  <div class="min-h-screen bg-[#1a1610] text-[#d0c5af] px-4 py-10">
    <div class="max-w-3xl mx-auto">

      <NuxtLink
        to="/auth"
        class="inline-flex items-center gap-2 text-sm text-questy-gold hover:text-[#e9c349] transition-colors mb-8"
      >
        ← Retour
      </NuxtLink>

      <h1 class="text-3xl font-bold text-questy-gold mb-2">Politique de confidentialité</h1>
      <p class="text-sm text-[#8a7f6e] mb-10">Dernière mise à jour : juin 2026</p>

      <section class="space-y-8 text-sm leading-relaxed">

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données est Leclercq Loïc, dans le cadre du projet
            étudiant Questy réalisé à l'EAFC Fléron Charlemagne (BES Web Developer, année 2025-2026).
          </p>
          <p class="mt-2">
            Contact :
            <a href="mailto:Loic.Leclercq@keiro.be" class="text-questy-gold underline hover:text-[#e9c349]">
              Loic.Leclercq@keiro.be
            </a>
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">2. Données collectées</h2>
          <p class="mb-2">Questy collecte uniquement les données nécessaires au fonctionnement du service :</p>
          <ul class="list-disc list-inside space-y-1 text-[#b8ad9a]">
            <li><span class="text-[#d0c5af]">Adresse email</span> — identification et connexion au compte</li>
            <li><span class="text-[#d0c5af]">Pseudo</span> — affichage dans l'application et le classement</li>
            <li><span class="text-[#d0c5af]">Âge</span> — optionnel, renseigné sur la page profil</li>
            <li><span class="text-[#d0c5af]">Mot de passe</span> — stocké sous forme hachée (bcrypt), jamais en clair</li>
            <li><span class="text-[#d0c5af]">Historique des activités déclarées</span> — nom, durée, intensité, date</li>
            <li><span class="text-[#d0c5af]">Données de progression</span> — statistiques de l'avatar, niveau, XP, stock de cœurs</li>
            <li><span class="text-[#d0c5af]">Scores de tournoi et de rang mensuel</span></li>
            <li><span class="text-[#d0c5af]">Personnalisation de l'avatar</span> — silhouette, coiffure, teinte de peau</li>
          </ul>
          <p class="mt-2">Aucune donnée de localisation, aucune photo, aucun document d'identité n'est collecté.</p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">3. Finalités du traitement</h2>
          <p class="mb-2">Les données sont traitées pour les finalités suivantes :</p>
          <ul class="list-disc list-inside space-y-1 text-[#b8ad9a]">
            <li>Gestion des comptes utilisateurs et authentification ;</li>
            <li>Calcul de la progression de l'avatar (XP, statistiques, classe de héros) ;</li>
            <li>Fonctionnement des mécaniques de jeu (défis, tournoi, rang mensuel) ;</li>
            <li>Affichage du classement hebdomadaire (pseudo uniquement).</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">4. Base légale</h2>
          <p>
            Le traitement repose sur le consentement de l'utilisateur, donné lors de la création
            du compte par l'acceptation des présentes conditions. Ce consentement peut être retiré
            à tout moment en supprimant le compte.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">5. Durée de conservation</h2>
          <p>
            Les données sont conservées pendant toute la durée d'activité du compte. En cas de
            suppression du compte, l'ensemble des données associées est définitivement supprimé
            en cascade.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">6. Partage des données</h2>
          <p class="mb-2">
            Les données ne sont pas vendues ni cédées à des tiers. Seul le pseudo est visible
            publiquement dans le classement hebdomadaire du tournoi.
          </p>
          <p>
            L'application utilise les services tiers suivants pour son fonctionnement :
          </p>
          <ul class="list-disc list-inside space-y-1 text-[#b8ad9a] mt-2">
            <li><span class="text-[#d0c5af]">Railway</span> — hébergement du backend et de la base de données PostgreSQL ;</li>
            <li><span class="text-[#d0c5af]">Vercel</span> — hébergement du frontend ;</li>
            <li><span class="text-[#d0c5af]">OpenRouter</span> — génération de contenu IA (titre et auteur du livre transmis pour le quiz, stat ciblée pour les défis).</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">7. Droits des utilisateurs</h2>
          <p class="mb-2">Conformément au RGPD, chaque utilisateur dispose des droits suivants :</p>
          <ul class="list-disc list-inside space-y-1 text-[#b8ad9a]">
            <li><span class="text-[#d0c5af]">Droit d'accès</span> — consulter les données enregistrées via la page profil ;</li>
            <li><span class="text-[#d0c5af]">Droit de rectification</span> — modifier son pseudo et son âge depuis la page profil ;</li>
            <li><span class="text-[#d0c5af]">Droit à l'effacement</span> — supprimer son compte et toutes ses données associées ;</li>
            <li><span class="text-[#d0c5af]">Droit d'opposition</span> — retirer son consentement en supprimant son compte.</li>
          </ul>
          <p class="mt-2">
            Pour exercer ces droits, contacter :
            <a href="mailto:Loic.Leclercq@keiro.be" class="text-questy-gold underline hover:text-[#e9c349]">
              Loic.Leclercq@keiro.be
            </a>
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">8. Mineurs</h2>
          <p>
            Pour les utilisateurs de moins de 15 ans, le consentement parental est requis à
            l'inscription. Aucune donnée de mineur n'est partagée publiquement — le pseudo
            n'apparaît dans aucun classement visible sans connexion.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">9. Sécurité</h2>
          <p>
            Les mots de passe sont hachés avec bcrypt (coût 10) et ne sont jamais stockés en clair.
            Les communications entre le navigateur et l'API sont chiffrées via HTTPS. Les tokens
            d'authentification sont stockés dans des cookies HTTP, non accessibles en JavaScript,
            pour se prémunir contre les attaques XSS.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">10. Modification de cette politique</h2>
          <p>
            Cette politique de confidentialité peut être mise à jour. La date de dernière
            modification est indiquée en haut de page. En continuant à utiliser Questy après
            une mise à jour, l'utilisateur accepte la nouvelle version.
          </p>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({ title: 'Confidentialité — Questy' })
</script>

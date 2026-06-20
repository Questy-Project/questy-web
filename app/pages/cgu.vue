<template>
  <div class="min-h-screen bg-[#1a1610] text-[#d0c5af] px-4 py-10">
    <div class="max-w-3xl mx-auto">

      <NuxtLink
        to="/auth"
        class="inline-flex items-center gap-2 text-sm text-questy-gold hover:text-[#e9c349] transition-colors mb-8"
      >
        ← Retour
      </NuxtLink>

      <h1 class="text-3xl font-bold text-questy-gold mb-2">Conditions Générales d'Utilisation</h1>
      <p class="text-sm text-[#8a7f6e] mb-10">Dernière mise à jour : juin 2026</p>

      <section class="space-y-8 text-sm leading-relaxed">

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">1. Objet</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de
            l'application web Questy, accessible à l'adresse <span class="text-questy-gold">https://questy.vercel.app</span>.
            En créant un compte, l'utilisateur accepte sans réserve les présentes CGU.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">2. Description du service</h2>
          <p>
            Questy est une application de gamification des activités physiques et intellectuelles.
            Elle permet aux utilisateurs de déclarer des activités du quotidien afin de faire progresser
            un avatar RPG personnalisé. Le service est accessible depuis tout navigateur web moderne,
            sans installation requise.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">3. Accès et création de compte</h2>
          <p class="mb-2">
            L'utilisation de Questy nécessite la création d'un compte avec une adresse email valide,
            un pseudo unique et un mot de passe. L'utilisateur s'engage à fournir des informations
            exactes et à maintenir la confidentialité de ses identifiants.
          </p>
          <p>
            Les utilisateurs de moins de 15 ans doivent disposer du consentement parental pour créer
            un compte. En cochant la case d'acceptation des CGU, l'utilisateur (ou son représentant
            légal) confirme remplir cette condition.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">4. Utilisation du service</h2>
          <p class="mb-2">L'utilisateur s'engage à :</p>
          <ul class="list-disc list-inside space-y-1 text-[#b8ad9a]">
            <li>Ne pas tenter de contourner les mécanismes anti-triche de l'application ;</li>
            <li>Ne pas créer plusieurs comptes pour un même utilisateur ;</li>
            <li>Ne pas utiliser le service à des fins illicites ou contraires aux bonnes mœurs ;</li>
            <li>Ne pas porter atteinte aux droits des autres utilisateurs.</li>
          </ul>
          <p class="mt-2">
            Questy se réserve le droit de suspendre ou supprimer tout compte ne respectant pas ces règles.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">5. Système de confiance</h2>
          <p>
            Les déclarations d'activités reposent sur la bonne foi de l'utilisateur. Aucune preuve
            (photo, données GPS, wearable) n'est demandée. Des plafonds techniques sont appliqués
            (180 minutes et 360 XP maximum par jour) pour limiter les abus manifestes, mais Questy
            ne peut garantir l'exactitude des données déclarées.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">6. Propriété intellectuelle</h2>
          <p class="mb-2">
            L'application Questy, son code source, son interface et ses contenus originaux sont la
            propriété de Leclercq Loïc. Toute reproduction ou exploitation sans autorisation est interdite.
          </p>
          <p>
            Les assets pixel art utilisés pour les avatars proviennent du projet open source
            Liberated Pixel Cup (LPC), distribués sous licence Creative Commons / GPL.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">7. Données personnelles</h2>
          <p>
            Le traitement des données personnelles est décrit dans la
            <NuxtLink to="/rgpd" class="text-questy-gold underline hover:text-[#e9c349]">
              Politique de confidentialité
            </NuxtLink>.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">8. Disponibilité du service</h2>
          <p>
            Questy est un projet étudiant fourni tel quel, sans garantie de disponibilité continue.
            Des interruptions de service peuvent survenir sans préavis pour des raisons de maintenance
            ou d'évolution de l'application.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">9. Modification des CGU</h2>
          <p>
            Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés
            des changements significatifs. La poursuite de l'utilisation du service après modification
            vaut acceptation des nouvelles CGU.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#e9d5a0] mb-2">10. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU :
            <a href="mailto:Loic.Leclercq@keiro.be" class="text-questy-gold underline hover:text-[#e9c349]">
              Loic.Leclercq@keiro.be
            </a>
          </p>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({ title: 'CGU — Questy' })
</script>

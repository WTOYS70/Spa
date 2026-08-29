# Le Paradis du Spa — refonte du site

Site statique complet : **HTML, CSS et JavaScript natifs**, aucune dépendance,
aucune étape de compilation. On dépose les fichiers sur l'hébergement, le site
fonctionne. Poids total : **≈ 390 Ko**, images comprises.

---

## ⚠️ À compléter avant la mise en ligne

Quatre points ne pouvaient pas être devinés depuis l'extérieur. Ils sont tous
signalés dans le code et faciles à retrouver.

### 1. Les tarifs — 51 montants

Aucun prix n'a été inventé. Chaque emplacement porte l'attribut `data-fill` :

```bash
grep -c 'data-fill' tarifs.html          # combien il en reste
grep -n  'data-fill' tarifs.html         # où ils se trouvent
```

Dans `tarifs.html`, remplacer `<span class="price-row__val" data-fill>—&nbsp;€</span>`
par `<span class="price-row__val">55&nbsp;€</span>`. **Retirer `data-fill`** en même
temps : c'est lui qui grise le montant. Vérifier aussi les durées, choisies selon
les usages du métier et non relevées sur place.

### 2. La note Google

`4,6 / 5` provient d'une source publique et **doit être revérifiée**. Elle apparaît
dans `index.html` (bandeau du héros, section avis, compteur `data-count="4.6"`).
Le nombre d'avis n'est volontairement pas affiché : il change en continu.
Le lien pointe vers une recherche Google — le remplacer par l'URL directe de la
fiche d'établissement, plus fiable.

### 3. Les réseaux sociaux

Dans le pied de page, les liens Facebook et Instagram sont génériques.
Y mettre les vraies adresses, ou supprimer le bloc `<div class="social">`.

### 4. Les mentions légales

`mentions-legales.html` contient deux paragraphes à compléter (signalés en petit
texte) : forme juridique, SIRET, TVA, directeur de la publication, et coordonnées
de l'hébergeur. C'est une obligation légale.

---

## Structure

```
index.html                 Accueil
espace-bien-etre.html      Hammam, sauna, jacuzzi, table de renforcement
soins-visage.html          Soins du visage
massages.html              Modelages et Head Spa
beaute.html                Épilation, mains, pieds, regard, bronzage
tarifs.html                Tous les tarifs, en quatre onglets
offrir.html                Bons cadeaux
contact.html               Coordonnées, horaires, plan, formulaire
mentions-legales.html      Mentions légales et confidentialité
404.html                   Page d'erreur

assets/css/style.css       Feuille de style unique (~48 Ko)
assets/js/main.js          Interactions (~16 Ko)
assets/img/                Logo, favicon, illustrations SVG, image de partage

robots.txt  sitemap.xml  site.webmanifest
```

Le site est en pages autonomes : l'en-tête et le pied de page sont recopiés dans
chaque fichier. Une modification de menu se répercute donc à la main sur les
10 pages. C'est le prix d'un site sans compilation ni base de données.

---

## Personnaliser

### Couleurs, ombres, rythme

Tout est piloté par les variables en haut de `assets/css/style.css`
(section `01. Jetons`). Changer `--c-gold` modifie l'ensemble des accents du site.
Le thème sombre ne redéfinit que des variables, jamais des règles : une couleur
ajoutée en dur casserait ce mécanisme.

### Remplacer les illustrations par de vraies photos

Les visuels actuels sont des SVG dessinés en code : 17 Ko pour l'ensemble du site,
et un affichage immédiat. Pour passer à de vraies photos, remplacer le `src` :

```html
<img src="assets/img/hammam.jpg" alt="Le hammam de l'institut, voûte carrelée"
     width="800" height="600" loading="lazy" decoding="async">
```

Conserver `width`, `height` et `alt`. Sans les dimensions, la page saute au
chargement, ce que Google mesure et sanctionne. Format WebP de préférence,
1600 px de large maximum, sous 200 Ko.

### Le formulaire de contact

Il utilise `action="mailto:"`, ce qui ouvre le logiciel de messagerie du visiteur.
Cela fonctionne partout, mais reste rustique. Pour recevoir les messages
directement, brancher un service de formulaire et remplacer l'attribut `action`
dans `contact.html`.

### Les polices

Chargées depuis Google Fonts. **En France, la CNIL considère cet appel comme un
transfert de données vers un tiers.** Pour être tranquille, télécharger les deux
polices (Cormorant Garamond et Manrope), les déposer dans `assets/fonts/`, et
remplacer le `<link>` par une déclaration `@font-face` locale. Le site reste
lisible sans elles : une pile de repli est prévue.

---

## Ce qui a été mis en place

**Performance.** Aucune bibliothèque externe. Le CSS est chargé en bloquant
(48 Ko), les polices en différé, le JavaScript en `defer`. Les images sont des SVG
inline-friendly. L'animation de vapeur s'arrête dès que le héros sort de l'écran
ou que l'onglet passe en arrière-plan.

**Référencement local.** Balisage `DaySpa` complet (adresse, horaires, équipements,
zone desservie, action de réservation), `BreadcrumbList` sur les pages internes,
`FAQPage` sur l'accueil. Titres uniques de 36 à 56 caractères, méta descriptions
de 112 à 140 caractères, un seul `h1` par page, hiérarchie de titres sans saut,
`canonical` partout, `sitemap.xml` et `robots.txt`.

**Accessibilité.** Navigation au clavier complète, onglets conformes au motif ARIA,
lien d'évitement, contrastes vérifiés sur les deux thèmes, et respect de
`prefers-reduced-motion` : toutes les animations se coupent si le système le demande.

**Vie privée.** Aucun cookie, aucun traceur, aucune mesure d'audience. La carte
Google ne se charge qu'après un clic explicite du visiteur.

**Conversion.** Bouton « Réserver » permanent, barre d'action fixe sur mobile
(appeler / réserver), pastille « ouvert / fermé » calculée en direct depuis les
horaires du HTML, et jour courant surligné dans le tableau des horaires.

---

## Vérifier après modification

Un script de contrôle est fourni dans l'historique de développement. En son
absence, ces commandes couvrent l'essentiel :

```bash
grep -c 'data-fill' tarifs.html                    # montants restants
grep -L 'canonical' *.html                         # pages sans canonical
grep -c '<h1' *.html                               # doit valoir 1 partout
```

Après mise en ligne : passer les pages dans le test des résultats enrichis de
Google et dans PageSpeed Insights, puis déclarer `sitemap.xml` dans la Search Console.

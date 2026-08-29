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

assets/css/style.css       Feuille de style — SOURCE, c'est ici qu'on modifie
assets/css/style.min.css   Version servie au visiteur — générée, ne pas éditer
assets/js/main.js          Interactions — SOURCE
assets/js/main.min.js      Version servie au visiteur — générée, ne pas éditer
assets/img/                Logo, favicon, illustrations SVG, image de partage
assets/fonts/              Polices auto-hébergées + licences SIL OFL (~71 Ko)
minify.sh                  Régénère les deux fichiers .min

robots.txt  sitemap.xml  site.webmanifest
```

Le site est en pages autonomes : l'en-tête et le pied de page sont recopiés dans
chaque fichier. Une modification de menu se répercute donc à la main sur les
10 pages. C'est le prix d'un site sans compilation ni base de données.

---

## Personnaliser

### ⚠️ Toute modification de CSS ou de JS demande une étape

Les pages chargent `style.min.css` et `main.min.js`. Modifier les fichiers
sources ne change donc **rien** tant qu'on n'a pas régénéré :

```bash
./minify.sh
```

C'est la seule commande à retenir. Elle a besoin de Node.js ; esbuild est
téléchargé à la volée, il n'y a rien à installer ni à versionner.

Si un changement de style ne s'affiche pas, la cause est presque toujours
là : le `.min` n'a pas été régénéré.

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

**Auto-hébergées dans `assets/fonts/`.** Aucun appel à Google Fonts ni à aucun
autre service : le site ne transmet donc aucune donnée de visiteur à un tiers,
ce que la CNIL attend.

| Fichier | Rôle | Poids |
|---|---|---|
| `manrope-variable.woff2` | Texte courant, graisses 200 à 800 | 24 Ko |
| `cormorant-garamond-400.woff2` | Titres | 22 Ko |
| `cormorant-garamond-400-italic.woff2` | Citations en encart | 23 Ko |

Les deux familles sont sous licence **SIL Open Font License**, qui autorise
explicitement cette redistribution. Les licences sont dans `assets/fonts/`
et doivent y rester.

Trois choix expliquent la légèreté de l'ensemble :

- **Sous-ensemble latin uniquement.** Il couvre tout le français, accents,
  ligature œ et guillemets compris. Un caractère hors plage retombe
  proprement sur la police système.
- **Manrope en fonte variable.** Un seul fichier fournit les cinq graisses
  utilisées, au lieu de cinq téléchargements.
- **Cormorant en 400 seulement.** C'est la seule graisse employée. Les deux
  `<b>` qui utilisent cette police sont forcés en 400 dans la CSS, sinon le
  navigateur fabriquerait un faux gras disgracieux sur une serif de titrage.

Les deux polices du haut de page sont préchargées (`rel="preload"`), et
`font-display: swap` affiche le texte immédiatement en police de repli.

**Si vous changez de police :** garder la pile de repli complète dans la
propriété `font-family`, et ajuster le `<link rel="preload">` de chaque page.
Ajouter une graisse suppose d'ajouter le fichier correspondant, faute de quoi
le navigateur la synthétisera.

---

## Ce qui a été mis en place

**Performance.** Aucune bibliothèque externe, aucune requête vers un domaine
tiers. CSS et JavaScript sont minifiés avec esbuild : 48,7 → 41,5 Ko pour la
feuille de style, 14,4 → 8,0 Ko pour le script, soit **45 % de moins sur le JS**.
Chemin critique du premier affichage : **≈ 125 Ko non compressés**, autour de
55 Ko une fois servis en gzip ou brotli (les `.woff2` sont déjà compressés).
Les polices sont préchargées depuis le même domaine, le JavaScript est en `defer`. Les images sont des SVG
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

**Vie privée.** Aucun cookie, aucun traceur, aucune mesure d'audience, et
aucune police servie par un tiers. La carte Google ne se charge qu'après un clic
explicite du visiteur. Les seules requêtes sortantes possibles sont les liens
que le visiteur choisit de suivre (réservation, avis, réseaux sociaux).

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
grep -rn 'fonts.googleapis\|fonts.gstatic' .       # doit ne rien renvoyer
./minify.sh                                        # après toute retouche CSS/JS
```

Après mise en ligne : passer les pages dans le test des résultats enrichis de
Google et dans PageSpeed Insights, puis déclarer `sitemap.xml` dans la Search Console.

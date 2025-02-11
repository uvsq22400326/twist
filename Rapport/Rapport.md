# Rapport Twist n°1
## Sujet
Twist est un **twitter-like** qui cherche à retrouver les fonctions principales (suivre des personnes, réagir à des posts, etc...) sans recommandation de contenu. 

## Rôles
Responsable : Ramdani Khaled
Codeurs : Lounici Ghilas & Zaidi Kahina
Chercheur : Turmel Théotime

## Recherches ? Qu'est-ce qui a été fait ?
La première semaine nous avons réfléchi à quels frameworks nous allions utiliser pour les fondements de l'app.

### Composants principaux de l'app
Nous avons choisi d'utiliser Node.js, React et Next.js comme routeur car :

1. Node.js permet (via son manager de paquet npm) d'avoir accès à de nombreux outils dont nous avons identifié le besoin.
 Par exemple les packages mysql pour stocker nos utilisateurs et zod-form-data pour valider les données de formulaire. 

2. React dispose d'une large documentation et le concept de composants permet de réutiliser des éléments entre les pages en les 
 exportant comme composants React.

3. Next.js était le routeur conseillé par défaut et est lui aussi largement documenté. Il permet de créer implicitement les routes
 vers des pages en les exportant comme composants et en les placant dans le dossier pages/.
 Il permet également d'appliquer des layouts pour avoir un style consistant pour toutes les pages.

4. Nous avons choisi d'utiliser MySQL pour stocker les utilisateurs ainsi que des signatures de leur mot de passe car le modèle
 relationnel est adapté à ce besoin est MySQL est plus légère que d'autres systèmes, les limitations de performance n'apparaissant
 que pour des bases avec beaucoup de données ce qui ne sera pas notre cas le long de ce projet.
 Néanmoins des problématiques de scaling devraient être soulevées si le projet était destiné à une utilisation plus importante.

5. MySQL est facilement intégrable dans notre application en utilisant le paquet mysql de node.

### Recherches sur le framework JavaScript
Comme dit précédemment, nous avons choisi d'utiliser Next.JS car c'est le framework proposé par défaut lors de la création d'une app avec React et il y a beaucoup de resources à son sujet ainsi qu'une vaste documentation avec des exemples.
Cependant, nous aurions pu choisir d'autres frameworks basés sur React.
En effet, par défaut, React ne supporte pas certains types d'événements (jsx-native-events), utilisés par certains frameworks CSS tels que [numl](https://numl.tenphi.me/handbook/integration/react).

D'autres frameworks tels que [GatsbyJS](https://www.gatsbyjs.com/) sont donc plus adaptés pour certains types de frameworks CSS.


### Recherches sur CSS
Pour les recherches sur les différents frameworks CSS, j'ai utilisé ce site:
[Frameworks CSS](https://github.com/awesome-css-group/awesome-css?tab=readme-ov-file#frameworks-art). 

Comme vu dans la partie juste au-dessus, l'intégration de certains frameworks CSS peut demander beaucoup plus d'efforts sous React que dans une page HTML simple. C'est donc un critère à considérer lors du choix d'un framework.

Par exemple, le framework [numl](https://numl.tenphi.me) que j'évoquais tout à l'heure me semblait tout à fait convenir compte tenu de don côté lightweight et 0 dépendances, excepté un lien vers le CDN contenant le framework. Cependant, les workarounds nécessaires pour le faire fonctionner sous React me semblent trop contraignants car ils nécessitent l'ajout de nouvelles dépendences ainsi qu'un alourdissement du code pour contourner certains comportements par défaut de React. Plus d'info sur ce sujet ici: [numl](https://numl.tenphi.me/handbook/integration/react).

Le CSS n'étant pas notre priorité numéro 1 pour le moment, je ne me suis pas décidé pour le moment sur quels frameworks utiliser même si j'opterai quand même pour un autre framework lightweight mais plus simple à utliser avec React.

Le framework [AgnosticUI](https://www.agnosticui.com/docs/setup.html#react), par exemple, nécessite seulement 3 dépendences installables via NPM et ne nécessite pas du code spécial pour contourner le comportement de React.

Un autre problème qui se pose est la compatibilité avec les différents navigateurs. AgnosticUI n'est pas supporté par IE11 (2013) à cause de certaines directives de style. Pour notre application, je ne considère pas cela comme un problème car peu de gens utilisent un navigateur datant d'il y a 12 ans. Néanmoins, si notre applcation devait s'étendre au plus grand nombre, il faudrait utiliser un style fall-back pour les navigateurs qui ne supportent pas le style par défaut.

### Recherches pour hosting

Je n'ai pas encore trop regardé la partie hébergement de l'application. Je me suis un peu renseigné et j'ai comparé rapidement 3 hébergeurs potentiels.

Le premier, Vercel, est l'hébergeur "par défaut" en utilisant NextJS, car c'est celui qui est proposé sur la page d'accueil de l'app, généré par NextJS. Un boutton "Deploy Now" nous redirige vers le site de [Vercel](https://vercel.com).
Je ne pense pas utiliser cet hébergeur car il m'a semblé forcer à utiliser son propre système de bases de données dont les caractéristiques ne semblent pas convenir à notre application.

Le second est [netlify](www.netlify.com), un autre hébergeur qui semble assez simple d'utilisation pour déployer l'application mais qui là aussi semble limiter les choix de systèmes de BDD à des itérations ne semblant pas nous satisfaire.

Pour l'instant je suis plutôt parti sur [Render](render.com) car cela me paraît simple d'utilisation et semble pouvoir héberger l'application web ainsi que la base de données. Les limites de performances pour le plan gratuit sont de 512Mb ce qui ne devrait pas être un problème pour notre type d'application.

### Recherches pour Bases de Données
Pour l'instant nous sommes parti sur un modèle BDD Relationnel en utilisant MySQL. J'ai hésité sur ce point-là car pour notre type d'application, une base de données graphe me paraissait plus appropriée. En effet, les relations "abonné / follower" entre 2 utilisateurs se traduisent intuitivement en modèle graphe. Malheureusement, il n'a pas tellement de systèmes orientés graphe que j'ai pu trouver, excepté les plus connus tels que Neo4J ou un dex nombreux produits Oracle.

## Code, qu'est-ce qui a été fait ?

## Références / sites

[AgnosticUI](https://www.agnosticui.com)

[Documentation React - Reference](https://react.dev/reference/react) 

[Documentation React - Tutoriels](https://react.dev/learn)

[Documentation Next.js](https://nextjs.org/docs)

[Documentation node - MySQL](https://www.npmjs.com/package/mysql)

[Documentation node - zod-form-data](https://www.npmjs.com/package/zod-form-data)

[Frameworks CSS](https://github.com/awesome-css-group/awesome-css?tab=readme-ov-file#frameworks-art)

[GatsbyJS](https://www.gatsbyjs.com/)

[Vercel](https://vercel.com)

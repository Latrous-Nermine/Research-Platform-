# Research Platform — Plateforme de Recherche Scientifique

Application web full-stack permettant la gestion de publications scientifiques, développée dans le cadre du TP de **Web Avancé** (ING 2 — Semestre 2).

---

## Architecture du Projet

```
project/
├── research-platform-backend/    # API REST (Spring Boot)
└── research-platform-frontend/   # Interface web (React.js)
```

---

## Technologies Utilisées

### Backend
| Technologie | Rôle |
|---|---|
| **Spring Boot** | Framework principal |
| **Spring Security** | Authentification & autorisation (JWT + BCrypt) |
| **Spring Data JPA / Hibernate** | ORM & accès base de données |
| **MySQL** | Base de données relationnelle |
| **Swagger / OpenAPI** | Documentation de l'API |
| **Lombok** | Réduction du code boilerplate |

### Frontend
| Technologie | Rôle |
|---|---|
| **React 19** | Framework UI |
| **React Router 7** | Navigation & routage |
| **Axios** | Requêtes HTTP vers l'API |
| **Bootstrap 5 / React-Bootstrap** | Mise en page & composants UI |
| **Formik + Yup** | Gestion & validation des formulaires |
| **pdfjs-dist** | Affichage de fichiers PDF |
| **Moment.js** | Formatage des dates |

---

## Modèle de Données

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│ Publication  │──N:1──│  Domain  │
└──────────┘       └──────────────┘       └──────────┘
                          │
                         1:N
                          │
                    ┌──────────┐
                    │ Comment  │
                    └──────────┘
```

### Entités

| Entité | Champs principaux |
|---|---|
| **User** | `id`, `username`, `email`, `password`, `role`, `image` |
| **Publication** | `id`, `title`, `description`, `pdfContent`, `status`, `premium`, `researcher`, `domain` |
| **Domain** | `id`, `name` |
| **Comment** | `id`, `user`, `publication`, `content`, `createdAt` |

### Rôles Utilisateur

| Rôle | Permissions |
|---|---|
| `ADMIN` | Gestion complète (utilisateurs, domaines, publications) |
| `MODERATEUR` | Modération des publications, gestion des domaines |
| `RESEARCHER` | Publication d'articles scientifiques |
| `USER` | Consultation des publications, ajout de commentaires |

### Statuts de Publication

| Statut | Description |
|---|---|
| `PENDING` | En attente de validation |
| `APPROVED` | Approuvée et visible publiquement |
| `REJECTED` | Rejetée par un modérateur |

---

## Pages de l'Application

| Route | Accès | Description |
|---|---|---|
| `/` | Public | Fil d'actualité des publications |
| `/login` | Public | Page de connexion |
| `/publications` | Public | Liste des publications |
| `/publications/:id` | Public | Détail d'une publication (PDF + commentaires) |
| `/dashboard` | Authentifié | Tableau de bord |
| `/profile` | Authentifié | Profil utilisateur |
| `/domains` | ADMIN, MODERATEUR | Gestion des domaines de recherche |
| `/users` | ADMIN | Gestion des utilisateurs |

---

## Prérequis

- **Java 17+**
- **Maven**
- **Node.js 18+** & **npm**
- **MySQL 8+**

---

## Installation & Lancement

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd project
```

### 2. Base de données

La base `webDB` est créée automatiquement au démarrage du backend. Assurez-vous que MySQL tourne sur le port **3306** avec les identifiants :

```
username: root
password: root
```

> Modifiable dans `research-platform-backend/src/main/resources/application.properties`

### 3. Backend (port 8081)

```bash
cd research-platform-backend

# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

L'API sera disponible sur : `http://localhost:8081`  
Swagger UI : `http://localhost:8081/swagger-ui/index.html`

### 4. Frontend (port 3000)

Ouvrir un **nouveau terminal**, puis :

```bash
cd research-platform-frontend
npm install
npm start
```

L'application sera disponible sur : `http://localhost:3000`

> Le frontend utilise un proxy vers `http://localhost:8081` pour les appels API.

### Ordre de démarrage recommandé

```
1. MySQL        → s'assurer que le service est actif
2. Backend      → cd research-platform-backend && mvnw spring-boot:run
3. Frontend     → cd research-platform-frontend && npm install && npm start
```

---

## Endpoints API Principaux

| Ressource | Base URL |
|---|---|
| Authentification | `/auth/**` |
| Utilisateurs | `/users/**` |
| Publications | `/publications/**` |
| Domaines | `/domains/**` |
| Commentaires | `/comments/**` |

Consultez **Swagger UI** pour la documentation complète des endpoints.

---

## Workflow Fonctionnel

1. Un **chercheur** se connecte et soumet une publication (titre, description, PDF) dans un domaine
2. La publication a le statut `PENDING` par défaut
3. Un **modérateur** approuve (`APPROVED`) ou rejette (`REJECTED`) la publication
4. Les publications approuvées sont visibles sur le fil d'actualité
5. Les **utilisateurs** peuvent consulter les publications et laisser des **commentaires**
6. L'**administrateur** gère les utilisateurs et les domaines de recherche

---

## Lancement avec Docker

Cette configuration permet de lancer toute la plateforme (MySQL + backend + frontend) avec une seule commande.

### Services Docker

- **db** : MySQL 8 (port hote `3306`)
- **backend** : Spring Boot (port hote `8081`)
- **frontend** : React build + Nginx (port hote `3000`)

### Commandes

Depuis la racine du projet :

```bash
docker compose up --build
```

L'application sera accessible sur : `http://localhost:3000`

Le backend sera accessible sur : `http://localhost:8081`

Arreter les conteneurs :

```bash
docker compose down
```

Arreter et supprimer aussi le volume de donnees MySQL :

```bash
docker compose down -v
```

### Fichiers Docker ajoutes

- `docker-compose.yml`
- `research-platform-backend/Dockerfile`
- `research-platform-backend/.dockerignore`
- `research-platform-frontend/Dockerfile`
- `research-platform-frontend/nginx.conf`
- `research-platform-frontend/.dockerignore`

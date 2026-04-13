# Documentation Backend Spring Boot

Ce document explique la structure du backend et le role de chaque fichier principal.

## Vue d'ensemble

Le backend suit une architecture en couches classique:

- `controller`: expose les endpoints REST
- `service`: porte la logique metier
- `repository`: acces base de donnees (Spring Data JPA)
- `entity`: modeles persistants (tables SQL)
- `config`: securite, JWT, filtres et CORS

## Arborescence utile

```text
research-platform-backend/
|- pom.xml
|- mvnw
|- mvnw.cmd
|- src/
|  |- main/
|  |  |- java/com/example/webbackend/
|  |  |  |- WebbackendApplication.java
|  |  |  |- config/
|  |  |  |- controller/
|  |  |  |- entity/
|  |  |  |- enumerates/
|  |  |  |- repository/
|  |  |  |- service/
|  |  |- resources/
|  |     |- application.properties
|  |- test/java/com/example/webbackend/
|     |- WebbackendApplicationTests.java
|- target/ (genere automatiquement par Maven)
```

## Fichiers racine

| Fichier | Role |
|---|---|
| `pom.xml` | Configuration Maven: dependances Spring Boot, JPA, Security, JWT, MySQL, Swagger; plugins de build. |
| `mvnw` / `mvnw.cmd` | Maven Wrapper pour lancer le projet sans installer Maven globalement. |
| `.gitignore` | Exclut les fichiers generes et locaux du versionning. |
| `.gitattributes` | Regles Git (normalisation, attributs de fichiers). |

## Configuration applicative

| Fichier | Role |
|---|---|
| `src/main/resources/application.properties` | Configuration runtime: connexion MySQL, JPA (`ddl-auto=update`), port serveur (`8081`), Swagger, limites upload PDF. |

## Point d'entree et tests

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/WebbackendApplication.java` | Classe principale Spring Boot (`main`) qui demarre le contexte applicatif. |
| `src/test/java/com/example/webbackend/WebbackendApplicationTests.java` | Test de base `contextLoads` pour verifier que le contexte Spring demarre. |

## Package config

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/config/SecurityConfig.java` | Configure Spring Security: routes publiques/privees, mode stateless, CORS, encoder BCrypt, `AuthenticationManager`. |
| `src/main/java/com/example/webbackend/config/JwtService.java` | Genere et lit les JWT (claims: id, username, email, role), verifie expiration/validite. |
| `src/main/java/com/example/webbackend/config/JwtAuthenticationFilter.java` | Filtre HTTP qui lit `Authorization: Bearer ...`, valide le token, puis injecte l'utilisateur dans le contexte de securite. |

## Package controller

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/controller/AuthController.java` | Endpoint d'authentification (`POST /auth/login`): verifie credentials et retourne JWT + infos utilisateur. |
| `src/main/java/com/example/webbackend/controller/UserController.java` | CRUD utilisateurs (`/users`), creation avec image optionnelle et role, recherche par role. |
| `src/main/java/com/example/webbackend/controller/PublicationController.java` | CRUD publications (`/publications`), upload PDF, mise a jour statut/premium. |
| `src/main/java/com/example/webbackend/controller/DomainController.java` | CRUD domaines de recherche (`/domains`). |
| `src/main/java/com/example/webbackend/controller/CommentController.java` | CRUD commentaires (`/comments`) et recuperation des commentaires par publication. |

## Package service

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/service/AuthenticationService.java` | Logique d'authentification: validation email/mot de passe avec `PasswordEncoder`. |
| `src/main/java/com/example/webbackend/service/UserService.java` | Logique metier utilisateurs: inscription (hash password), lecture, MAJ, suppression, filtre par role. |
| `src/main/java/com/example/webbackend/service/PublicationService.java` | Logique metier publications: creation, MAJ statut/premium, filtre domaine, suppression. |
| `src/main/java/com/example/webbackend/service/DomainService.java` | Logique metier domaines: CRUD domaine. |
| `src/main/java/com/example/webbackend/service/CommentService.java` | Logique metier commentaires: creation, lecture par publication, MAJ, suppression. |

## Package repository

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/repository/UserRepository.java` | Requetes utilisateurs: par email, username, role (plus requete custom email). |
| `src/main/java/com/example/webbackend/repository/PublicationRepository.java` | Requetes publications: par statut, domaine, chercheur. |
| `src/main/java/com/example/webbackend/repository/DomainRepository.java` | Requetes domaines: par nom. |
| `src/main/java/com/example/webbackend/repository/CommentRepository.java` | Requetes commentaires: par publication, par utilisateur. |

## Package entity

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/entity/User.java` | Entite `users`: username, email, password, role, image. |
| `src/main/java/com/example/webbackend/entity/Publication.java` | Entite `publications`: titre, description, PDF, statut, premium, relation vers user/domain, date creation. |
| `src/main/java/com/example/webbackend/entity/Domain.java` | Entite `domains`: nom de domaine de recherche. |
| `src/main/java/com/example/webbackend/entity/Comment.java` | Entite `comments`: contenu, date, relation vers user/publication. |

## Package enumerates

| Fichier | Role |
|---|---|
| `src/main/java/com/example/webbackend/enumerates/Role.java` | Enum des roles utilisateurs (`ADMIN`, `MODERATEUR`, `USER`, `RESEARCHER`). |
| `src/main/java/com/example/webbackend/enumerates/PublicationStatus.java` | Enum des statuts publication (`PENDING`, `APPROVED`, `REJECTED`). |

## Dossiers generes

| Dossier | Role |
|---|---|
| `target/` | Fichiers compiles, classes bytecode, metadonnees Maven et artefacts de build. |
| `.idea/` | Configuration locale IntelliJ/IDE, non necessaire au runtime. |

## Flux simplifie d'une requete

1. Requete HTTP arrive dans un `controller`.
2. Le `controller` delegue au `service`.
3. Le `service` lit/ecrit via `repository`.
4. Le `repository` manipule les `entity` en base MySQL.
5. Si endpoint protege: `JwtAuthenticationFilter` valide le token avant l'acces.

## Notes techniques utiles

- Port par defaut: `8081`
- Base de donnees: `webDB` (auto-creation active via URL JDBC)
- Swagger UI: `http://localhost:8081/index.html`
- Authentification: JWT stateless + mots de passe BCrypt

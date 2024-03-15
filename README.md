project-root/
│
├── src/
│   ├── common/
│   │   ├── ...
│   │
│   ├── features/
│   │   ├── users/                       # Feature 'Users'
│   │   │   ├── domain/                  # Capa de dominio de 'Users'
│   │   │   │   ├── entities/            # Entidades de negocio de 'Users'
│   │   │   │   │   └── user.entity.ts
│   │   │   │   └── repositories/        # Interfaces de repositorio de 'Users'
│   │   │   │       └── user.repository.ts
│   │   │   │
│   │   │   ├── infrastructure/          # Capa de infraestructura de 'Users'
│   │   │   │   ├── datasources/         # Fuentes de datos de 'Users'
│   │   │   │   │   ├── mongodb/         # Esquemas y data sources para MongoDB
│   │   │   │   │   │   ├── user.schema.ts
│   │   │   │   │   │   └── user.datasource.ts
│   │   │   │   │   ├── postgresql/      # Esquemas y data sources para PostgreSQL
│   │   │   │   │   │   ├── user.schema.ts
│   │   │   │   │   │   └── user.datasource.ts
│   │   │   │   │   └── sqlite/          # Esquemas y data sources para SQLite
│   │   │   │   │       ├── user.schema.ts
│   │   │   │   │       └── user.datasource.ts
│   │   │   │   ├── repositories/        # Implementaciones de repositorios de 'Users'
│   │   │   │   │   └── user.repository.impl.ts
│   │   │   │   └── infrastructure.module.ts # Módulo de infraestructura de 'Users'
│   │   │   │
│   │   │   ├── application/             # Capa de aplicación de 'Users'
│   │   │   │   ├── services/            # Servicios de 'Users'
│   │   │   │   │   └── user.service.ts
│   │   │   │   └── application.module.ts # Módulo de aplicación de 'Users'
│   │   │   │
│   │   │   └── presentation/            # Capa de presentación de 'Users'
│   │   │       ├── controllers/         # Controladores de 'Users'
│   │   │       │   └── user.controller.ts
│   │   │       ├── dtos/                # DTOs de 'Users'
│   │   │       │   └── user.dto.ts
│   │   │       └── presentation.module.ts # Módulo de presentación de 'Users'
│   │   │
│   │   └── ...
│   │
│   └── app.module.ts                    # Módulo raíz de la aplicación
│
└── ...

---
description: Generate professional, architecture-focused README.md
  documentation for backend, distributed systems, AI/RAG, or fullstack
  projects. Use when Claude needs to create structured, technical,
  GitHub-ready documentation with architectural explanations, diagrams
  (Mermaid), technology breakdown, execution steps, and roadmap
  sections.
name: markdown-architecture-documenter
---

# Markdown Architecture Documenter

This skill generates high-quality, architecture-driven Markdown
documentation suitable for professional GitHub repositories.

It is optimized for backend systems, distributed architectures, AI/RAG
platforms, event-driven systems, and fullstack applications that require
technical depth and structural clarity.

---

## Core Philosophy

This skill produces documentation that:

- Explains **why architectural decisions were made**
- Demonstrates **system design maturity**
- Maintains **professional tone and clarity**
- Uses **structured Markdown hierarchy**
- Includes **diagrams when architecture is relevant**
- Avoids superficial or marketing-style writing

Default assumption: Claude already knows Markdown syntax. Focus on
structure, clarity, and architectural reasoning --- not Markdown basics.

---

## Required Document Structure

# {Project Name} ({Primary Stack})

## 📌 Project Description

Explain:

- The problem being solved
- The system's purpose
- Architectural positioning
- Whether the system is local, cloud, hybrid
- If AI is used, describe the strategy (RAG, embeddings, inference
    flow)

---

## 🏗 Solution Architecture

Describe:

- Architectural style (Event-Driven, Clean Architecture,
    Microservices, Modular Monolith, etc.)
- Responsibility separation
- Service boundaries
- Scalability strategy
- Data ownership model

### Core Components

Organize clearly:

- APIs
- Workers / Background Services
- Database
- Messaging infrastructure
- AI services
- External integrations

---

## 🔄 System Workflow

Provide a numbered pipeline explaining:

1. User interaction
2. Internal processing
3. Persistence
4. Indexing (if applicable)
5. Retrieval
6. Response generation

---

## 🚀 Technologies Used

Organize by category:

- **Primary Language**
- **Framework**
- **Database**
- **ORM / Data Access**
- **Messaging**
- **AI / LLM**
- **Infrastructure**
- **DevOps / Tooling**

---

## 🧠 AI / Semantic Search (Conditional Section)

Include only if relevant.

Explain:

- Embedding generation
- Vector storage
- Similarity search strategy
- Context assembly
- Retrieval-Augmented Generation (RAG) flow
- Model interaction logic

---

## 🏗 Architecture Diagrams

### General Architecture

``` mermaid
flowchart LR
    User --> API
    API --> Database
```

### Sequence Diagram

``` mermaid
sequenceDiagram
    participant U as User
    participant A as API
    U ->> A: Request
```

### Data Model (ER Diagram)

``` mermaid
erDiagram
    ENTITY ||--o{ CHILD : has
```

---

## 🛠 How to Run the Project

### Prerequisites

List required:

- SDK versions
- Docker (if needed)
- Database requirements
- AI runtime (if needed)

### Step-by-Step Execution

``` bash
git clone ...
docker-compose up -d
dotnet run ...
```

---

## 📈 Project Status

### ✅ Current Features

- [x] Implemented feature
- [x] Stable pipeline
- [x] Messaging integration

### 🚀 Roadmap

- [ ] Feature
- [ ] Improvement
- [ ] Scalability upgrade

---

## Writing Rules

- Use imperative and declarative clarity
- Avoid fluff
- Avoid repeating obvious information
- Explain architecture decisions when relevant
- Use consistent heading spacing
- Use horizontal separators strategically
- Keep professional tone

---

End of skill.

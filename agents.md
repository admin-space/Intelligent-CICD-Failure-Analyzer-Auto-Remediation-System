# Multi-Agent Architecture: CloudWise AI

CloudWise AI utilizes a multi-agent cooperative architecture to automate cost tracking, analyze waste, explain saving opportunities, orchestrate auto-healing remediations, and alert stakeholders. Each agent has specific responsibilities, dependencies, and boundaries.

---

## Agent Taxonomy & Responsibilities

```
                      +-----------------------------+
                      |    Coordinator Agent        |
                      +--------------+--------------+
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
+--------+--------+         +--------+--------+         +--------+--------+
| Cost Collector  |         | Waste Detection |         |   AI RAG/Chat   |
|     Agent       |         |     Agent       |         |     Agent       |
+--------+--------+         +--------+--------+         +-----------------+
         |                           |
         |                           v
         |                  +--------+--------+
         +----------------->|  Auto-Healing   |
                            |  Orchestrator   |
                            +-----------------+
```

### 1. Cost Collector Agent
* **Role**: Ingest and format cloud billing metrics and resource configurations.
* **Responsibilities**:
  * Scrape EC2, VM, RDS, EBS, Blob, and Network endpoints from AWS, Azure, and GCP.
  * Gracefully fall back to generating high-fidelity mock metrics (daily spending trends, regional distributions) when credentials are not supplied.
  * Standardize multi-cloud schemas into the core PostgreSQL database.
* **Key Files**: `backend/app/collectors/`, `backend/app/services/mock_data.py`.

### 2. Waste Detection & Optimization Agent
* **Role**: Continuous analysis of resource profiles to identify cost leaks.
* **Responsibilities**:
  * Inspect resource utilization records (e.g. CPU < 5%, disk unattached, static IP unused).
  * Compute projected monthly/annual savings for each optimization opportunity.
  * Trigger recommendations and submit them to the AI explainer agent.
* **Key Files**: `backend/app/services/optimization_engine.py`, `backend/app/routers/optimizations.py`.

### 3. AI RAG & Chat Copilot Agent
* **Role**: Provide conversational support and natural language explanations.
* **Responsibilities**:
  * Build Retrieval-Augmented Generation (RAG) context using local sqlite-vector similarity or ChromaDB.
  * Generate detailed, human-readable explanations, potential risks, and confidence scores for optimization items.
  * Power the sliding interactive FinOps Copilot UI, answering queries like "Where is my cloud waste?" or "Write an optimization summary".
* **Key Files**: `backend/app/services/ai_service.py`, `backend/app/services/rag_service.py`, `backend/app/routers/chat.py`.

### 4. Auto-Healing Orchestrator Agent
* **Role**: Execute safe infrastructure remediations.
* **Responsibilities**:
  * Handle action approvals (e.g., "Terminating idle instance", "Resizing oversized database").
  * Send API requests to cloud platforms or trigger Terraform scripts/Kubernetes scaling policies.
  * Log execution statuses (Success, Failed, In Progress) and ensure rollbacks on errors.
  * Track health post-action using Prometheus monitoring metrics.
* **Key Files**: `backend/app/services/optimization_engine.py`, `backend/app/models.py`.

### 5. SRE Alerter & Executive Reporter Agent
* **Role**: Document cost updates and alert team members.
* **Responsibilities**:
  * Compile executive summaries, graphs, and cost savings tables into formal PDFs using ReportLab.
  * Export details to CSV/Excel for standard analysis.
  * Monitor budget thresholds and dispatch webhook alerts to Slack, MS Teams, or Email logs.
* **Key Files**: `backend/app/services/report_generator.py`, `backend/app/services/alert_service.py`, `backend/app/routers/reports.py`.

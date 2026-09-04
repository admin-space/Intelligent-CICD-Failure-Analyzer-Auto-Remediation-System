# CloudWise AI - AI Copilot & Natural Language Explainer Service
from sqlalchemy.orm import Session
from typing import Dict, List, Any
import logging

from app.models import CloudResource, Recommendation, CostMetric
from app.config import settings

logger = logging.getLogger("cloudwise-ai-service")

class AIService:
    def answer_finops_query(self, query: str, db: Session) -> Dict[str, Any]:
        """Generate conversational FinOps Copilot response grounded in live AWS infrastructure context."""
        query_lower = query.lower()
        
        # 1. Fetch live context from database
        resources = db.query(CloudResource).all()
        active_recs = db.query(Recommendation).filter(Recommendation.status == "active").all()
        remediated_recs = db.query(Recommendation).filter(Recommendation.status == "remediated").all()
        
        total_savings = sum(r.estimated_savings for r in active_recs)
        total_remediated_savings = sum(r.estimated_savings for r in remediated_recs)
        
        sources = []
        for r in active_recs[:4]:
            sources.append({
                "type": r.service_type,
                "resource_id": r.resource_id,
                "savings": f"${r.estimated_savings:.2f}/mo",
                "action": r.action_type
            })

        # 2. Check OpenAI API if configured
        if settings.OPENAI_API_KEY and settings.AI_PROVIDER == "openai":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                
                context_str = f"Total Active Resources: {len(resources)}\n"
                context_str += f"Pending Optimization Savings: ${total_savings:.2f}/month\n"
                context_str += f"Active Recommendations:\n"
                for r in active_recs[:5]:
                    context_str += f"- {r.service_type} ({r.resource_id}): {r.current_state} -> Recommended: {r.recommended_state}. Savings: ${r.estimated_savings:.2f}/mo\n"
                
                prompt = f"""You are CloudWise AI, an expert enterprise FinOps and AWS Cloud Architect Copilot.
Answer the user's question accurately using the live AWS infrastructure context provided below. Be concise, actionable, and reference specific resource IDs and dollar values where helpful.

Context:
{context_str}

User Question: {query}"""
                
                res = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
                answer_text = res.choices[0].message.content
                return {"response": answer_text, "sources": sources}
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}. Falling back to internal FinOps reasoning engine.")

        # 3. High-Fidelity Intelligent FinOps Reasoning Engine
        if any(w in query_lower for w in ["waste", "saving", "reduce", "cut", "opportunity", "opportunities"]):
            if not active_recs:
                answer = "🎉 **Great news!** No active cloud waste was detected across your AWS environment. Your instances and storage volumes are currently well-utilized."
            else:
                answer = f"### 💡 Cloud Waste & Savings Summary\n\n"
                answer += f"We identified **{len(active_recs)} active optimization opportunities** with a total projected monthly saving of **${total_savings:.2f}/month** (approx. **${total_savings * 12:.2f}/year**):\n\n"
                for i, r in enumerate(active_recs[:5], 1):
                    answer += f"{i}. **{r.service_type} ({r.resource_id})**: {r.recommended_state}. Potential savings: **${r.estimated_savings:.2f}/mo** (Risk: `{r.risk_assessment.upper()}`).\n"
                answer += f"\n👉 You can click **'Remediate Now'** in the **Cost Optimizer** tab to trigger automated safe remediation."

        elif any(w in query_lower for w in ["ec2", "instance", "compute", "cpu", "idle"]):
            ec2_recs = [r for r in active_recs if r.service_type == "EC2"]
            ec2_res = [r for r in resources if r.type == "ec2"]
            answer = f"### 🖥️ EC2 Compute Health Overview\n\n"
            answer += f"- **Total EC2 Nodes Monitored**: {len(ec2_res)}\n"
            if ec2_recs:
                answer += f"- **Idle/Underutilized Instances**: {len(ec2_recs)}\n\n"
                for r in ec2_recs:
                    answer += f"- **{r.resource_name or r.resource_id}**: {r.current_state}. Recommendation: {r.recommended_state} (Savings: **${r.estimated_savings:.2f}/mo**).\n"
            else:
                answer += "- All running EC2 instances are actively serving workloads (>5% average CPU)."

        elif any(w in query_lower for w in ["ebs", "volume", "disk", "storage", "snapshot"]):
            ebs_recs = [r for r in active_recs if r.service_type == "EBS"]
            answer = f"### 💾 EBS Storage Analysis\n\n"
            if ebs_recs:
                answer += f"Found **{len(ebs_recs)} unattached (orphaned) EBS volumes** accumulating storage fees:\n\n"
                for r in ebs_recs:
                    answer += f"- **{r.resource_id}**: {r.current_state} (Recoverable: **${r.estimated_savings:.2f}/mo**).\n"
                answer += "\n🛡️ *CloudWise Auto-Healing will capture a safety snapshot before purging these disks to prevent any accidental data loss.*"
            else:
                answer = "All EBS volumes are actively attached to running EC2 instances."

        elif any(w in query_lower for w in ["remediate", "auto-heal", "heal", "fix", "action"]):
            answer = f"### ⚡ Auto-Healing Capabilities\n\n"
            answer += f"CloudWise AI supports safe 1-click infrastructure remediations directly against your AWS account:\n"
            answer += f"1. **EC2 Idle Stop/Terminate**: Stops compute nodes with <5% CPU utilization.\n"
            answer += f"2. **Orphaned EBS Purge**: Creates a point-in-time snapshot backup, then purges detached volumes.\n"
            answer += f"3. **Elastic IP Release**: Unbinds and releases idle IPv4 addresses.\n"
            answer += f"4. **RDS Scheduled Pause**: Scales down or stops dev/test databases during off-peak hours.\n\n"
            answer += f"Status: **${total_remediated_savings:.2f}/mo** already saved through completed remediations."

        else:
            answer = f"### 🤖 CloudWise AI FinOps Assistant\n\n"
            answer += f"I am continuously monitoring your AWS cloud infrastructure in region `{settings.AWS_DEFAULT_REGION}`.\n\n"
            answer += f"- **Active Resources Monitored**: {len(resources)}\n"
            answer += f"- **Actionable Recommendations**: {len(active_recs)} (Total Savings: **${total_savings:.2f}/mo**)\n\n"
            answer += "You can ask me questions like:\n"
            answer += "- *'Where is my cloud waste?'*\n"
            answer += "- *'Which EC2 instances are idle?'*\n"
            answer += "- *'How does Auto-Healing protect my data?'*\n"
            answer += "- *'Give me an executive summary of this month\\'s cloud costs.'*"

        return {"response": answer, "sources": sources}

ai_service = AIService()

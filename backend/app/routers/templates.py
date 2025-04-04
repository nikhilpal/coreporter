from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..schemas.schemas import TemplateCreate, TemplateResponse, TemplateVariableCreate, TemplateFormatEnum
from uuid import uuid4
from datetime import datetime

router = APIRouter(
    prefix="/templates",
    tags=["templates"],
)

templates = {}
template_variables = {}

def initialize_dummy_data():
    sales_template_id = str(uuid4())
    sales_variables = []
    
    for var_data in [
        {"name": "report_period", "description": "Reporting period (e.g., Q1 2025)", "default_value": "Q1 2025"},
        {"name": "sales_target", "description": "Sales target for the period", "default_value": "1000000"},
        {"name": "top_product", "description": "Top selling product", "default_value": None}
    ]:
        var_id = str(uuid4())
        var_info = {
            "id": var_id,
            "name": var_data["name"],
            "description": var_data["description"],
            "default_value": var_data["default_value"]
        }
        template_variables[var_id] = var_info
        sales_variables.append(var_info)
    
    now = datetime.now()
    sales_template = {
        "id": sales_template_id,
        "name": "Quarterly Sales Report",
        "description": "Template for quarterly sales performance reports",
        "template_content": """
        <h1>Quarterly Sales Report - {{ report_period }}</h1>
        
        <h2>Executive Summary</h2>
        <p>This report provides an overview of sales performance for {{ report_period }}.</p>
        
        <h2>Sales Performance</h2>
        <p>The sales target for this period was ${{ sales_target }}.</p>
        <p>The top selling product was {{ top_product }}.</p>
        
        <h2>Regional Breakdown</h2>
        <ul>
            <li>North: $XXX,XXX</li>
            <li>South: $XXX,XXX</li>
            <li>East: $XXX,XXX</li>
            <li>West: $XXX,XXX</li>
        </ul>
        
        <h2>Recommendations</h2>
        <p>Based on the sales data, we recommend the following actions:</p>
        <ol>
            <li>Increase marketing budget for {{ top_product }}</li>
            <li>Review pricing strategy for underperforming products</li>
            <li>Expand distribution channels in the West region</li>
        </ol>
        """,
        "template_format": TemplateFormatEnum.HTML,
        "variables": sales_variables,
        "required_data_sources": ["sales_data", "product_data"],
        "parameters": {
            "include_charts": True,
            "include_recommendations": True
        },
        "created_at": now,
        "updated_at": now
    }
    
    feedback_template_id = str(uuid4())
    feedback_variables = []
    
    for var_data in [
        {"name": "feedback_period", "description": "Period for customer feedback", "default_value": "Q1 2025"},
        {"name": "total_responses", "description": "Total number of customer responses", "default_value": "500"},
        {"name": "satisfaction_score", "description": "Overall customer satisfaction score", "default_value": None}
    ]:
        var_id = str(uuid4())
        var_info = {
            "id": var_id,
            "name": var_data["name"],
            "description": var_data["description"],
            "default_value": var_data["default_value"]
        }
        template_variables[var_id] = var_info
        feedback_variables.append(var_info)
    
    feedback_template = {
        "id": feedback_template_id,
        "name": "Customer Feedback Report",
        "description": "Template for customer feedback analysis",
        "template_content": """
        <h1>Customer Feedback Analysis - {{ feedback_period }}</h1>
        
        <h2>Overview</h2>
        <p>This report analyzes customer feedback collected during {{ feedback_period }}.</p>
        <p>Total responses: {{ total_responses }}</p>
        <p>Overall satisfaction score: {{ satisfaction_score }}/5</p>
        
        <h2>Key Findings</h2>
        <ul>
            <li>Product Quality: X.X/5</li>
            <li>Customer Service: X.X/5</li>
            <li>Value for Money: X.X/5</li>
            <li>Ease of Use: X.X/5</li>
        </ul>
        
        <h2>Customer Comments</h2>
        <blockquote>
            "Sample customer comment here."
        </blockquote>
        
        <h2>Recommendations</h2>
        <ol>
            <li>Improve product quality based on feedback</li>
            <li>Enhance customer service training</li>
            <li>Review pricing strategy</li>
        </ol>
        """,
        "template_format": TemplateFormatEnum.HTML,
        "variables": feedback_variables,
        "required_data_sources": ["customer_feedback", "support_tickets"],
        "parameters": {
            "include_comments": True,
            "min_comment_length": 20
        },
        "created_at": now,
        "updated_at": now
    }
    
    templates[sales_template_id] = sales_template
    templates[feedback_template_id] = feedback_template

initialize_dummy_data()

@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(template: TemplateCreate):
    """
    Create a new report template
    """
    template_id = str(uuid4())
    now = datetime.now()
    
    template_dict = template.model_dump()
    template_dict["id"] = template_id
    template_dict["created_at"] = now
    template_dict["updated_at"] = now
    
    if "variables" in template_dict:
        processed_variables = []
        for var in template_dict["variables"]:
            var_id = str(uuid4())
            var_dict = {**var, "id": var_id}
            template_variables[var_id] = var_dict
            processed_variables.append(var_dict)
        template_dict["variables"] = processed_variables
    
    templates[template_id] = template_dict
    return template_dict

@router.get("/", response_model=List[TemplateResponse])
async def get_templates():
    """
    Get all report templates
    """
    return list(templates.values())

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str):
    """
    Get a specific template by ID
    """
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    return templates[template_id]

@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(template_id: str, template: TemplateCreate):
    """
    Update a template
    """
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    
    template_dict = template.model_dump()
    template_dict["id"] = template_id
    template_dict["created_at"] = templates[template_id]["created_at"]
    template_dict["updated_at"] = datetime.now()
    
    if "variables" in template_dict:
        processed_variables = []
        for var in template_dict["variables"]:
            var_id = str(uuid4())
            var_dict = {**var, "id": var_id}
            template_variables[var_id] = var_dict
            processed_variables.append(var_dict)
        template_dict["variables"] = processed_variables
    
    templates[template_id] = template_dict
    return template_dict

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: str):
    """
    Delete a template
    """
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    del templates[template_id]
    return None

@router.post("/{template_id}/analyze", response_model=TemplateResponse)
async def analyze_template(template_id: str):
    """
    Analyze a template to extract questions that need to be answered
    
    In a real implementation, this would:
    1. Parse the template
    2. Identify sections that need data
    3. Generate questions using LLM
    4. Return the template with associated questions
    """
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    
    return templates[template_id]

@router.get("/{template_id}/variables", response_model=List[Dict[str, Any]])
async def get_template_variables(template_id: str):
    """
    Get all variables for a specific template
    """
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    
    return templates[template_id].get("variables", [])

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..schemas.schemas import ReportCreate, ReportUpdate, ReportResponse, ReportStatusEnum, QuestionResponse, ExportFormatEnum
from ..services.llm_service import LLMService
from uuid import uuid4
from datetime import datetime
import re

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)

reports = {}
questions = {}

llm_service = LLMService()

def initialize_dummy_data():
    sales_report_id = str(uuid4())
    now = datetime.now()
    
    sales_questions = []
    for question_data in [
        {
            "text": "What was the total sales revenue for Q1 2025?",
            "context": "Sales Performance section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "$1,250,000",
            "confidence_score": 0.95
        },
        {
            "text": "What was the top selling product in Q1 2025?",
            "context": "Sales Performance section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "Premium Widget Pro",
            "confidence_score": 0.92
        },
        {
            "text": "What were the sales figures for each region?",
            "context": "Regional Breakdown section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "North: $350,000, South: $275,000, East: $325,000, West: $300,000",
            "confidence_score": 0.88
        },
        {
            "text": "What are the recommended actions based on Q1 sales data?",
            "context": "Recommendations section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "1. Increase marketing budget for Premium Widget Pro, 2. Review pricing strategy for underperforming products, 3. Expand distribution channels in the West region",
            "confidence_score": 0.85
        }
    ]:
        question_id = str(uuid4())
        question_dict = {
            "id": question_id,
            **question_data
        }
        questions[question_id] = question_dict
        sales_questions.append(question_dict)
    
    sales_report = {
        "id": sales_report_id,
        "template_id": "template_id_placeholder",  # This would be a real template ID in production
        "name": "Q1 2025 Sales Performance Report",
        "status": ReportStatusEnum.DRAFT,
        "content": """
        <h1>Quarterly Sales Report - Q1 2025</h1>
        
        <h2>Executive Summary</h2>
        <p>This report provides an overview of sales performance for Q1 2025.</p>
        
        <h2>Sales Performance</h2>
        <p>The sales target for this period was $1,000,000. Actual sales revenue was $1,250,000, exceeding the target by 25%.</p>
        <p>The top selling product was Premium Widget Pro, accounting for 35% of total sales.</p>
        
        <h2>Regional Breakdown</h2>
        <ul>
            <li>North: $350,000</li>
            <li>South: $275,000</li>
            <li>East: $325,000</li>
            <li>West: $300,000</li>
        </ul>
        
        <h2>Recommendations</h2>
        <p>Based on the sales data, we recommend the following actions:</p>
        <ol>
            <li>Increase marketing budget for Premium Widget Pro</li>
            <li>Review pricing strategy for underperforming products</li>
            <li>Expand distribution channels in the West region</li>
        </ol>
        """,
        "questions": sales_questions,
        "parameters": {
            "include_charts": True,
            "include_recommendations": True
        },
        "created_at": now,
        "updated_at": now,
        "approved_at": None,
        "exported_at": None,
        "export_format": None
    }
    
    feedback_report_id = str(uuid4())
    
    feedback_questions = []
    for question_data in [
        {
            "text": "What was the overall customer satisfaction score for Q1 2025?",
            "context": "Overview section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "4.2/5",
            "confidence_score": 0.94
        },
        {
            "text": "How many customer responses were collected?",
            "context": "Overview section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "523",
            "confidence_score": 0.99
        },
        {
            "text": "What were the scores for each category?",
            "context": "Key Findings section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "Product Quality: 4.3/5, Customer Service: 4.0/5, Value for Money: 3.8/5, Ease of Use: 4.5/5",
            "confidence_score": 0.91
        },
        {
            "text": "What are the most common customer comments?",
            "context": "Customer Comments section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "Customers frequently mentioned the ease of use as a positive, while some expressed concerns about pricing.",
            "confidence_score": 0.87
        }
    ]:
        question_id = str(uuid4())
        question_dict = {
            "id": question_id,
            **question_data
        }
        questions[question_id] = question_dict
        feedback_questions.append(question_dict)
    
    feedback_report = {
        "id": feedback_report_id,
        "template_id": "template_id_placeholder",  # This would be a real template ID in production
        "name": "Q1 2025 Customer Feedback Analysis",
        "status": ReportStatusEnum.IN_REVIEW,
        "content": """
        <h1>Customer Feedback Analysis - Q1 2025</h1>
        
        <h2>Overview</h2>
        <p>This report analyzes customer feedback collected during Q1 2025.</p>
        <p>Total responses: 523</p>
        <p>Overall satisfaction score: 4.2/5</p>
        
        <h2>Key Findings</h2>
        <ul>
            <li>Product Quality: 4.3/5</li>
            <li>Customer Service: 4.0/5</li>
            <li>Value for Money: 3.8/5</li>
            <li>Ease of Use: 4.5/5</li>
        </ul>
        
        <h2>Customer Comments</h2>
        <blockquote>
            "The product is very intuitive and easy to use. I was able to get started right away without reading the manual."
        </blockquote>
        <blockquote>
            "Great product, but I think it's a bit overpriced compared to alternatives."
        </blockquote>
        
        <h2>Recommendations</h2>
        <ol>
            <li>Maintain focus on user experience and ease of use</li>
            <li>Review pricing strategy to address value perception</li>
            <li>Enhance customer service training to improve scores</li>
        </ol>
        """,
        "questions": feedback_questions,
        "parameters": {
            "include_comments": True,
            "min_comment_length": 20
        },
        "created_at": now,
        "updated_at": now,
        "approved_at": None,
        "exported_at": None,
        "export_format": None
    }
    
    approved_report_id = str(uuid4())
    approved_questions = []
    for question_data in [
        {
            "text": "What were the key marketing metrics for Q4 2024?",
            "context": "Marketing Performance section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "CTR: 3.2%, Conversion Rate: 2.8%, ROI: 320%",
            "confidence_score": 0.93
        },
        {
            "text": "Which marketing channel performed best?",
            "context": "Channel Performance section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "Social media, with a 4.1% CTR and 3.5% conversion rate",
            "confidence_score": 0.95
        }
    ]:
        question_id = str(uuid4())
        question_dict = {
            "id": question_id,
            **question_data
        }
        questions[question_id] = question_dict
        approved_questions.append(question_dict)
    
    approved_report = {
        "id": approved_report_id,
        "template_id": "template_id_placeholder",  # This would be a real template ID in production
        "name": "Q4 2024 Marketing Performance Report",
        "status": ReportStatusEnum.APPROVED,
        "content": """
        <h1>Marketing Performance Report - Q4 2024</h1>
        
        <h2>Executive Summary</h2>
        <p>This report provides an overview of marketing performance for Q4 2024.</p>
        
        <h2>Marketing Performance</h2>
        <p>Key metrics:</p>
        <ul>
            <li>Click-Through Rate (CTR): 3.2%</li>
            <li>Conversion Rate: 2.8%</li>
            <li>Return on Investment (ROI): 320%</li>
        </ul>
        
        <h2>Channel Performance</h2>
        <p>Social media was the top performing channel with a 4.1% CTR and 3.5% conversion rate.</p>
        <p>Email marketing was the second best channel with a 3.8% CTR and 3.0% conversion rate.</p>
        
        <h2>Recommendations</h2>
        <ol>
            <li>Increase budget allocation to social media campaigns</li>
            <li>Optimize email marketing content based on top performing emails</li>
            <li>Test new ad creatives for search marketing to improve CTR</li>
        </ol>
        """,
        "questions": approved_questions,
        "parameters": {
            "include_charts": True,
            "include_recommendations": True
        },
        "created_at": now,
        "updated_at": now,
        "approved_at": now,
        "exported_at": None,
        "export_format": None
    }
    
    reports[sales_report_id] = sales_report
    reports[feedback_report_id] = feedback_report
    reports[approved_report_id] = approved_report

initialize_dummy_data()

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(report: ReportCreate):
    """
    Create a new report based on a template
    """
    report_id = str(uuid4())
    now = datetime.now()
    
    report_dict = report.model_dump()
    report_dict["id"] = report_id
    report_dict["status"] = ReportStatusEnum.DRAFT
    
    report_dict["content"] = "Initial report content based on template"
    
    report_dict["questions"] = [
        {
            "id": str(uuid4()),
            "text": "What is the key performance metric?",
            "context": "Performance section",
            "data_source_id": None,
            "variable_id": None,
            "answer": None,
            "confidence_score": None
        },
        {
            "id": str(uuid4()),
            "text": "What are the main challenges faced?",
            "context": "Challenges section",
            "data_source_id": None,
            "variable_id": None,
            "answer": None,
            "confidence_score": None
        }
    ]
    
    report_dict["created_at"] = now
    report_dict["updated_at"] = now
    report_dict["approved_at"] = None
    report_dict["exported_at"] = None
    report_dict["export_format"] = None
    
    reports[report_id] = report_dict
    return report_dict

@router.get("/", response_model=List[ReportResponse])
async def get_reports():
    """
    Get all reports
    """
    return list(reports.values())

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    """
    Get a specific report by ID
    """
    if report_id not in reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    return reports[report_id]

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(report_id: str, report_update: ReportUpdate):
    """
    Update a report's content or status
    """
    if report_id not in reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    report_dict = reports[report_id]
    update_data = report_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        report_dict[key] = value
    
    report_dict["updated_at"] = datetime.now()
    
    if "status" in update_data and update_data["status"] == ReportStatusEnum.APPROVED:
        report_dict["approved_at"] = datetime.now()
    
    if "status" in update_data and update_data["status"] == ReportStatusEnum.EXPORTED:
        report_dict["exported_at"] = datetime.now()
    
    reports[report_id] = report_dict
    return report_dict

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(report_id: str):
    """
    Delete a report
    """
    if report_id not in reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    del reports[report_id]
    return None

@router.post("/{report_id}/generate", response_model=ReportResponse)
async def generate_report(report_id: str):
    """
    Generate the report content by answering all questions using LLM
    
    In a real implementation, this would:
    1. Process all unanswered questions
    2. Use LLM to generate answers based on available data
    3. Update the report content with the answers
    """
    if report_id not in reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    report_dict = reports[report_id]
    
    for question in report_dict["questions"]:
        if not question["answer"]:
            question["answer"] = f"Sample answer for question: {question['text']}"
            question["confidence_score"] = 0.85  # Placeholder confidence score
    
    template_content = report_dict["content"]
    
    for question in report_dict["questions"]:
        if question["answer"]:
            if question["variable_id"]:
                variable_name = f"variable_{question['variable_id']}"
                template_content = re.sub(r'\{\{\s*' + variable_name + r'\s*\}\}', question["answer"], template_content)
            else:
                words = question["text"].lower().split()
                if "sales" in words and "revenue" in words:
                    template_content = re.sub(r'\{\{\s*sales_revenue\s*\}\}', question["answer"], template_content)
                elif "top" in words and "product" in words:
                    template_content = re.sub(r'\{\{\s*top_product\s*\}\}', question["answer"], template_content)
    
    report_dict["content"] = template_content
    report_dict["updated_at"] = datetime.now()
    
    reports[report_id] = report_dict
    return report_dict

@router.post("/{report_id}/export", response_model=ReportResponse)
async def export_report(report_id: str, export_format: ExportFormatEnum = ExportFormatEnum.PDF):
    """
    Export the approved report
    
    In a real implementation, this would:
    1. Check if the report is approved
    2. Generate the export format (PDF, DOCX, etc.)
    3. Return a download link
    """
    if report_id not in reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    report_dict = reports[report_id]
    
    if report_dict["status"] != ReportStatusEnum.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved reports can be exported"
        )
    
    report_dict["status"] = ReportStatusEnum.EXPORTED
    report_dict["exported_at"] = datetime.now()
    report_dict["updated_at"] = datetime.now()
    report_dict["export_format"] = export_format
    
    
    reports[report_id] = report_dict
    return report_dict

@router.get("/{report_id}/questions", response_model=List[QuestionResponse])
async def get_report_questions(report_id: str):
    """
    Get all questions for a specific report
    """
    if report_id not in reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    return reports[report_id]["questions"]

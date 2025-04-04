from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional
from ..schemas.schemas import QuestionUpdate, QuestionResponse, QuestionCreate
from ..services.llm_service import LLMService
from uuid import uuid4
from datetime import datetime

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

questions = {}

llm_service = LLMService()

def initialize_dummy_data():
    for question_data in [
        {
            "text": "What is the customer retention rate for Q1 2025?",
            "context": "Customer Metrics section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "87.5%",
            "confidence_score": 0.92
        },
        {
            "text": "What is the average customer acquisition cost?",
            "context": "Marketing Metrics section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "$125.50",
            "confidence_score": 0.89
        },
        {
            "text": "What are the top 3 customer complaints?",
            "context": "Customer Feedback section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "1. Slow response time, 2. Pricing concerns, 3. Feature limitations",
            "confidence_score": 0.85
        },
        {
            "text": "What is the projected growth rate for Q2 2025?",
            "context": "Forecasting section",
            "data_source_id": None,
            "variable_id": None,
            "answer": "12.3%",
            "confidence_score": 0.78
        }
    ]:
        question_id = str(uuid4())
        question_dict = {
            "id": question_id,
            **question_data
        }
        questions[question_id] = question_dict

initialize_dummy_data()

@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(question: QuestionCreate):
    """
    Create a new question
    """
    question_id = str(uuid4())
    
    question_dict = question.model_dump()
    question_dict["id"] = question_id
    question_dict["answer"] = None
    question_dict["confidence_score"] = None
    
    questions[question_id] = question_dict
    return question_dict

@router.get("/", response_model=List[QuestionResponse])
async def get_questions():
    """
    Get all questions
    """
    return list(questions.values())

@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(question_id: str):
    """
    Get a specific question by ID
    """
    if question_id not in questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    return questions[question_id]

@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(question_id: str, question_update: QuestionUpdate):
    """
    Update a question's answer
    """
    if question_id not in questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    
    question_dict = questions[question_id]
    update_data = question_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        question_dict[key] = value
    
    questions[question_id] = question_dict
    return question_dict

@router.post("/{question_id}/answer-with-llm", response_model=QuestionResponse)
async def answer_question_with_llm(question_id: str, data_source_ids: Optional[List[str]] = None):
    """
    Generate an answer for a question using LLM
    
    In a real implementation, this would:
    1. Retrieve relevant data from data sources
    2. Format the data for the LLM
    3. Generate an answer using the LLM
    4. Update the question with the answer
    """
    if question_id not in questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    
    question_dict = questions[question_id]
    
    
    data = {}
    if data_source_ids:
        data = {"sample_data": "This is sample data from the specified data sources"}
    
    answer = await llm_service.answer_question(
        question=question_dict["text"],
        context=question_dict["context"],
        data=data
    )
    
    question_dict["answer"] = answer
    question_dict["confidence_score"] = 0.85  # Placeholder confidence score
    
    questions[question_id] = question_dict
    return question_dict

@router.get("/by-context/{context}", response_model=List[QuestionResponse])
async def get_questions_by_context(context: str):
    """
    Get questions by context
    """
    context_questions = []
    for question in questions.values():
        if question["context"] and context.lower() in question["context"].lower():
            context_questions.append(question)
    
    return context_questions

@router.get("/by-data-source/{data_source_id}", response_model=List[QuestionResponse])
async def get_questions_by_data_source(data_source_id: str):
    """
    Get questions by data source
    """
    data_source_questions = []
    for question in questions.values():
        if question["data_source_id"] == data_source_id:
            data_source_questions.append(question)
    
    return data_source_questions

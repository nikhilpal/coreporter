from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class ConnectorType(str, Enum):
    DATABASE = "database"
    API = "api"
    FILE = "file"
    CUSTOM = "custom"

class FileInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    size: int
    uploaded_at: datetime
    metadata: Dict[str, Any] = {}

class DataSource(BaseModel):
    id: str
    name: str
    connector_type: ConnectorType
    connection_details: Dict[str, Any]
    files: List[FileInfo] = []
    last_synced: Optional[datetime] = None

class TemplateVariable(BaseModel):
    id: str
    name: str
    description: str
    default_value: Optional[str] = None

class ReportTemplate(BaseModel):
    id: str
    name: str
    description: str
    template_content: str
    template_format: str = "html"  # html, jinja, markdown, etc.
    variables: List[TemplateVariable] = []
    required_data_sources: List[str]
    parameters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class Question(BaseModel):
    id: str
    text: str
    context: Optional[str] = None
    data_source_id: Optional[str] = None
    variable_id: Optional[str] = None
    answer: Optional[str] = None
    confidence_score: Optional[float] = None

class Report(BaseModel):
    id: str
    template_id: str
    name: str
    status: str  # draft, in_review, approved, exported
    content: str
    questions: List[Question]
    parameters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime] = None
    exported_at: Optional[datetime] = None
    export_format: Optional[str] = None  # pdf, docx, html, etc.

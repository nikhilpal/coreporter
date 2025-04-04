from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class ConnectorTypeEnum(str, Enum):
    DATABASE = "database"
    API = "api"
    FILE = "file"
    CUSTOM = "custom"

class ReportStatusEnum(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    EXPORTED = "exported"

class TemplateFormatEnum(str, Enum):
    HTML = "html"
    JINJA = "jinja"
    MARKDOWN = "markdown"
    TEXT = "text"

class ExportFormatEnum(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    HTML = "html"
    MARKDOWN = "markdown"
    TEXT = "text"

class FileInfoBase(BaseModel):
    filename: str
    file_type: str
    size: int
    metadata: Dict[str, Any] = Field(default_factory=dict)

class FileInfoCreate(FileInfoBase):
    pass

class FileInfoResponse(FileInfoBase):
    id: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DataSourceBase(BaseModel):
    name: str
    connector_type: ConnectorTypeEnum
    connection_details: Dict[str, Any]

class DataSourceCreate(DataSourceBase):
    pass

class DataSourceResponse(DataSourceBase):
    id: str
    files: List[FileInfoResponse] = []
    last_synced: Optional[datetime] = None

    class Config:
        from_attributes = True

class TemplateVariableBase(BaseModel):
    name: str
    description: str
    default_value: Optional[str] = None

class TemplateVariableCreate(TemplateVariableBase):
    pass

class TemplateVariableResponse(TemplateVariableBase):
    id: str

    class Config:
        from_attributes = True

class TemplateBase(BaseModel):
    name: str
    description: str
    template_content: str
    template_format: TemplateFormatEnum = TemplateFormatEnum.HTML
    required_data_sources: List[str]
    parameters: Dict[str, Any] = Field(default_factory=dict)

class TemplateCreate(TemplateBase):
    variables: List[TemplateVariableCreate] = []

class TemplateResponse(TemplateBase):
    id: str
    variables: List[TemplateVariableResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    text: str
    context: Optional[str] = None
    data_source_id: Optional[str] = None
    variable_id: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    answer: Optional[str] = None
    confidence_score: Optional[float] = None

class QuestionResponse(QuestionBase):
    id: str
    answer: Optional[str] = None
    confidence_score: Optional[float] = None

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    template_id: str
    name: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[ReportStatusEnum] = None
    export_format: Optional[ExportFormatEnum] = None

class ReportResponse(ReportBase):
    id: str
    status: ReportStatusEnum
    content: str
    questions: List[QuestionResponse]
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime] = None
    exported_at: Optional[datetime] = None
    export_format: Optional[ExportFormatEnum] = None

    class Config:
        from_attributes = True

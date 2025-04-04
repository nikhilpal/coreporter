from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from ..schemas.schemas import DataSourceCreate, DataSourceResponse, FileInfoCreate, FileInfoResponse, ConnectorTypeEnum
from uuid import uuid4
from datetime import datetime
import json

router = APIRouter(
    prefix="/data-sources",
    tags=["data-sources"],
)

data_sources = {}
files = {}

def initialize_dummy_data():
    db_source_id = str(uuid4())
    db_source = {
        "id": db_source_id,
        "name": "Customer Database",
        "connector_type": ConnectorTypeEnum.DATABASE,
        "connection_details": {
            "host": "db.example.com",
            "port": 5432,
            "database": "customers",
            "username": "readonly"
        },
        "files": [],
        "last_synced": datetime.now()
    }
    
    file_source_id = str(uuid4())
    file_source = {
        "id": file_source_id,
        "name": "Sales Reports",
        "connector_type": ConnectorTypeEnum.FILE,
        "connection_details": {
            "storage_path": "/data/sales"
        },
        "files": [],
        "last_synced": datetime.now()
    }
    
    file_ids = []
    for i, file_data in enumerate([
        {"filename": "sales_q1_2025.csv", "file_type": "csv", "size": 1024 * 1024},
        {"filename": "sales_q2_2025.csv", "file_type": "csv", "size": 1024 * 1024 * 2},
        {"filename": "customer_feedback.xlsx", "file_type": "xlsx", "size": 1024 * 512}
    ]):
        file_id = str(uuid4())
        file_info = {
            "id": file_id,
            "filename": file_data["filename"],
            "file_type": file_data["file_type"],
            "size": file_data["size"],
            "uploaded_at": datetime.now(),
            "metadata": {"rows": 1000 + i * 500, "columns": 10 + i}
        }
        files[file_id] = file_info
        file_ids.append(file_id)
        file_source["files"].append(file_info)
    
    api_source_id = str(uuid4())
    api_source = {
        "id": api_source_id,
        "name": "Marketing API",
        "connector_type": ConnectorTypeEnum.API,
        "connection_details": {
            "url": "https://api.marketing.example.com",
            "auth_type": "oauth2"
        },
        "files": [],
        "last_synced": datetime.now()
    }
    
    data_sources[db_source_id] = db_source
    data_sources[file_source_id] = file_source
    data_sources[api_source_id] = api_source

initialize_dummy_data()

@router.post("/", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
async def create_data_source(data_source: DataSourceCreate):
    """
    Create a new data source connector
    """
    data_source_id = str(uuid4())
    data_source_dict = data_source.model_dump()
    data_source_dict["id"] = data_source_id
    data_source_dict["files"] = []
    data_source_dict["last_synced"] = None
    
    data_sources[data_source_id] = data_source_dict
    return data_source_dict

@router.get("/", response_model=List[DataSourceResponse])
async def get_data_sources():
    """
    Get all data sources
    """
    return list(data_sources.values())

@router.get("/{data_source_id}", response_model=DataSourceResponse)
async def get_data_source(data_source_id: str):
    """
    Get a specific data source by ID
    """
    if data_source_id not in data_sources:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data source with ID {data_source_id} not found"
        )
    return data_sources[data_source_id]

@router.delete("/{data_source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_source(data_source_id: str):
    """
    Delete a data source
    """
    if data_source_id not in data_sources:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data source with ID {data_source_id} not found"
        )
    del data_sources[data_source_id]
    return None

@router.post("/{data_source_id}/sync", response_model=DataSourceResponse)
async def sync_data_source(data_source_id: str):
    """
    Trigger data synchronization for a specific data source
    """
    if data_source_id not in data_sources:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data source with ID {data_source_id} not found"
        )
    
    data_sources[data_source_id]["last_synced"] = datetime.now()
    
    return data_sources[data_source_id]

@router.post("/{data_source_id}/files", response_model=FileInfoResponse)
async def add_file_to_data_source(
    data_source_id: str,
    filename: str = Form(...),
    file_type: str = Form(...),
    metadata: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Add a file to a data source
    
    In a real implementation, this would:
    1. Upload the file to storage
    2. Process the file based on its type
    3. Extract metadata
    4. Associate the file with the data source
    """
    if data_source_id not in data_sources:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data source with ID {data_source_id} not found"
        )
    
    file_metadata = {}
    if metadata:
        try:
            file_metadata = json.loads(metadata)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid metadata format. Must be valid JSON."
            )
    
    file_id = str(uuid4())
    file_info = {
        "id": file_id,
        "filename": filename,
        "file_type": file_type,
        "size": 0,  # In a real implementation, this would be the actual file size
        "uploaded_at": datetime.now(),
        "metadata": file_metadata
    }
    
    file_info["size"] = 1024 * 1024  # 1MB dummy size
    
    files[file_id] = file_info
    
    data_sources[data_source_id]["files"].append(file_info)
    
    return file_info

@router.get("/{data_source_id}/files", response_model=List[FileInfoResponse])
async def get_data_source_files(data_source_id: str):
    """
    Get all files associated with a data source
    """
    if data_source_id not in data_sources:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data source with ID {data_source_id} not found"
        )
    
    return data_sources[data_source_id]["files"]

@router.delete("/{data_source_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_file_from_data_source(data_source_id: str, file_id: str):
    """
    Remove a file from a data source
    """
    if data_source_id not in data_sources:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data source with ID {data_source_id} not found"
        )
    
    data_source = data_sources[data_source_id]
    file_index = None
    for i, file in enumerate(data_source["files"]):
        if file["id"] == file_id:
            file_index = i
            break
    
    if file_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID {file_id} not found in data source"
        )
    
    data_source["files"].pop(file_index)
    
    if file_id in files:
        del files[file_id]
    
    return None

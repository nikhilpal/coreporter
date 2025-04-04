# Coreporter Backend Architecture

## Overview

Coreporter is a report generation system that uses templates, data connectors, and LLM integration to automate the creation of reports. The backend is built with FastAPI and provides a comprehensive API for managing data sources, templates, reports, and questions.

## System Architecture

The backend consists of the following components:

1. **Data Connectors**: Interfaces for syncing data from various sources (databases, APIs, files)
2. **Data Normalization**: Services for standardizing data from different sources
3. **Template Management**: APIs for creating and managing report templates
4. **Question Generation**: LLM-based services for extracting questions from templates
5. **Answer Generation**: LLM-based services for answering questions using available data
6. **Report Generation**: Services for creating reports based on templates and answers
7. **Export Functionality**: APIs for exporting approved reports

## Data Flow

1. Data is synced from external sources using connectors
2. The data is normalized into a standard format
3. Report templates are converted to identify required questions
4. LLM logic is used to build answers to these questions
5. The template is updated with the answers
6. The user reviews and can make changes to the report
7. Once approved, the report can be exported

## API Endpoints

### Data Sources

- `POST /data-sources/`: Create a new data source connector
- `GET /data-sources/`: Get all data sources
- `GET /data-sources/{data_source_id}`: Get a specific data source
- `DELETE /data-sources/{data_source_id}`: Delete a data source
- `POST /data-sources/{data_source_id}/sync`: Trigger data synchronization

### Templates

- `POST /templates/`: Create a new report template
- `GET /templates/`: Get all report templates
- `GET /templates/{template_id}`: Get a specific template
- `PUT /templates/{template_id}`: Update a template
- `DELETE /templates/{template_id}`: Delete a template
- `POST /templates/{template_id}/analyze`: Analyze a template to extract questions

### Reports

- `POST /reports/`: Create a new report based on a template
- `GET /reports/`: Get all reports
- `GET /reports/{report_id}`: Get a specific report
- `PUT /reports/{report_id}`: Update a report's content or status
- `DELETE /reports/{report_id}`: Delete a report
- `POST /reports/{report_id}/generate`: Generate the report by answering questions
- `POST /reports/{report_id}/export`: Export an approved report

### Questions

- `GET /questions/`: Get all questions
- `GET /questions/{question_id}`: Get a specific question
- `PUT /questions/{question_id}`: Update a question's answer
- `POST /questions/{question_id}/answer-with-llm`: Generate an answer using LLM

## Data Models

### Data Source

```json
{
  "id": "string",
  "name": "string",
  "connector_type": "database|api|file|custom",
  "connection_details": {},
  "last_synced": "datetime"
}
```

### Template

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "template_content": "string",
  "required_data_sources": ["string"],
  "parameters": {},
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Question

```json
{
  "id": "string",
  "text": "string",
  "context": "string",
  "data_source_id": "string",
  "answer": "string"
}
```

### Report

```json
{
  "id": "string",
  "template_id": "string",
  "name": "string",
  "status": "draft|in_review|approved|exported",
  "content": "string",
  "questions": [Question],
  "parameters": {},
  "created_at": "datetime",
  "updated_at": "datetime",
  "approved_at": "datetime",
  "exported_at": "datetime"
}
```

## LLM Integration

The LLM integration is handled by the `LLMService` which provides the following functionality:

1. **Question Generation**: Analyzing templates to extract questions that need to be answered
2. **Answer Generation**: Using available data to generate answers to questions
3. **Content Generation**: Filling in templates with answers and generating the final report content

In a production environment, this service would connect to an LLM provider (e.g., OpenAI, Anthropic) and handle the formatting of prompts and processing of responses.

## Development Setup

1. Install dependencies:
   ```
   poetry install
   ```

2. Run the development server:
   ```
   poetry run fastapi dev app/main.py
   ```

3. Access the API documentation:
   ```
   http://localhost:8000/docs
   ```

## Notes

- This is a planning document with dummy data implementations
- In a production environment, you would need to:
  - Implement proper data persistence (database)
  - Set up authentication and authorization
  - Configure LLM provider credentials
  - Implement error handling and logging
  - Add tests for all components

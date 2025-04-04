from typing import List, Dict, Any, Optional, Tuple
import re
import random

class LLMService:
    """
    Service for interacting with LLMs to generate answers to questions
    
    In a real implementation, this would:
    1. Connect to an LLM provider (OpenAI, Anthropic, etc.)
    2. Format data and questions for the LLM
    3. Process LLM responses
    """
    
    def __init__(self):
        self.sample_answers = {
            "sales": ["$1.2M", "$980K", "$1.5M", "$2.1M"],
            "growth": ["12%", "8.5%", "15.3%", "7.2%"],
            "product": ["Widget Pro", "SuperApp", "Enterprise Suite", "Analytics Dashboard"],
            "customer": ["4.5/5", "87%", "92%", "3.8/5"],
            "marketing": ["22% CTR", "3.5% conversion rate", "$45 CAC", "320% ROI"]
        }
    
    async def generate_questions_from_template(self, template_content: str) -> List[Dict[str, Any]]:
        """
        Analyze a template and generate questions that need to be answered
        
        Args:
            template_content: The content of the report template
            
        Returns:
            A list of questions extracted from the template
        """
        
        questions = []
        
        placeholders = re.findall(r'\{\{\s*([^}]+)\s*\}\}', template_content)
        
        for placeholder in placeholders:
            placeholder = placeholder.strip()
            
            if "sales" in placeholder.lower():
                questions.append({
                    "text": f"What was the {placeholder.replace('_', ' ')} for the reporting period?",
                    "context": "Sales Performance section",
                    "variable_id": placeholder
                })
            elif "product" in placeholder.lower():
                questions.append({
                    "text": f"What was the {placeholder.replace('_', ' ')}?",
                    "context": "Product Performance section",
                    "variable_id": placeholder
                })
            elif "customer" in placeholder.lower() or "satisfaction" in placeholder.lower():
                questions.append({
                    "text": f"What was the {placeholder.replace('_', ' ')}?",
                    "context": "Customer Feedback section",
                    "variable_id": placeholder
                })
            else:
                questions.append({
                    "text": f"What is the value for {placeholder.replace('_', ' ')}?",
                    "context": "General section",
                    "variable_id": placeholder
                })
        
        if "performance" in template_content.lower():
            questions.append({
                "text": "What are the key performance metrics?",
                "context": "Performance section"
            })
        
        if "challenge" in template_content.lower():
            questions.append({
                "text": "What are the main challenges faced?",
                "context": "Challenges section"
            })
        
        if "recommendation" in template_content.lower():
            questions.append({
                "text": "What are the recommendations for improvement?",
                "context": "Recommendations section"
            })
        
        return questions
    
    async def answer_question(self, question: str, context: Optional[str], data: Dict[str, Any]) -> str:
        """
        Generate an answer to a question using the LLM and available data
        
        Args:
            question: The question to answer
            context: Optional context about where the question appears
            data: Data to use for answering the question
            
        Returns:
            The generated answer
        """
        
        question_lower = question.lower()
        
        if "sales" in question_lower or "revenue" in question_lower:
            return random.choice(self.sample_answers["sales"])
        elif "growth" in question_lower or "increase" in question_lower:
            return random.choice(self.sample_answers["growth"])
        elif "product" in question_lower:
            return random.choice(self.sample_answers["product"])
        elif "customer" in question_lower or "satisfaction" in question_lower:
            return random.choice(self.sample_answers["customer"])
        elif "marketing" in question_lower or "campaign" in question_lower:
            return random.choice(self.sample_answers["marketing"])
        else:
            return f"This is a sample answer to the question: {question}"
    
    async def generate_answer_with_confidence(self, question: str, context: Optional[str], data: Dict[str, Any]) -> Tuple[str, float]:
        """
        Generate an answer to a question with a confidence score
        
        Args:
            question: The question to answer
            context: Optional context about where the question appears
            data: Data to use for answering the question
            
        Returns:
            A tuple containing the generated answer and a confidence score
        """
        
        answer = await self.answer_question(question, context, data)
        
        confidence = round(random.uniform(0.7, 0.98), 2)
        
        return answer, confidence
    
    async def generate_report_content(self, template_content: str, answers: Dict[str, str]) -> str:
        """
        Generate the final report content by filling in the template with answers
        
        Args:
            template_content: The content of the report template
            answers: A dictionary mapping question IDs to answers
            
        Returns:
            The generated report content
        """
        
        report_content = template_content
        
        for question_id, answer in answers.items():
            if question_id.startswith("variable_"):
                variable_name = question_id[len("variable_"):]
                report_content = re.sub(r'\{\{\s*' + variable_name + r'\s*\}\}', answer, report_content)
        
        if report_content == template_content and answers:
            report_content += "\n\nAnswers:\n"
            for question_id, answer in answers.items():
                report_content += f"- {question_id}: {answer}\n"
        
        return report_content

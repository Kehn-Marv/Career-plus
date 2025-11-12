"""
Unit tests for chat service
Tests context building, conversation history formatting, and prompt construction
"""

import pytest
from unittest.mock import Mock, patch
from app.chat_service import (
    build_enhanced_context,
    format_conversation_history,
    generate_chat_response,
    SYSTEM_PROMPT
)


class TestBuildEnhancedContext:
    """Test context building with various inputs"""
    
    def test_empty_context(self):
        """Test with empty context"""
        context = {}
        result = build_enhanced_context(context)
        assert result == "No analysis context available"
    
    def test_job_information(self):
        """Test with job title and company"""
        context = {
            'job_title': 'Senior Software Engineer',
            'job_company': 'Tech Corp'
        }
        result = build_enhanced_context(context)
        assert 'Target Job: Senior Software Engineer' in result
        assert 'Company: Tech Corp' in result
    
    def test_scores(self):
        """Test with match scores"""
        context = {
            'scores': {
                'total': 85,
                'keyword': 78,
                'semantic': 92,
                'ats': 88
            }
        }
        result = build_enhanced_context(context)
        assert 'Match Scores' in result
        assert 'Overall: 85%' in result
        assert 'Keyword: 78%' in result
        assert 'Semantic: 92%' in result
        assert 'ATS: 88%' in result
    
    def test_gaps_and_strengths(self):
        """Test with gaps and strengths"""
        context = {
            'gaps': ['Python', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Extra'],
            'strengths': ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs', 'Extra']
        }
        result = build_enhanced_context(context)
        assert 'Key Gaps: Python, Docker, Kubernetes, AWS, CI/CD' in result
        assert 'Strengths: JavaScript, React, Node.js, MongoDB, REST APIs' in result
        # Should only include top 5
        assert 'Extra' not in result
    
    def test_missing_keywords(self):
        """Test with missing keywords"""
        context = {
            'missing_keywords': ['agile', 'scrum', 'jira', 'git', 'testing', 
                               'deployment', 'monitoring', 'security', 'performance', 
                               'scalability', 'extra']
        }
        result = build_enhanced_context(context)
        assert 'Missing Keywords:' in result
        # Should include top 10
        assert 'agile' in result
        assert 'scalability' in result
        # Should not include 11th item
        assert 'extra' not in result
    
    def test_critical_ats_issues(self):
        """Test with ATS issues"""
        context = {
            'ats_issues': [
                {'severity': 'critical', 'message': 'Missing contact information'},
                {'severity': 'warning', 'message': 'Long paragraphs detected'},
                {'severity': 'critical', 'message': 'No section headers'},
                {'severity': 'critical', 'message': 'Special characters in text'},
                {'severity': 'critical', 'message': 'Fourth critical issue'}
            ]
        }
        result = build_enhanced_context(context)
        assert 'Critical ATS Issues:' in result
        assert 'Missing contact information' in result
        assert 'No section headers' in result
        assert 'Special characters in text' in result
        # Should only include top 3 critical issues
        assert 'Fourth critical issue' not in result
        # Should not include warnings
        assert 'Long paragraphs detected' not in result
    
    def test_resume_summary_truncation(self):
        """Test resume summary truncation"""
        long_summary = 'A' * 300
        context = {
            'resume_summary': long_summary
        }
        result = build_enhanced_context(context)
        assert 'Resume Summary:' in result
        # Should be truncated to 200 chars + "..."
        assert len(result.split('Resume Summary: ')[1]) <= 204
        assert '...' in result
    
    def test_recommendations(self):
        """Test with recommendations"""
        context = {
            'recommendations': [
                {'type': 'keyword', 'explanation': 'Add Python to skills'},
                {'type': 'format', 'explanation': 'Use bullet points'},
                {'type': 'content', 'explanation': 'Quantify achievements'},
                {'type': 'extra', 'explanation': 'Should not appear'}
            ]
        }
        result = build_enhanced_context(context)
        assert 'Top Recommendations:' in result
        assert 'keyword: Add Python to skills' in result
        assert 'format: Use bullet points' in result
        assert 'content: Quantify achievements' in result
        # Should only include top 3
        assert 'Should not appear' not in result
    
    def test_comprehensive_context(self):
        """Test with all fields populated"""
        context = {
            'job_title': 'Data Scientist',
            'job_company': 'AI Startup',
            'scores': {'total': 75, 'keyword': 70, 'semantic': 80, 'ats': 75},
            'gaps': ['Machine Learning', 'TensorFlow'],
            'strengths': ['Python', 'Statistics'],
            'missing_keywords': ['neural networks', 'deep learning'],
            'ats_issues': [{'severity': 'critical', 'message': 'Missing dates'}],
            'resume_summary': 'Experienced data analyst',
            'recommendations': [{'type': 'skill', 'explanation': 'Add ML experience'}]
        }
        result = build_enhanced_context(context)
        
        # Verify all sections are present
        assert 'Target Job: Data Scientist' in result
        assert 'Company: AI Startup' in result
        assert 'Match Scores' in result
        assert 'Key Gaps' in result
        assert 'Strengths' in result
        assert 'Missing Keywords' in result
        assert 'Critical ATS Issues' in result
        assert 'Resume Summary' in result
        assert 'Top Recommendations' in result


class TestFormatConversationHistory:
    """Test conversation history formatting"""
    
    def test_empty_history(self):
        """Test with no conversation history"""
        history = []
        result = format_conversation_history(history)
        assert result == "No previous conversation"
    
    def test_single_message(self):
        """Test with single message"""
        history = [
            {'role': 'user', 'content': 'Hello'}
        ]
        result = format_conversation_history(history)
        assert 'User: Hello' in result
    
    def test_multiple_messages(self):
        """Test with multiple messages"""
        history = [
            {'role': 'user', 'content': 'What are my gaps?'},
            {'role': 'assistant', 'content': 'Your main gaps are Python and Docker.'},
            {'role': 'user', 'content': 'How can I improve?'}
        ]
        result = format_conversation_history(history)
        assert 'User: What are my gaps?' in result
        assert 'Assistant: Your main gaps are Python and Docker.' in result
        assert 'User: How can I improve?' in result
    
    def test_last_five_messages_only(self):
        """Test that only last 5 messages are included"""
        history = [
            {'role': 'user', 'content': 'Message 1'},
            {'role': 'assistant', 'content': 'Response 1'},
            {'role': 'user', 'content': 'Message 2'},
            {'role': 'assistant', 'content': 'Response 2'},
            {'role': 'user', 'content': 'Message 3'},
            {'role': 'assistant', 'content': 'Response 3'},
            {'role': 'user', 'content': 'Message 4'},
        ]
        result = format_conversation_history(history)
        
        # Should not include first messages
        assert 'Message 1' not in result
        assert 'Response 1' not in result
        
        # Should include last 5
        assert 'Message 2' in result
        assert 'Response 2' in result
        assert 'Message 3' in result
        assert 'Response 3' in result
        assert 'Message 4' in result
    
    def test_long_message_truncation(self):
        """Test that long messages are truncated"""
        long_content = 'A' * 600
        history = [
            {'role': 'user', 'content': long_content}
        ]
        result = format_conversation_history(history)
        
        # Should be truncated to 500 chars + "..."
        assert '...' in result
        assert len(result.split('User: ')[1]) <= 504
    
    def test_invalid_message_format(self):
        """Test handling of invalid message formats"""
        history = [
            {'role': 'user', 'content': 'Valid message'},
            'invalid_string',
            {'role': 'assistant'},  # Missing content
            {'content': 'Missing role'},  # Missing role
        ]
        result = format_conversation_history(history)
        
        # Should only include valid message
        assert 'User: Valid message' in result
        # Should not crash on invalid formats


class TestGenerateChatResponse:
    """Test chat response generation with mocked AI client"""
    
    @patch('app.chat_service.gemini_client.generate')
    def test_successful_response(self, mock_generate):
        """Test successful AI response generation"""
        mock_generate.return_value = "Here's how to improve your resume..."
        
        message = "How can I improve my ATS score?"
        context = {
            'job_title': 'Software Engineer',
            'scores': {'ats': 65}
        }
        
        result = generate_chat_response(message, context)
        
        assert result == "Here's how to improve your resume..."
        assert mock_generate.called
        
        # Verify the prompt includes all components
        call_args = mock_generate.call_args
        prompt = call_args.kwargs['prompt']
        assert SYSTEM_PROMPT in prompt
        assert 'ANALYSIS CONTEXT:' in prompt
        assert 'USER MESSAGE:' in prompt
        assert message in prompt
    
    @patch('app.chat_service.gemini_client.generate')
    def test_with_conversation_history(self, mock_generate):
        """Test response generation with conversation history"""
        mock_generate.return_value = "Based on our previous discussion..."
        
        message = "Tell me more"
        context = {'job_title': 'Developer'}
        history = [
            {'role': 'user', 'content': 'What are my gaps?'},
            {'role': 'assistant', 'content': 'Your gaps include Python.'}
        ]
        
        result = generate_chat_response(message, context, history)
        
        assert result == "Based on our previous discussion..."
        
        # Verify history is included in prompt
        call_args = mock_generate.call_args
        prompt = call_args.kwargs['prompt']
        assert 'CONVERSATION HISTORY:' in prompt
        assert 'What are my gaps?' in prompt
    
    @patch('app.chat_service.gemini_client.generate')
    def test_timeout_error_handling(self, mock_generate):
        """Test handling of timeout errors"""
        mock_generate.side_effect = Exception('Request timeout')
        
        message = "Help me"
        context = {}
        
        result = generate_chat_response(message, context)
        
        # Should return user-friendly timeout message
        assert 'taking longer than expected' in result.lower()
        assert 'try again' in result.lower()
    
    @patch('app.chat_service.gemini_client.generate')
    def test_connection_error_handling(self, mock_generate):
        """Test handling of connection errors"""
        mock_generate.side_effect = Exception('Connection refused')
        
        message = "Help me"
        context = {}
        
        result = generate_chat_response(message, context)
        
        # Should return user-friendly connection error message
        assert 'trouble connecting' in result.lower()
        assert 'try again' in result.lower()
    
    @patch('app.chat_service.gemini_client.generate')
    def test_generic_error_handling(self, mock_generate):
        """Test handling of generic errors"""
        mock_generate.side_effect = Exception('Unknown error')
        
        message = "Help me"
        context = {}
        
        result = generate_chat_response(message, context)
        
        # Should return generic error message
        assert 'encountered an error' in result.lower()
        assert 'try again' in result.lower()
    
    @patch('app.chat_service.gemini_client.generate')
    def test_model_configuration(self, mock_generate):
        """Test that correct model is used"""
        mock_generate.return_value = "Response"
        
        message = "Test"
        context = {}
        
        generate_chat_response(message, context)
        
        # Verify model parameter
        call_args = mock_generate.call_args
        assert 'model' in call_args.kwargs
        # Should use GEMINI_MODEL from environment
    
    @patch('app.chat_service.gemini_client.generate')
    def test_prompt_includes_guardrails(self, mock_generate):
        """Test that system prompt includes guardrails"""
        mock_generate.return_value = "Response"
        
        message = "Test"
        context = {}
        
        generate_chat_response(message, context)
        
        call_args = mock_generate.call_args
        prompt = call_args.kwargs['prompt']
        
        # Verify guardrails are present
        assert 'resume optimization assistant' in prompt.lower()
        assert 'SCOPE:' in prompt
        assert 'BOUNDARIES:' in prompt
        assert 'resume' in prompt.lower()
        assert 'career' in prompt.lower()

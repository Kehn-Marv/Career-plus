"""
Unit tests for Gemini client
Tests initialization, generation, error handling, and availability checks
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.gemini_client import GeminiClient, generate_text, check_ai_available


class TestGeminiClientInitialization:
    """Test Gemini client initialization"""
    
    @patch('app.gemini_client.genai.Client')
    def test_initialization_with_api_key(self, mock_client_class):
        """Test successful initialization with API key"""
        mock_client_instance = Mock()
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_api_key")
        
        assert client.api_key == "test_api_key"
        assert client.client == mock_client_instance
        mock_client_class.assert_called_once_with(api_key="test_api_key")
    
    @patch('app.gemini_client.genai.Client')
    @patch('app.gemini_client.GEMINI_API_KEY', 'env_api_key')
    def test_initialization_with_env_var(self, mock_client_class):
        """Test initialization using environment variable"""
        mock_client_instance = Mock()
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient()
        
        assert client.api_key == 'env_api_key'
        mock_client_class.assert_called_once_with(api_key='env_api_key')
    
    def test_initialization_without_api_key(self):
        """Test that initialization fails without API key"""
        with patch('app.gemini_client.GEMINI_API_KEY', ''):
            with pytest.raises(ValueError, match="GEMINI_API_KEY"):
                GeminiClient()


class TestGeminiClientGenerate:
    """Test text generation"""
    
    @patch('app.gemini_client.genai.Client')
    def test_successful_generation(self, mock_client_class):
        """Test successful text generation"""
        # Setup mocks
        mock_response = Mock()
        mock_response.text = "Generated response text"
        
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        result = client.generate(
            prompt="Test prompt",
            model="gemini-2.5-flash-lite",
            max_tokens=500,
            temperature=0.7
        )
        
        assert result == "Generated response text"
        assert mock_client_instance.models.generate_content.called
    
    @patch('app.gemini_client.genai.Client')
    def test_generation_with_whitespace(self, mock_client_class):
        """Test that response text is stripped"""
        mock_response = Mock()
        mock_response.text = "  Response with whitespace  \n"
        
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        result = client.generate(prompt="Test")
        
        assert result == "Response with whitespace"
    
    @patch('app.gemini_client.genai.Client')
    def test_generation_parameters(self, mock_client_class):
        """Test that generation parameters are passed correctly"""
        mock_response = Mock()
        mock_response.text = "Response"
        
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        client.generate(
            prompt="Test prompt",
            model="gemini-2.5-flash-lite",
            max_tokens=800,
            temperature=0.9
        )
        
        call_args = mock_client_instance.models.generate_content.call_args
        assert call_args.kwargs['model'] == "gemini-2.5-flash-lite"
        assert call_args.kwargs['contents'] == "Test prompt"
        
        # Check config
        config = call_args.kwargs['config']
        assert config.temperature == 0.9
        assert config.max_output_tokens == 800


class TestGeminiClientErrorHandling:
    """Test error handling"""
    
    @patch('app.gemini_client.genai.Client')
    def test_authentication_error(self, mock_client_class):
        """Test handling of authentication errors"""
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.side_effect = Exception("API key invalid")
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        
        with pytest.raises(Exception, match="authentication failed"):
            client.generate(prompt="Test")
    
    @patch('app.gemini_client.genai.Client')
    def test_rate_limit_error(self, mock_client_class):
        """Test handling of rate limit errors"""
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.side_effect = Exception("Rate limit exceeded")
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        
        with pytest.raises(Exception, match="rate limit"):
            client.generate(prompt="Test")
    
    @patch('app.gemini_client.genai.Client')
    def test_timeout_error(self, mock_client_class):
        """Test handling of timeout errors"""
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.side_effect = Exception("Request timeout")
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        
        with pytest.raises(Exception, match="timeout"):
            client.generate(prompt="Test")
    
    @patch('app.gemini_client.genai.Client')
    def test_content_filter_error(self, mock_client_class):
        """Test handling of content filtering"""
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.side_effect = Exception("Content filtered by safety")
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        
        with pytest.raises(Exception, match="filtered"):
            client.generate(prompt="Test")
    
    @patch('app.gemini_client.genai.Client')
    def test_generic_error(self, mock_client_class):
        """Test handling of generic errors"""
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.side_effect = Exception("Unknown error")
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        
        with pytest.raises(Exception, match="Gemini API error"):
            client.generate(prompt="Test")


class TestGeminiClientAvailability:
    """Test availability checking"""
    
    @patch('app.gemini_client.genai.Client')
    def test_availability_check_success(self, mock_client_class):
        """Test successful availability check"""
        mock_response = Mock()
        mock_response.text = "test response"
        
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        result = client.check_availability()
        
        assert result is True
    
    @patch('app.gemini_client.genai.Client')
    def test_availability_check_failure(self, mock_client_class):
        """Test availability check when service is unavailable"""
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.side_effect = Exception("Service unavailable")
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        result = client.check_availability()
        
        assert result is False
    
    @patch('app.gemini_client.genai.Client')
    def test_availability_check_empty_response(self, mock_client_class):
        """Test availability check with empty response"""
        mock_response = Mock()
        mock_response.text = ""
        
        mock_client_instance = Mock()
        mock_client_instance.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client_instance
        
        client = GeminiClient(api_key="test_key")
        result = client.check_availability()
        
        assert result is False


class TestConvenienceFunctions:
    """Test module-level convenience functions"""
    
    @patch('app.gemini_client.gemini_client')
    def test_generate_text(self, mock_client):
        """Test generate_text convenience function"""
        mock_client.generate.return_value = "Generated text"
        
        result = generate_text(
            prompt="Test prompt",
            model="gemini-2.5-flash-lite",
            max_tokens=500,
            temperature=0.7
        )
        
        assert result == "Generated text"
        mock_client.generate.assert_called_once_with(
            "Test prompt",
            "gemini-2.5-flash-lite",
            500,
            0.7,
            90
        )
    
    @patch('app.gemini_client.gemini_client', None)
    def test_generate_text_no_client(self):
        """Test generate_text when client is not initialized"""
        with pytest.raises(Exception, match="not initialized"):
            generate_text(prompt="Test")
    
    @patch('app.gemini_client.gemini_client')
    def test_check_ai_available(self, mock_client):
        """Test check_ai_available convenience function"""
        mock_client.check_availability.return_value = True
        
        result = check_ai_available()
        
        assert result is True
        mock_client.check_availability.assert_called_once()
    
    @patch('app.gemini_client.gemini_client', None)
    def test_check_ai_available_no_client(self):
        """Test check_ai_available when client is not initialized"""
        result = check_ai_available()
        assert result is False

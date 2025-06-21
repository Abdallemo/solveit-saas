export const mockFiles = [
  {
    name: "solution.ts",
    type: "typescript",
    isCode: true,
    content: `// TypeScript Solution
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

class FormValidator {
  private form: ContactForm;
  
  constructor(formData: ContactForm) {
    this.form = formData;
  }
  
  validate(): boolean {
    if (!this.form.name || this.form.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    
    if (!this.isValidEmail(this.form.email)) {
      throw new Error('Invalid email format');
    }
    
    if (!this.form.message || this.form.message.length < 10) {
      throw new Error('Message must be at least 10 characters');
    }
    
    return true;
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  }
}

export default FormValidator;`,
  },
  {
    name: "index.js",
    type: "javascript",
    isCode: true,
    content: `// Main JavaScript File
import FormValidator from './solution.ts';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const errorDiv = document.getElementById('error-messages');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        errorDiv.innerHTML = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            const validator = new FormValidator(formData);
            validator.validate();
            
            // Simulate API call
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showSuccess('Message sent successfully!');
                form.reset();
            } else {
                throw new Error('Failed to send message');
            }
            
        } catch (error) {
            showError(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
});

function showError(message) {
    const errorDiv = document.getElementById('error-messages');
    errorDiv.innerHTML = \`<div class="error">\${message}</div>\`;
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error-messages');
    errorDiv.innerHTML = \`<div class="success">\${message}</div>\`;
}`,
  },
  {
    name: "style.css",
    type: "css",
    isCode: true,
    content: `/* Contact Form Styles */
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #fecaca;
  margin-top: 1rem;
}

.success {
  color: #059669;
  background: #f0fdf4;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #bbf7d0;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .contact-form {
    padding: 1rem;
    margin: 1rem;
  }
}`,
  },
  {
    name: "main.py",
    type: "python",
    isCode: true,
    content: `# Python Backend Handler
from flask import Flask, request, jsonify
from flask_mail import Mail, Message
import os
from datetime import datetime

app = Flask(__name__)

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASS')

mail = Mail(app)

class ContactFormHandler:
    def __init__(self):
        self.required_fields = ['name', 'email', 'message']
    
    def validate_form_data(self, data):
        """Validate incoming form data"""
        errors = []
        
        for field in self.required_fields:
            if field not in data or not data[field].strip():
                errors.append(f"{field.capitalize()} is required")
        
        if 'email' in data:
            if not self.is_valid_email(data['email']):
                errors.append("Invalid email format")
        
        if 'message' in data and len(data['message'].strip()) < 10:
            errors.append("Message must be at least 10 characters long")
            
        return errors
    
    def is_valid_email(self, email):
        """Basic email validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def send_email(self, form_data):
        """Send email notification"""
        try:
            msg = Message(
                subject=f"New Contact Form Submission from {form_data['name']}",
                sender=app.config['MAIL_USERNAME'],
                recipients=['admin@yoursite.com']
            )
            
            msg.body = f"""
            New contact form submission:
            
            Name: {form_data['name']}
            Email: {form_data['email']}
            Message: {form_data['message']}
            
            Submitted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            mail.send(msg)
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

@app.route('/api/contact', methods=['POST'])
def handle_contact_form():
    """Handle contact form submissions"""
    handler = ContactFormHandler()
    
    try:
        data = request.get_json()
        
        # Validate form data
        errors = handler.validate_form_data(data)
        if errors:
            return jsonify({'errors': errors}), 400
        
        # Send email
        if handler.send_email(data):
            return jsonify({'message': 'Form submitted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send email'}), 500
            
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)`,
  },
  {
    name: "README.md",
    type: "markdown",
    isCode: false,
    content: `# Contact Form Fix - Solution Documentation

## Problem Description
The website's contact form stopped working, preventing users from submitting inquiries and feedback.

## Root Cause Analysis
After investigating the issue, I identified several problems:

1. **Frontend Validation Missing**: No client-side validation was implemented
2. **Backend Error Handling**: Server wasn't properly handling form submissions
3. **Email Configuration**: SMTP settings were misconfigured
4. **Security Issues**: Form was vulnerable to spam and injection attacks

## Solution Implementation

### 1. Frontend Improvements
- Added comprehensive form validation using TypeScript
- Implemented proper error handling and user feedback
- Enhanced UX with loading states and success messages
- Made the form responsive for mobile devices

### 2. Backend Fixes
- Created robust Python Flask handler for form processing
- Added server-side validation as a security layer
- Implemented proper email sending functionality
- Added error logging for debugging

### 3. Security Enhancements
- Input sanitization to prevent XSS attacks
- Rate limiting to prevent spam submissions
- CSRF protection implementation
- Email validation improvements

## Files Modified
- \`solution.ts\` - TypeScript validation class
- \`index.js\` - Main frontend logic
- \`style.css\` - Updated styling and responsive design
- \`main.py\` - Backend Flask application

## Testing Checklist
- [x] Form validation works correctly
- [x] Error messages display properly
- [x] Success confirmation appears
- [x] Email notifications are sent
- [x] Mobile responsiveness verified
- [x] Cross-browser compatibility tested

## Deployment Notes
1. Update environment variables for email configuration
2. Test SMTP settings in production
3. Monitor form submissions for the first 24 hours
4. Set up analytics tracking for form completion rates

## Future Improvements
- Add reCAPTCHA for additional spam protection
- Implement form analytics dashboard
- Add auto-responder functionality
- Create form submission database logging`,
  },
  {
    name: "package.json",
    type: "json",
    isCode: false,
    content: `{
  "name": "contact-form-fix",
  "version": "1.0.0",
  "description": "Fixed contact form with validation and error handling"
}`,
  },
  {
    name: "screenshot.png",
    type: "image",
    isCode: false,
    content: "Binary image file",
  },
  {
    name: "requirements.txt",
    type: "text",
    isCode: false,
    content: `Flask==2.3.2
Flask-Mail==0.9.1
python-dotenv==1.0.0`,
  },
]

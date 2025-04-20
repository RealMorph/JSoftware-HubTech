import React, { useState } from 'react';
import { useCommunication } from '../../core/hooks';

interface ContactFormProps {
  className?: string;
  onSuccess?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  className = '',
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: ''
  });
  
  const { sendEmail, isLoading, error } = useCommunication();
  
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setFormStatus({
        type: 'error',
        message: 'Please enter your name'
      });
      return false;
    }
    
    if (!email.trim()) {
      setFormStatus({
        type: 'error',
        message: 'Please enter your email'
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return false;
    }
    
    if (!message.trim()) {
      setFormStatus({
        type: 'error',
        message: 'Please enter a message'
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormStatus({
      type: 'loading',
      message: 'Sending your message...'
    });
    
    try {
      await sendEmail.contactForm(name, email, message);
      
      setFormStatus({
        type: 'success',
        message: 'Your message has been sent successfully!'
      });
      
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      setSubject('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: error || 'An error occurred while sending your message. Please try again.'
      });
    }
  };
  
  return (
    <div className={`contact-form ${className}`}>
      <h2>Contact Us</h2>
      <p>Fill out the form below and we'll get back to you as soon as possible.</p>
      
      {formStatus.type === 'success' && (
        <div className="form-status success">
          {formStatus.message}
        </div>
      )}
      
      {formStatus.type === 'error' && (
        <div className="form-status error">
          {formStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject (Optional)</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}; 
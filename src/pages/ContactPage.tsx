import React from 'react';
import { ContactForm } from '../components/contact/ContactForm';

const ContactPage: React.FC = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-info">
          <h1>Get in Touch</h1>
          <p>
            Have questions or need assistance? We're here to help! 
            Fill out the form and our team will get back to you as soon as possible.
          </p>
          
          <div className="contact-methods">
            <div className="contact-method">
              <h3>Email</h3>
              <p>support@yourcompany.com</p>
            </div>
            
            <div className="contact-method">
              <h3>Phone</h3>
              <p>+1 (555) 123-4567</p>
            </div>
            
            <div className="contact-method">
              <h3>Address</h3>
              <p>
                123 Business Avenue<br />
                Suite 100<br />
                San Francisco, CA 94103
              </p>
            </div>
          </div>
          
          <div className="business-hours">
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>
        
        <div className="contact-form-container">
          <ContactForm 
            onSuccess={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 
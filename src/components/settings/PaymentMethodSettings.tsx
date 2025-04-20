import React, { useState, useEffect } from 'react';
import { StripePaymentService, PaymentMethod, InvoiceItem } from '../../core/firebase/stripe-payment-service';

export const PaymentMethodSettings: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const stripeService = StripePaymentService.getInstance();
  
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);
        const [methodsData, invoicesData] = await Promise.all([
          stripeService.getPaymentMethods(),
          stripeService.getInvoices()
        ]);
        
        setPaymentMethods(methodsData);
        setInvoices(invoicesData);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentData();
  }, []);
  
  const handleAddPaymentMethod = async () => {
    try {
      setIsProcessing(true);
      
      // Create the customer portal session to add payment method
      const portalUrl = await stripeService.createCustomerPortalSession(
        `${window.location.origin}/settings?tab=payment`
      );
      
      // Redirect to customer portal
      window.location.href = portalUrl;
    } catch (err) {
      console.error('Error opening payment method portal:', err);
      setError('Failed to open payment setup. Please try again later.');
      setIsProcessing(false);
    }
  };
  
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    try {
      setIsProcessing(true);
      await stripeService.deletePaymentMethod(paymentMethodId);
      
      // Refresh payment methods
      const updatedMethods = await stripeService.getPaymentMethods();
      setPaymentMethods(updatedMethods);
      
      setIsProcessing(false);
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Failed to delete payment method. Please try again later.');
      setIsProcessing(false);
    }
  };
  
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true);
      await stripeService.setDefaultPaymentMethod(paymentMethodId);
      
      // Refresh payment methods
      const updatedMethods = await stripeService.getPaymentMethods();
      setPaymentMethods(updatedMethods);
      
      setIsProcessing(false);
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError('Failed to set default payment method. Please try again later.');
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return <div className="payment-settings loading">Loading payment information...</div>;
  }
  
  if (error) {
    return (
      <div className="payment-settings error">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="payment-settings">
      {/* Payment Methods Section */}
      <section className="payment-methods-section">
        <h2>Payment Methods</h2>
        
        {paymentMethods.length === 0 ? (
          <p className="no-payment-methods">You don't have any saved payment methods.</p>
        ) : (
          <ul className="payment-methods-list">
            {paymentMethods.map(method => (
              <li key={method.id} className="payment-method-item">
                {method.card && (
                  <div className="card-info">
                    <span className="card-brand">{method.card.brand}</span>
                    <span className="card-last4">•••• {method.card.last4}</span>
                    <span className="card-expiry">
                      Expires {method.card.expMonth}/{method.card.expYear}
                    </span>
                  </div>
                )}
                
                <div className="payment-method-actions">
                  <button
                    className="set-default-button"
                    onClick={() => handleSetDefaultPaymentMethod(method.id)}
                    disabled={isProcessing}
                  >
                    Set as Default
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={isProcessing}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <button
          className="add-payment-method-button"
          onClick={handleAddPaymentMethod}
          disabled={isProcessing}
        >
          Add Payment Method
        </button>
      </section>
      
      {/* Billing History Section */}
      <section className="billing-history-section">
        <h2>Billing History</h2>
        
        {invoices.length === 0 ? (
          <p className="no-invoices">You don't have any billing history yet.</p>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="invoice-row">
                  <td>{new Date(invoice.date * 1000).toLocaleDateString()}</td>
                  <td>{invoice.description}</td>
                  <td>${(invoice.amount / 100).toFixed(2)}</td>
                  <td>{invoice.status}</td>
                  <td>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-invoice"
                      >
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}; 
import React, { useState, useEffect } from 'react';
import { StripePaymentService, SubscriptionPlan, CustomerSubscription } from '../../core/firebase/stripe-payment-service';

export const SubscriptionSettings: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CustomerSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const stripeService = StripePaymentService.getInstance();
  
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        const [plansData, subscriptionData] = await Promise.all([
          stripeService.getSubscriptionPlans(),
          stripeService.getCurrentSubscription()
        ]);
        
        setPlans(plansData);
        setCurrentSubscription(subscriptionData);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, []);
  
  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(true);
      
      // Create the checkout session
      const sessionId = await stripeService.createCheckoutSession(
        planId,
        `${window.location.origin}/settings?tab=subscription&success=true`,
        `${window.location.origin}/settings?tab=subscription&canceled=true`
      );
      
      // Redirect to Stripe Checkout
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to start subscription process. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Create the customer portal session
      const portalUrl = await stripeService.createCustomerPortalSession(
        `${window.location.origin}/settings?tab=subscription`
      );
      
      // Redirect to customer portal
      window.location.href = portalUrl;
    } catch (err) {
      console.error('Error creating customer portal session:', err);
      setError('Failed to open subscription management. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await stripeService.cancelSubscription();
      
      // Refresh subscription data
      const subscriptionData = await stripeService.getCurrentSubscription();
      setCurrentSubscription(subscriptionData);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const handleResumeSubscription = async () => {
    try {
      setIsLoading(true);
      await stripeService.resumeSubscription();
      
      // Refresh subscription data
      const subscriptionData = await stripeService.getCurrentSubscription();
      setCurrentSubscription(subscriptionData);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error resuming subscription:', err);
      setError('Failed to resume subscription. Please try again later.');
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="subscription-settings loading">Loading subscription information...</div>;
  }
  
  if (error) {
    return (
      <div className="subscription-settings error">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Display current subscription if user has one
  if (currentSubscription) {
    const currentPlan = plans.find(plan => plan.id === currentSubscription.planId);
    
    return (
      <div className="subscription-settings">
        <h2>Current Subscription</h2>
        
        <div className="current-subscription">
          <div className="subscription-info">
            <h3>{currentPlan?.name || 'Subscription'}</h3>
            <p className="subscription-status">Status: {currentSubscription.status}</p>
            <p className="subscription-period">
              Current period ends: {new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
            </p>
            
            {currentSubscription.cancelAtPeriodEnd && (
              <div className="subscription-cancellation">
                <p className="cancellation-notice">
                  Your subscription is set to cancel at the end of the current billing period.
                </p>
                <button 
                  className="resume-button"
                  onClick={handleResumeSubscription}
                  disabled={isLoading}
                >
                  Resume Subscription
                </button>
              </div>
            )}
          </div>
          
          <div className="subscription-actions">
            <button 
              className="manage-button"
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              Manage Subscription
            </button>
            
            {!currentSubscription.cancelAtPeriodEnd && (
              <button 
                className="cancel-button"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Display available plans if user doesn't have a subscription
  return (
    <div className="subscription-settings">
      <h2>Choose a Subscription Plan</h2>
      
      <div className="subscription-plans">
        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="plan-price">
              ${plan.price / 100}/{plan.interval}
            </p>
            <p className="plan-description">{plan.description}</p>
            
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            <button 
              className="subscribe-button"
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 
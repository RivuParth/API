import express from 'express';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { authenticateToken } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: error.message || 'Error creating checkout session' });
  }
});

// Webhook handler for subscription events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          user.isSubscribed = subscription.status === 'active';
          await user.save();

          // Update or create subscription record
          await Subscription.findOneAndUpdate(
            { userId: user._id },
            {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            { upsert: true }
          );
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSubscription.customer as string;
        const subscribedUser = await User.findOne({ stripeCustomerId: deletedCustomerId });

        if (subscribedUser) {
          subscribedUser.isSubscribed = false;
          await subscribedUser.save();

          await Subscription.findOneAndUpdate(
            { userId: subscribedUser._id },
            { status: 'canceled' }
          );
        }
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    // Update local subscription status
    subscription.status = 'canceled';
    await subscription.save();

    // Update user subscription status
    user.isSubscribed = false;
    await user.save();

    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error cancelling subscription' });
  }
});

// Get current subscription
router.get('/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.status(200).json({
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive: subscription.status === 'active',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error retrieving subscription details' });
  }
});

export default router;
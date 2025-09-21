import { Request, Response } from 'express';
import {
  confirmDelivery,
  burnNFT,
  completeDeliveryConfirmation,
  getDeliveryConfirmation,
  getUserDeliveryConfirmations,
  DeliveryConfirmationInput
} from '../services/deliveryConfirmationService';

/**
 * Confirm delivery and create delivery confirmation record
 */
export async function confirmDeliveryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, userId, rating, comment, images, hasComplaint, qualityRating } = req.body;

    // Debug logging
    console.log('Delivery confirmation request:', {
      orderId,
      userId,
      rating,
      comment,
      hasComplaint,
      qualityRating
    });

    if (!orderId || !userId) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'orderId and userId are required'
      });
      return;
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({
        error: 'Invalid rating',
        details: 'Rating must be between 1 and 5'
      });
      return;
    }

    // Validate quality rating if provided
    if (qualityRating && !['Good', 'Bad'].includes(qualityRating)) {
      res.status(400).json({
        error: 'Invalid quality rating',
        details: 'Quality rating must be "Good" or "Bad"'
      });
      return;
    }

    const input: DeliveryConfirmationInput = {
      orderId,
      userId,
      rating,
      comment,
      images: images || [],
      hasComplaint: hasComplaint || false,
      qualityRating
    };

    const result = await confirmDelivery(input);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({
      error: 'Failed to confirm delivery',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Burn NFT after delivery confirmation
 */
export async function burnNFTHandler(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'orderId and userId are required'
      });
      return;
    }

    const result = await burnNFT(orderId, userId);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error burning NFT:', error);
    res.status(500).json({
      error: 'Failed to burn NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Complete delivery confirmation process
 */
export async function completeDeliveryConfirmationHandler(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'orderId and userId are required'
      });
      return;
    }

    const result = await completeDeliveryConfirmation(orderId, userId);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error completing delivery confirmation:', error);
    res.status(500).json({
      error: 'Failed to complete delivery confirmation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get delivery confirmation by order ID and user ID
 */
export async function getDeliveryConfirmationHandler(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, userId } = req.params;

    if (!orderId || !userId) {
      res.status(400).json({
        error: 'Missing required parameters',
        details: 'orderId and userId are required'
      });
      return;
    }

    const result = await getDeliveryConfirmation(orderId, userId);

    if (!result) {
      res.status(404).json({
        error: 'Delivery confirmation not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting delivery confirmation:', error);
    res.status(500).json({
      error: 'Failed to get delivery confirmation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get all delivery confirmations for a user
 */
export async function getUserDeliveryConfirmationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        error: 'Missing required parameter',
        details: 'userId is required'
      });
      return;
    }

    const result = await getUserDeliveryConfirmations(userId);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting user delivery confirmations:', error);
    res.status(500).json({
      error: 'Failed to get user delivery confirmations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

import { NextResponse } from 'next/server';
import { insertReview, getAllReviews } from '@/lib/database';

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
    // In development, avoid returning 500 to prevent UI breakage; return empty list so Testimonials can render.
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API][reviews] Returning empty list in development due to error:', errorMessage);
      return NextResponse.json([]);
    }

    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, rating, comment } = body;

    console.log('📝 Received review submission:', { name, email, rating, commentLength: comment?.length });

    // Validate required fields
    if (!name || !email || !rating || !comment) {
      console.warn('⚠️ Missing required fields:', { 
        hasName: !!name, 
        hasEmail: !!email, 
        hasRating: !!rating, 
        hasComment: !!comment 
      });
      return NextResponse.json(
        { error: 'Missing required fields: name, email, rating, and comment are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      console.warn('⚠️ Invalid rating:', rating);
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('⚠️ Invalid email format:', email);
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, inserting review into database...');
    const review = await insertReview({ name, email, rating, comment });
    console.log('✅ Review created successfully:', { id: review.id, status: review.status });

    // Notify admin about new review (non-blocking)
    try {
      // In development, use localhost; in production, use the configured base URL
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
      console.log('📧 Sending review notification email using baseUrl:', baseUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const resp = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review_notification',
          reviewId: review.id,
          name: review.name,
          email: review.email,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      try {
        const json = await resp.json()
        if (!resp.ok || json?.success === false) {
          console.error('⚠️ Review notification email failed:', resp.status, json)
        } else {
          console.log('✅ Review notification email sent successfully')
        }
      } catch (e) {
        const text = await resp.text().catch(() => null)
        console.error('⚠️ Failed to parse send-email response:', resp.status, text)
      }
    } catch (err) {
      console.error('⚠️ Failed to send review notification (non-blocking):', err)
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create review';
    let statusCode = 500;
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Check for database connection errors
      if (errorStr.includes('econnrefused') || errorStr.includes('connect') || errorStr.includes('timeout')) {
        errorMessage = 'Database connection failed. Please try again in a moment.';
        statusCode = 503;
        errorCode = 'DB_CONNECTION_FAILED';
      } 
      // Check for table not found
      else if (errorStr.includes('no such table') || errorStr.includes('ER_NO_SUCH_TABLE') || errorStr.includes("doesn't exist")) {
        errorMessage = 'Review system is not properly configured. Please contact support.';
        statusCode = 503;
        errorCode = 'TABLE_NOT_FOUND';
      }
      // Check for other database errors
      else if (errorStr.includes('er_')) {
        errorMessage = 'Database error. Please try again or contact support.';
        statusCode = 500;
        errorCode = 'DATABASE_ERROR';
      }
      // Check for JSON parse errors
      else if (errorStr.includes('json')) {
        errorMessage = 'Invalid request format. Please try again.';
        statusCode = 400;
        errorCode = 'INVALID_JSON';
      }
      // Use the actual error message if available
      else {
        errorMessage = error.message || errorMessage;
        errorCode = 'API_ERROR';
      }
    }
    
    const errorResponse = { 
      error: errorMessage,
      errorCode,
      ...(process.env.NODE_ENV === 'development' && { details: String(error) })
    };
    
    console.error('❌ Returning error response:', errorResponse);
    
    return NextResponse.json(
      errorResponse,
      { status: statusCode }
    );
  }
}

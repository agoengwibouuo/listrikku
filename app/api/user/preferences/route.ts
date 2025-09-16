import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, UserPreferences } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';

// GET - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const preferences = await executeQuery<UserPreferences>(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [user.id]
    );

    if (preferences.length === 0) {
      // Create default preferences if not exists
      await executeQuery(
        `INSERT INTO user_preferences (user_id, theme, language, currency, timezone, notifications_enabled, email_notifications, push_notifications)
         VALUES (?, 'system', 'id', 'IDR', 'Asia/Jakarta', TRUE, TRUE, TRUE)`,
        [user.id]
      );

      const newPreferences = await executeQuery<UserPreferences>(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [user.id]
      );

      return NextResponse.json({
        success: true,
        preferences: newPreferences[0]
      });
    }

    return NextResponse.json({
      success: true,
      preferences: preferences[0]
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { 
      theme, 
      language, 
      currency, 
      timezone, 
      notifications_enabled, 
      email_notifications, 
      push_notifications 
    } = await request.json();

    // Validate theme
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json(
        { success: false, message: 'Invalid theme value' },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const existingPreferences = await executeQuery<UserPreferences>(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [user.id]
    );

    if (existingPreferences.length === 0) {
      // Create new preferences
      await executeQuery(
        `INSERT INTO user_preferences (user_id, theme, language, currency, timezone, notifications_enabled, email_notifications, push_notifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          theme || 'system',
          language || 'id',
          currency || 'IDR',
          timezone || 'Asia/Jakarta',
          notifications_enabled !== undefined ? notifications_enabled : true,
          email_notifications !== undefined ? email_notifications : true,
          push_notifications !== undefined ? push_notifications : true
        ]
      );
    } else {
      // Update existing preferences
      await executeQuery(
        `UPDATE user_preferences 
         SET theme = ?, language = ?, currency = ?, timezone = ?, 
             notifications_enabled = ?, email_notifications = ?, push_notifications = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          theme || 'system',
          language || 'id',
          currency || 'IDR',
          timezone || 'Asia/Jakarta',
          notifications_enabled !== undefined ? notifications_enabled : true,
          email_notifications !== undefined ? email_notifications : true,
          push_notifications !== undefined ? push_notifications : true,
          user.id
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

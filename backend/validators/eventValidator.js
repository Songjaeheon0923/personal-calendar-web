/**
 * Event Validation Schemas
 * Using Joi for input validation
 */

import Joi from 'joi';

/**
 * Event creation validation schema
 */
export const eventSchema = Joi.object({
  id: Joi.string().optional(),
  user_id: Joi.string().default('default-user'),
  calendar_id: Joi.string().optional(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(2000).allow('').optional(),
  location: Joi.string().max(255).allow('').optional(),
  start_datetime: Joi.string().isoDate().required(),
  end_datetime: Joi.string().isoDate().required(),
  timezone: Joi.string().default('Asia/Seoul'),
  is_all_day: Joi.boolean().default(false),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  category: Joi.string().max(100).allow('').optional(),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
  url: Joi.string().uri().allow('').optional(),
  status: Joi.string().valid('confirmed', 'tentative', 'cancelled').default('confirmed'),
  visibility: Joi.string().valid('public', 'private', 'default').default('default'),
  reminders: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('relative', 'absolute').required(),
      minutes_before: Joi.when('type', {
        is: 'relative',
        then: Joi.number().min(0).max(40320).required(), // Max 4 weeks
        otherwise: Joi.optional()
      }),
      reminder_time: Joi.when('type', {
        is: 'absolute',
        then: Joi.string().isoDate().required(),
        otherwise: Joi.optional()
      }),
      method: Joi.string().valid('popup', 'email', 'sms').default('popup')
    })
  ).default([]),
  attachments: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
      size: Joi.number().optional(),
      type: Joi.string().optional()
    })
  ).default([])
}).custom((value, helpers) => {
  // Custom validation: end_datetime must be after start_datetime
  const start = new Date(value.start_datetime);
  const end = new Date(value.end_datetime);
  
  if (end <= start) {
    return helpers.error('any.custom', { 
      message: 'End date/time must be after start date/time' 
    });
  }
  
  return value;
});

/**
 * Event update validation schema (all fields optional)
 */
export const eventUpdateSchema = Joi.object({
  user_id: Joi.string().default('default-user'),
  calendar_id: Joi.string().optional(),
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(2000).allow('').optional(),
  location: Joi.string().max(255).allow('').optional(),
  start_datetime: Joi.string().isoDate().optional(),
  end_datetime: Joi.string().isoDate().optional(),
  timezone: Joi.string().optional(),
  is_all_day: Joi.boolean().optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  category: Joi.string().max(100).allow('').optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  url: Joi.string().uri().allow('').optional(),
  status: Joi.string().valid('confirmed', 'tentative', 'cancelled').optional(),
  visibility: Joi.string().valid('public', 'private', 'default').optional(),
  is_cancelled: Joi.boolean().optional(),
  reminders: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('relative', 'absolute').required(),
      minutes_before: Joi.when('type', {
        is: 'relative',
        then: Joi.number().min(0).max(40320).required(),
        otherwise: Joi.optional()
      }),
      reminder_time: Joi.when('type', {
        is: 'absolute',
        then: Joi.string().isoDate().required(),
        otherwise: Joi.optional()
      }),
      method: Joi.string().valid('popup', 'email', 'sms').default('popup')
    })
  ).optional(),
  attachments: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
      size: Joi.number().optional(),
      type: Joi.string().optional()
    })
  ).optional()
}).custom((value, helpers) => {
  // Custom validation for date range if both dates are provided
  if (value.start_datetime && value.end_datetime) {
    const start = new Date(value.start_datetime);
    const end = new Date(value.end_datetime);
    
    if (end <= start) {
      return helpers.error('any.custom', { 
        message: 'End date/time must be after start date/time' 
      });
    }
  }
  
  return value;
});

/**
 * Validate event creation data
 */
export function validateEvent(data) {
  return eventSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

/**
 * Validate event update data
 */
export function validateEventUpdate(data) {
  return eventUpdateSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

/**
 * Date range validation schema
 */
export const dateRangeSchema = Joi.object({
  start: Joi.string().isoDate().required(),
  end: Joi.string().isoDate().required(),
  user_id: Joi.string().default('default-user'),
  calendar_id: Joi.string().optional()
}).custom((value, helpers) => {
  const start = new Date(value.start);
  const end = new Date(value.end);
  
  if (end <= start) {
    return helpers.error('any.custom', { 
      message: 'End date must be after start date' 
    });
  }
  
  // Limit range to maximum 1 year
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (end - start > oneYear) {
    return helpers.error('any.custom', { 
      message: 'Date range cannot exceed 1 year' 
    });
  }
  
  return value;
});

/**
 * Validate date range query
 */
export function validateDateRange(data) {
  return dateRangeSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}
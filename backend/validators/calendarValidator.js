/**
 * Calendar Validation Schemas
 */

import Joi from 'joi';

/**
 * Calendar creation validation schema
 */
export const calendarSchema = Joi.object({
  id: Joi.string().optional(),
  user_id: Joi.string().default('default-user'),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  timezone: Joi.string().default('Asia/Seoul'),
  is_default: Joi.boolean().default(false),
  is_visible: Joi.boolean().default(true),
  is_shared: Joi.boolean().default(false),
  permissions: Joi.object().default({})
});

/**
 * Calendar update validation schema
 */
export const calendarUpdateSchema = Joi.object({
  user_id: Joi.string().default('default-user'),
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  timezone: Joi.string().optional(),
  is_default: Joi.boolean().optional(),
  is_visible: Joi.boolean().optional(),
  is_shared: Joi.boolean().optional(),
  permissions: Joi.object().optional()
});

export function validateCalendar(data) {
  return calendarSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

export function validateCalendarUpdate(data) {
  return calendarUpdateSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}
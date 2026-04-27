const { createClient } = require('@supabase/supabase-js');
const config = require('./index');
const logger = require('../utils/logger');

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    if (!config.supabase.url || !config.supabase.serviceKey) {
      logger.warn('Supabase credentials not configured — database calls will fail');
      return null;
    }
    supabase = createClient(config.supabase.url, config.supabase.serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

module.exports = { getSupabaseClient };

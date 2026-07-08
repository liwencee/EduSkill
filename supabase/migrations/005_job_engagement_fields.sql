-- Skillora — Job Engagement Terms
-- Migration: 005_job_engagement_fields.sql
--
-- Adds rate_type and engagement_duration to job_listings so employers
-- (especially schools/NGOs hiring teachers) can specify exactly how
-- pay is structured and how long the engagement runs.

alter table job_listings
  add column if not exists rate_type          text,   -- hourly | daily | weekly | monthly | per_term | fixed
  add column if not exists engagement_duration text;  -- e.g. "1 School Term", "Ongoing", "3 Months"

comment on column job_listings.rate_type is
  'How the compensation is structured: hourly, daily, weekly, monthly, per_term, or fixed (one-off).';

comment on column job_listings.engagement_duration is
  'How long the engagement lasts, e.g. "1 School Term", "3 Months", "Ongoing / Permanent".';

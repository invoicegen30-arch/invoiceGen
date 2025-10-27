-- Add USD to Currency enum
ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'USD';

-- Note: AUD will remain in database enum but won't be accessible through Prisma schema
-- Any existing AUD records will need to be updated manually if they exist


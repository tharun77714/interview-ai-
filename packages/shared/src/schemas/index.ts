import { z } from 'zod';

export const placeholderSchema = z.object({
  status: z.string(),
});

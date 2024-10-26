import z from 'zod';


// Backend 
export const signUpInput = z.object({
    username: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6)
})

export const signInInput = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    published: z.boolean().optional()
})

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    published: z.boolean().optional(),
    id: z.string()
})


// Frontend
export type UpdateBlogInput = z.infer<typeof updateBlogInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>
export type SignInInput = z.infer<typeof signInInput>
export type SignUpInput = z.infer<typeof signUpInput>
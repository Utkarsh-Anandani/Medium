import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify, decode } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "utkarsh_anandani_medium";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// MIDDLEWARE
blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";

  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);
    console.log(authHeader);

    const view = decode(authHeader);
    console.log(view);

    if (user) {
      c.set("userId", user.id as string);
      await next();
    } else {
      c.status(403);
      return c.json({
        message: "Not Authenticated",
      });
    }
  } catch (error: any) {
    c.status(403);
    return c.json({ error: error.message });
  }
});

// ROUTES
blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);

  if(!success) {
    c.status(411);
    return c.json({ message: "Incorrect Inputs" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const authorId = c.get("userId");

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      },
    });

    return c.json({
      id: blog.id,
    });
  } catch (error: any) {
    c.status(403);
    return c.json({
      error: error.message,
    });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);

  if(!success) {
    c.status(411);
    return c.json({ message: "Incorrect Inputs" })
  }
  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    return c.json({
      id: blog.id,
    });
  } catch (error: any) {
    c.status(403);
    return c.json({
      error: error.message,
    });
  }
});


blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany();

    return c.json({
      blogs,
    });
  } catch (error: any) {
    c.status(403);
    return c.json({
      error: error.message,
    });
  }
});


blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id: body.id,
      },
    });

    return c.json({
      blog,
    });
  } catch (error: any) {
    c.status(403);
    return c.json({
      error: error.message,
    });
  }
});



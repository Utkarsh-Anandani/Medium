import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify, decode } from "hono/jwt";
import { signUpInput, signInInput } from "utkarsh_anandani_medium";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signUpInput.safeParse(body);

  if(!success) {
    c.status(411);
    return c.json({ message: "Incorrect Inputs" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());


  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        password: body.password,
      },
    });

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({ jwt: token });
  } catch (error) {
    c.status(403);
    return c.json({ response: "Error while signing up", error });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const { success } = signInInput.safeParse(body);

  if(!success) {
    c.status(411);
    return c.json({ message: "Incorrect Inputs" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });
  
    if (!user) {
      c.status(403);
      return c.json({ error: "User not Found!!!" });
    }
  
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  
    return c.json({jwt: token});
  } catch (error) {
    c.status(403);
    return c.json({ response: "Error while signing up", error });
  }
});

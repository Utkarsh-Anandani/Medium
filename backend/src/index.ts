import { Hono } from "hono";
import { sign, verify, decode } from "hono/jwt";
import { userRouter }  from "./routes/user";
import { blogRouter }  from "./routes/blog";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);


app.use("/api/v1/blog/*", async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1] || "";

  const response = await verify(token, c.env.JWT_SECRET);

  if (response.id) {
    await next();
  } else {
    c.status(403);
    return c.json({
      error: "Unauthorized",
    });
  }
});

app.get('/', (c) => {
  return c.text("Hello")
})

export default app;

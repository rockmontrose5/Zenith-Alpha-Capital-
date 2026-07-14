import { Router } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    authorName: p.authorName,
    category: p.category,
    tags: p.tags ?? [],
    published: p.published,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.published, true));

    res.json(posts.map(formatPost));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const id = parseInt(rawId, 10);

    const [post] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, id))
      .limit(1);

    if (!post) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(formatPost(post));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      authorName,
      category,
      tags,
      published,
    } = req.body;

    const [post] = await db
      .insert(blogPostsTable)
      .values({
        title,
        slug,
        excerpt,
        content,
        coverImage,
        authorName,
        category,
        tags: tags ?? [],
        published: published ?? false,
      })
      .returning();

    res.status(201).json(formatPost(post));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const id = parseInt(rawId, 10);

    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      authorName,
      category,
      tags,
      published,
    } = req.body;

    const [post] = await db
      .update(blogPostsTable)
      .set({
        title,
        slug,
        excerpt,
        content,
        coverImage,
        authorName,
        category,
        tags,
        published,
      })
      .where(eq(blogPostsTable.id, id))
      .returning();

    if (!post) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(formatPost(post));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const id = parseInt(rawId, 10);

    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

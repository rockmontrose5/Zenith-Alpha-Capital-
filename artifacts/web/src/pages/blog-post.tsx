import { useListBlogPosts } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();

  const { data: posts, isLoading } = useListBlogPosts();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading article...</div>;
  }

  const post = posts?.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Link href="/blog" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Insights
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            Z
          </div>
          <span className="font-semibold text-xl tracking-tight">Zenith Alpha</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6">
        <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-8 text-sm">
          <ArrowLeft size={16} /> Back to Insights
        </Link>

        <article className="space-y-8">
          <header className="space-y-4 border-b border-border pb-8">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="text-primary uppercase tracking-wider font-medium">{post.category ?? "Analysis"}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>By {post.authorName}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{post.title}</h1>
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
          </header>

          {post.coverImage && (
            <div className="w-full aspect-[21/9] bg-muted rounded-lg overflow-hidden my-8">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </div>
  );
}

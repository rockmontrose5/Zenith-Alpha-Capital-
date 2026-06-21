import { useListBlogPosts } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function Blog() {
  const { data: posts, isLoading } = useListBlogPosts();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading articles...</div>;
  }

  const publishedPosts = posts?.filter(p => p.published) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            Z
          </div>
          <span className="font-semibold text-xl tracking-tight">Zenith Alpha</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-8 py-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Insights & Analysis</h1>
          <p className="text-lg text-muted-foreground">Expert perspectives on markets, wealth management, and global economics.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {publishedPosts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="bg-card border-border h-full hover:border-primary/50 transition-colors cursor-pointer flex flex-col group overflow-hidden">
                {post.coverImage && (
                  <div className="h-48 w-full bg-muted overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="uppercase tracking-wider text-primary">{post.category || 'Market Update'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-muted-foreground text-sm">
                  {post.excerpt}
                </CardContent>
              </Card>
            </Link>
          ))}
          {publishedPosts.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No articles published yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useListBlogPosts, useCreateBlogPost, useDeleteBlogPost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListBlogPostsQueryKey } from "@workspace/api-client-react";
import { Trash2, Plus, Edit } from "lucide-react";

export default function AdminBlog() {
  const { data: posts, isLoading } = useListBlogPosts();
  const deletePost = useDeleteBlogPost();
  const createPost = useCreateBlogPost();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateMock = async () => {
    try {
      await createPost.mutateAsync({
        data: {
          title: "New Market Update",
          slug: "new-market-update-" + Date.now(),
          excerpt: "Summary of the current market trends.",
          content: "<p>Full content goes here...</p>",
          authorName: "Admin",
          category: "Market Update",
          published: false,
          tags: ["markets", "update"]
        }
      });
      toast({ title: "Created", description: "Draft post created." });
      queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePost.mutateAsync({ id });
      toast({ title: "Deleted", description: "Post removed." });
      queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading posts...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Blog Posts</h1>
        <Button onClick={handleCreateMock} disabled={createPost.isPending}>
          <Plus size={16} className="mr-2" /> New Post
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts?.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-xs text-muted-foreground">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {post.published ? (
                        <span className="text-green-500">Published</span>
                      ) : (
                        <span className="text-yellow-500">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletePost.isPending}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!posts?.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No blog posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

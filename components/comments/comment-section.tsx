import { getComments } from "@/lib/actions";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";

export async function CommentSection({ postId }: { postId: number }) {
  const comments = await getComments(postId);

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-10">
      <h2 className="text-xl font-serif font-bold mb-6">
        评论 ({comments.length})
      </h2>
      <CommentForm postId={postId} />
      <CommentList comments={comments} postId={postId} />
    </div>
  );
}

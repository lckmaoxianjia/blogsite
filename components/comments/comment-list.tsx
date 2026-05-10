import type { Comment } from "@prisma/client";
import { CommentCard } from "./comment-card";

type CommentWithReplies = Comment & { replies: Comment[] };

export function CommentList({
  comments,
  postId,
}: {
  comments: CommentWithReplies[];
  postId: string;
}) {
  if (comments.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
        暂无评论，来说两句吧
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {comments.map((comment) => (
        <div key={comment.id}>
          <CommentCard comment={comment} postId={postId} />
          {comment.replies.length > 0 && (
            <div className="ml-8 mt-4 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

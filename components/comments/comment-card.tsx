import type { Comment } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { createHash } from "crypto";
import { ReplyButton } from "./comment-form";

function gravatarUrl(email: string | null, size = 40): string {
  if (!email) return `https://www.gravatar.com/avatar/?d=mp&s=${size}`;
  const hash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
}

export function CommentCard({
  comment,
  postId,
  isReply = false,
}: {
  comment: Comment;
  postId: string;
  isReply?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <img
        src={gravatarUrl(comment.authorEmail)}
        alt={comment.authorName}
        className="w-8 h-8 rounded-full mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.authorName}</span>
          {comment.authorWebsite ? (
            <a
              href={comment.authorWebsite}
              target="_blank"
              rel="nofollow noopener"
              className="text-xs text-accent hover:underline"
            >
              {comment.authorWebsite
                .replace(/^https?:\/\//, "")
                .replace(/\/$/, "")}
            </a>
          ) : null}
          <span className="text-xs text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment.content}
        </p>
        {!isReply && <ReplyButton postId={postId} parentId={comment.id} />}
      </div>
    </div>
  );
}

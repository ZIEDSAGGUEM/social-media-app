"use client";

import { likeStory } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useOptimistic, useState } from "react";

const StoryInteraction = ({
  storyId,
  likes,
}: {
  storyId: number;
  likes: string[];
}) => {
  const { isLoaded, userId } = useAuth();
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: userId ? likes.includes(userId) : false,
  });

  const [optimisticLike, switchOptimisticLike] = useOptimistic(
    likeState,
    (state) => ({
      likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
      isLiked: !state.isLiked,
    })
  );

  const likeAction = async () => {
    switchOptimisticLike("");
    try {
      await likeStory(storyId); // Make sure this function returns a Promise
      setLikeState((state) => ({
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) {
      // Handle error if needed
    }
  };
  console.log(likeState);
  return (
    <div className="flex items-center justify-between text-sm my-4 ">
      <div className="flex gap-8">
        {/* Like Section */}
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl z-50">
          <button
            onClick={likeAction}
            // Call likeAction directly on click
          >
            <Image
              src={optimisticLike.isLiked ? "/liked.png" : "/like.png"}
              width={16}
              height={16}
              alt="Like button"
              className="cursor-pointer"
            />
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {optimisticLike.likeCount}
            <span className="hidden md:inline"> Likes</span>
          </span>
        </div>

        {/* Comment Section */}
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <Image
            src="/comment.png"
            width={16}
            height={16}
            alt="Comment button"
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Share Section */}
    </div>
  );
};

export default StoryInteraction;

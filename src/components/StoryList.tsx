"use client";

import { addStory, getStoryLikes, likeStory, toggleLike } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Story, User } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Suspense, useEffect, useOptimistic, useState } from "react";
import StoryInteraction from "./StoryInteraction"; // Adjust the path as necessary

type StoryWithUser = Story & {
  user: User;
} & {
  likes: { userId: string }[]; // Change to an array of objects with userId
};

const StoryList = ({
  stories,
  userId,
}: {
  stories: StoryWithUser[];
  userId: string;
}) => {
  const [storyList, setStoryList] = useState(stories);

  const [img, setImg] = useState<any>();
  const [selectedStory, setSelectedStory] = useState<StoryWithUser | null>(
    null
  );
  const [currentLikesCount, setCurrentLikesCount] = useState(0);
  const { user, isLoaded } = useUser();

  const add = async () => {
    if (!img?.secure_url) return;

    addOptimisticStory({
      id: Math.random(),
      img: img.secure_url,
      createdAt: new Date(Date.now()),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: userId,
      user: {
        id: userId,
        username: "Sending...",
        avatar: user?.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(Date.now()),
      },
      likes: [], // Initialize likes as an empty array
    });

    try {
      const createdStory = await addStory(img.secure_url);
      setStoryList((prev) => [createdStory! as StoryWithUser, ...prev]);
      setImg(null);
    } catch (err) {}
  };

  const [optimisticStories, addOptimisticStory] = useOptimistic(
    storyList,
    (state, value: StoryWithUser) => [value, ...state]
  );
  const handleToggleLike = async (storyId: number) => {
    try {
      const updatedLikesCount = await toggleLike(storyId);
      updateStoryLikes(storyId, updatedLikesCount);
    } catch (error) {
      console.error("Error liking/unliking story:", error);
    }
  };

  console.log(selectedStory);

  // Update story likes count in the local state after toggling
  const updateStoryLikes = (storyId: number, updatedLikesCount: number) => {
    setStoryList((prevStories) =>
      prevStories.map((story) =>
        story.id === storyId
          ? {
              ...story,
              likesCount: updatedLikesCount, // Update likes count
            }
          : story
      )
    );
  };
  useEffect(() => {
    const fetchLikes = async () => {
      if (selectedStory?.id) {
        const likes = await getStoryLikes(selectedStory.id);
        setCurrentLikesCount(likes.length);
        console.log(likes.length); // Log the likes length instead of currentLikesCount
      }
    };

    fetchLikes();
  }, [selectedStory?.id]);
  return (
    <>
      <CldUploadWidget
        uploadPreset="social"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          return (
            <div className="flex flex-col items-center gap-2 cursor-pointer relative">
              <Image
                src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
                alt=""
                width={80}
                height={80}
                className="w-20 h-20 rounded-full ring-2 object-cover"
                onClick={() => open()}
              />
              {img ? (
                <form action={add}>
                  <button className="text-xs bg-blue-500 p-1 rounded-md text-white">
                    Send
                  </button>
                </form>
              ) : (
                <span className="font-medium">Add a Story</span>
              )}
              <div className="absolute text-6xl text-gray-200 top-1">+</div>
            </div>
          );
        }}
      </CldUploadWidget>

      {/* STORY */}
      {optimisticStories.map((story) => (
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          key={story.id}
          onClick={() => setSelectedStory(story)}
        >
          <Image
            src={story.img || "/noAvatar.png"}
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">
            {story.user.name || story.user.username}
          </span>
        </div>
      ))}

      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          {/* Progress bar at the top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-[5s]"
              style={{ width: "100%" }}
            ></div>
          </div>

          {/* Story content container */}
          <div className="relative w-full max-w-3xl h-full flex flex-col items-center justify-center p-4">
            {/* Top bar: avatar, username, close button */}
            <div className="absolute top-5 left-0 w-full px-5 flex items-center justify-between text-white">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStory.user.avatar || "/noAvatar.png"}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                <span className="font-semibold text-lg">
                  {selectedStory.user.name || selectedStory.user.username}
                </span>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedStory(null)}
                className="text-white p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Story Image */}
            <div className="relative w-full h-96 min-h-[80vh] flex items-center justify-center overflow-hidden rounded-lg shadow-lg mt-12">
              <Image
                src={selectedStory.img || "/noImage.png"}
                alt="Story Image"
                layout="fill"
                className="object-cover"
              />
            </div>

            {/* Story Interaction: Like and Comment */}
            <div className="flex items-center justify-between text-sm mt-6 w-full px-5">
              <div className="flex gap-8">
                {/* Like Section */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-md">
                  <button
                    onClick={() => handleToggleLike(selectedStory.id)}
                    className="flex items-center text-sm text-gray-700 hover:text-blue-500 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    Like
                  </button>
                  <span className="text-gray-500">
                    {selectedStory.userId === user?.id
                      ? currentLikesCount + " " + "Likes"
                      : ""}
                  </span>
                </div>

                {/* Comment Section */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-md">
                  <Image
                    src="/comment.png"
                    width={20}
                    height={20}
                    alt="Comment button"
                    className="cursor-pointer"
                  />
                  <span className="text-gray-500">Comment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryList;

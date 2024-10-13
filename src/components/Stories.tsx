import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import StoryList from "./StoryList";
import { Story } from "@prisma/client";

// Define a type that matches the structure of the user returned by Prisma
type PrismaUser = {
  id: string;
  username: string;
  avatar: string | null;
  cover: string | null;
  name: string | null;
  surname: string | null;
  description: string | null;
  city: string | null;
  school: string | null;
  work: string | null;
  website: string | null;
  createdAt: Date;
};

// Adjust StoryWithUser type to use PrismaUser instead of Clerk's User
type StoryWithUser = Story & {
  user: PrismaUser;
  likes: { userId: string }[];
};

const Stories = async () => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) return null;

  // Fetch stories and include user and other relevant fields
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
      OR: [
        {
          user: {
            followers: {
              some: {
                followingId: currentUserId,
                followerId: { not: currentUserId },
              },
            },
          },
        },
        {
          userId: currentUserId,
        },
      ],
    },
    include: {
      user: true,
    },
  });

  // Map stories to include likes for each story
  const storiesWithLikes: StoryWithUser[] = stories.map((story) => ({
    ...story,
    likes: [{ userId: currentUserId }], // Initialize likes with current userId (you can adjust this based on actual data)
  }));

  return (
    <div className="p-4 bg-white rounded-lg shadow-md overflow-scroll text-xs scrollbar-hide">
      <div className="flex gap-8 w-max">
        <StoryList stories={storiesWithLikes} userId={currentUserId} />
      </div>
    </div>
  );
};

export default Stories;

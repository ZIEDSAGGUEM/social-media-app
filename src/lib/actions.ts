"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { useAuth } from "@clerk/nextjs";

export const switchFollow = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }

  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });

      if (existingFollowRequest) {
        await prisma.followRequest.delete({
          where: {
            id: existingFollowRequest.id,
          },
        });
      } else {
        await prisma.followRequest.create({
          data: {
            senderId: currentUserId,
            receiverId: userId,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const switchBlock = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingBlock = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: userId,
      },
    });

    if (existingBlock) {
      await prisma.block.delete({
        where: {
          id: existingBlock.id,
        },
      });
    } else {
      await prisma.block.create({
        data: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const acceptFollowRequest = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });

    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });

      await prisma.follower.create({
        data: {
          followerId: userId,
          followingId: currentUserId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const declineFollowRequest = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });

    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const updateProfile = async (
  prevState: { success: boolean; error: boolean },
  payload: { formData: FormData; cover: string }
) => {
  const { formData, cover } = payload;
  const fields = Object.fromEntries(formData);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")
  );

  const Profile = z.object({
    cover: z.string().optional(),
    name: z.string().max(60).optional(),
    surname: z.string().max(60).optional(),
    description: z.string().max(255).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });

  const validatedFields = Profile.safeParse({ cover, ...filteredFields });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const { userId } = auth();

  if (!userId) {
    return { success: false, error: true };
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const switchLike = async (postId: number) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

export const addComment = async (postId: number, desc: string) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const createdComment = await prisma.comment.create({
      data: {
        desc,
        userId,
        postId,
      },
      include: {
        user: true,
      },
    });

    return createdComment;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addPost = async (formData: FormData, img: string) => {
  const desc = formData.get("desc") as string;

  const Desc = z.string().min(1).max(255);

  const validatedDesc = Desc.safeParse(desc);

  if (!validatedDesc.success) {
    //TODO
    console.log("description is not valid");
    return;
  }
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.create({
      data: {
        desc: validatedDesc.data,
        userId,
        img,
      },
    });

    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};

export async function likeStory(storyId: number) {
  try {
    // Check if the user is authenticated
    const { userId } = auth();

    if (!userId) throw new Error("User is not authenticated!");

    // Check if the user already liked the story
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        storyId,
      },
    });

    // Toggle like status
    if (existingLike) {
      // If already liked, remove the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Add new like
      await prisma.like.create({
        data: {
          userId,
          storyId,
        },
      });
    }
  } catch (err) {
    console.error("Error liking story:", err);
    throw new Error("Failed to like story");
  }
}

// Fetch the updated story with the new like count

export const searchUsers = async (query: string) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { name: { contains: query } },
          { surname: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true,
      },
    });
    return users;
  } catch (err) {
    console.error("Error searching users:", err);
    throw new Error("Failed to search users");
  }
};

export const addStory = async (img: string) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    // Just create a new story for the user
    const createdStory = await prisma.story.create({
      data: {
        userId,
        img,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: true,
      },
    });

    return createdStory;
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = async (postId: number) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.delete({
      where: {
        id: postId,
        userId,
      },
    });
    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};

export const toggleLike = async (storyId: number) => {
  const { userId } = auth();
  if (!userId) throw new Error("User is not authenticated!");

  try {
    // Check if the user already liked the story
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        storyId,
      },
    });
    if (existingLike) {
      // Unlike: Remove the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Like: Add a new like
      await prisma.like.create({
        data: {
          userId,
          storyId,
        },
      });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    throw new Error("Failed to toggle like");
  }

  // Return the updated likes count
  const updatedLikesCount = await prisma.like.count({
    where: { storyId },
  });

  return updatedLikesCount;
};

// GET: Get likes for a story
export const getStoryLikes = async (storyId: number) => {
  const likes = await prisma.like.findMany({
    where: { storyId },
    select: { userId: true },
  });

  return likes;
};

// Function to share a post
export async function sharePost(postId: number) {
  const { userId } = auth();
  if (!userId) throw new Error("User is not authenticated!");

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Create a new share entry
    await prisma.share.create({
      data: {
        userId: userId, // User who is sharing the post
        postId: postId, // Post that is being shared
      },
    });
  } catch (error) {
    console.error("Error sharing the post:", error);
    throw new Error("Unable to share the post.");
  }
}

export const getAllVisitors = async (userId: string) => {
  // Step 1: Group by visitorId to ensure unique visitors and get their latest visit time
  const visitors = await prisma.profileVisit.groupBy({
    by: ["visitorId"],
    where: {
      visitedUserId: userId, // Ensure userId is a string
    },
    _max: {
      visitedAt: true, // Get the most recent visit time for each visitor
    },
    orderBy: {
      _max: {
        visitedAt: "desc", // Sort by the most recent visit time
      },
    },
  });

  // Step 2: Fetch visitor details for each unique visitor
  const visitorDetails = await Promise.all(
    visitors.map(async (visitor) => {
      const visitorInfo = await prisma.user.findUnique({
        where: {
          id: visitor.visitorId,
        },
      });

      return {
        visitorId: visitor.visitorId,
        visitedAt: visitor._max.visitedAt, // Most recent visit time
        visitor: visitorInfo, // Visitor details like name, avatar, etc.
      };
    })
  );

  return visitorDetails;
};

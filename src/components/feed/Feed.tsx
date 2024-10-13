import { auth } from "@clerk/nextjs/server";
import Post from "./Post";
import prisma from "@/lib/client";

const Feed = async ({ username }: { username?: string }) => {
  const { userId } = auth();

  let postsAndShares: any[] = [];

  // Query posts and shares based on username
  if (username) {
    // Get all posts by the user
    const posts = await prisma.post.findMany({
      where: {
        user: {
          username: username,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all shares by the user
    const shares = await prisma.share.findMany({
      where: {
        user: {
          username: username,
        },
      },
      include: {
        post: {
          include: {
            user: true,
            likes: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
        user: true, // The user who shared the post
      },
      orderBy: {
        sharedAt: "desc",
      },
    });

    // Combine posts and shares
    postsAndShares = [...posts, ...shares];
  }

  // Query posts and shares based on following list
  if (!username && userId) {
    const following = await prisma.follower.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);
    const ids = [userId, ...followingIds];

    // Get all posts from the user and the people they follow
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: ids,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all shared posts from the user and the people they follow
    const shares = await prisma.share.findMany({
      where: {
        userId: {
          in: ids,
        },
      },
      include: {
        post: {
          include: {
            user: true,
            likes: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
        user: true, // The user who shared the post
      },
      orderBy: {
        sharedAt: "desc",
      },
    });

    // Combine posts and shares
    postsAndShares = [...posts, ...shares];
  }

  // Sort combined list by creation date (post creation or share date)
  postsAndShares.sort((a, b) => {
    const dateA = a.createdAt || a.sharedAt;
    const dateB = b.createdAt || b.sharedAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="p-4 rounded-lg flex flex-col gap-12">
      {postsAndShares.length > 0 ? (
        postsAndShares.map((item) => (
          <div
            key={item.id}
            className="post-item bg-white p-6 rounded-lg shadow-md mb-6"
          >
            {item.desc ? (
              // Regular Post
              <Post post={item} />
            ) : (
              // Shared Post
              <div className="shared-post border border-gray-200 rounded-lg p-4">
                <div className="shared-by flex items-center space-x-4 mb-4">
                  <img
                    src={item.user.avatar || "/noAvatar.png"}
                    alt={item.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {item.user.username}
                    </span>
                    <span className="text-sm text-gray-500">shared a post</span>
                  </div>
                </div>
                <div className="shared-content bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Post post={item.post} />
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No posts or shares found!</p>
      )}
    </div>
  );
};

export default Feed;

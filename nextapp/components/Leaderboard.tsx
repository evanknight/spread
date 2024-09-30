import React from "react";
import { User } from "@/types/types";

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">
        Leaderboard
      </h3>
      <div className="space-y-2">
        {users
          .sort((a, b) => b.total_points - a.total_points)
          .map((user, index) => (
            <div key={user.id} className="flex justify-between items-center">
              <span className="font-medium dark:text-white">
                {index + 1}. {user.name}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {user.total_points} points
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Leaderboard;

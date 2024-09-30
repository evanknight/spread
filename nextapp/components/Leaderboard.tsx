import React from "react";
import { User } from "@/types/user";

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
      <div className="space-y-2">
        {users
          .sort((a, b) => b.points - a.points)
          .map((user, index) => (
            <div key={user.id} className="flex justify-between items-center">
              <span className="font-medium">
                {index + 1}. {user.name}
              </span>
              <span className="text-gray-600">{user.points} points</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Leaderboard;

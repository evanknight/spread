import React from "react";
import { User } from "@/types/types"; // Update this import

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
      <div className="space-y-2">
        {users
          .sort((a, b) => b.total_points - a.total_points) // Change this line
          .map((user, index) => (
            <div key={user.id} className="flex justify-between items-center">
              <span className="font-medium">
                {index + 1}. {user.name}
              </span>
              <span className="text-gray-600">{user.total_points} points</span>{" "}
              // Change this line
            </div>
          ))}
      </div>
    </div>
  );
};

export default Leaderboard;

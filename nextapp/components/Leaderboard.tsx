import React from "react";
import { User } from "@/types";

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  const sortedUsers = [...users].sort(
    (a, b) => b.total_points - a.total_points
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Leaderboard</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs dark:text-gray-300">
            <th className="pb-2">Rank</th>
            <th className="pb-2">Name</th>
            <th className="pb-2 text-right">Points</th>
            <th className="pb-2 text-right">Record</th>
            <th className="pb-2 text-right">Streak</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => (
            <tr
              key={user.id}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <td className="py-2 text-sm dark:text-gray-300">{index + 1}</td>
              <td className="py-2 text-sm dark:text-white">{user.name}</td>
              <td className="py-2 text-right text-sm dark:text-white">
                {user.total_points}
              </td>
              <td className="py-2 text-right text-sm dark:text-white">
                {user.record}
              </td>
              <td className="py-2 text-right text-sm dark:text-white">
                {user.streak}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;

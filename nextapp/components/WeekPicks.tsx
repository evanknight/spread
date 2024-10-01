import React from "react";
import Image from "next/image";
import { User, Pick, Game } from "@/types/types";

interface WeekPicksProps {
  currentWeek: number;
  apiWeek: number; // Add this prop
  users: User[];
  picks: Pick[];
  games: Game[];
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (game: Game, isHomeTeam: boolean) => number;
}

const WeekPicks: React.FC<WeekPicksProps> = ({
  currentWeek,
  apiWeek, // Add this prop
  users,
  picks,
  games,
  getTeamLogo,
  calculatePotentialPoints,
}) => {
  const renderWeekPicks = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 mb-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-white">
        Week {currentWeek} Picks
      </h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-bold dark:text-white w-1/2">
              Name
            </th>
            <th className="text-left text-xs font-bold dark:text-white w-1/3">
              Pick
            </th>
            <th className="text-right text-xs font-bold dark:text-white w-1/6">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const userPick = picks.find(
              (p) => p.user_id === user.id && p.week === apiWeek // Use apiWeek here
            );
            const game = games.find((g) => g.id === userPick?.game_id);
            const pickedTeam =
              userPick && game
                ? userPick.team_picked === game.home_team.id
                  ? game.home_team
                  : game.away_team
                : null;

            return (
              <React.Fragment key={`${user.id}-${apiWeek}`}>
                <tr>
                  <td className="py-2 text-sm dark:text-white">{user.name}</td>
                  {pickedTeam && game && userPick ? (
                    <>
                      <td className="py-2">
                        <div className="flex items-center">
                          <Image
                            src={getTeamLogo(pickedTeam.name)}
                            alt={pickedTeam.name}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          <span className="text-sm dark:text-white">
                            {pickedTeam.name.split(" ").pop()}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-sm dark:text-white text-right pl-2">
                        {calculatePotentialPoints(
                          game,
                          userPick.team_picked === game.home_team.id
                        )}
                        pts
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 text-sm dark:text-gray-400">
                        No pick
                      </td>
                      <td className="py-2 text-sm dark:text-gray-400 text-right pl-2">
                        -
                      </td>
                    </>
                  )}
                </tr>
                {index < users.length - 1 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="border-b border-gray-200 dark:border-gray-700"
                    ></td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return renderWeekPicks();
};

export default WeekPicks;

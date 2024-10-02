import React from "react";
import Image from "next/image";
import { User, Pick, Game } from "@/types/types";

interface WeekPicksProps {
  currentWeek: number;
  users: User[];
  picks: Pick[];
  games: Game[];
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (game: Game, isHomeTeam: boolean) => number;
}

const WeekPicks: React.FC<WeekPicksProps> = ({
  currentWeek,
  users,
  picks,
  games,
  getTeamLogo,
  calculatePotentialPoints,
}) => {
  const currentWeekPicks = picks.filter((pick) => pick.week === currentWeek);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        Week {currentWeek} Picks
      </h2>
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
            const userPick = currentWeekPicks.find(
              (pick) => pick.user_id === user.id
            );
            const game = userPick
              ? games.find((g) => g.id === userPick.game_id)
              : null;
            const pickedTeam =
              userPick && game
                ? userPick.team_picked === game.home_team_id
                  ? game.home_team
                  : game.away_team
                : null;

            return (
              <React.Fragment key={`${user.id}-${currentWeek}`}>
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
                          userPick.team_picked === game.home_team_id
                        )}
                        pts
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 text-sm dark:text-gray-400">
                        No pick yet
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
};

export default WeekPicks;

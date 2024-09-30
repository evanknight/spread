import React from "react";
import Image from "next/image";
import { Game, Pick, User } from "@/types/types";

interface WeekPicksProps {
  currentWeek: number;
  users: User[];
  picks: Pick[];
  games: Game[];
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (spread: number | undefined) => number;
}

const WeekPicks: React.FC<WeekPicksProps> = ({
  currentWeek,
  users,
  picks,
  games,
  getTeamLogo,
  calculatePotentialPoints,
}) => {
  const renderWeekPicks = (week: number) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-white">
        Week {week} Picks
      </h3>
      {users.map((user) => {
        const userPick = picks.find(
          (p) => p.user_id === user.id && p.week === week
        );
        const game = games.find((g) => g.id === userPick?.game_id);
        const pickedTeam =
          userPick && userPick.team_picked === game?.home_team.id
            ? game?.home_team
            : game?.away_team;

        return (
          <div key={`${user.id}-${week}`} className="mb-2">
            <span className="font-bold text-sm dark:text-white">
              {user.name}:
            </span>
            {pickedTeam && (
              <div className="flex items-center mt-1">
                <Image
                  src={getTeamLogo(pickedTeam.name)}
                  alt={pickedTeam.name}
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <div className="text-sm dark:text-white">
                  <span className="font-bold">{pickedTeam.name}</span>
                </div>
                <div className="ml-auto text-right text-sm dark:text-white">
                  {calculatePotentialPoints(
                    userPick?.team_picked === game?.home_team.id
                      ? game?.home_spread
                      : game?.away_spread
                  )}
                  pts
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      {renderWeekPicks(currentWeek - 1)}
      {renderWeekPicks(currentWeek)}
    </div>
  );
};

export default WeekPicks;

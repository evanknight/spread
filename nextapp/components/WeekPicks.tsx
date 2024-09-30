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
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Week {currentWeek} Picks</h2>
      {users.map((user) => {
        const userPick = picks.find((p) => p.user_id === user.id);
        const game = games.find((g) => g.id === userPick?.game_id);
        const pickedTeam =
          userPick && userPick.team_picked === game?.home_team.id
            ? game?.home_team
            : game?.away_team;

        return (
          <div key={user.id} className="mb-2">
            <span className="font-bold">{user.name}:</span>
            {pickedTeam && (
              <div className="flex items-center mt-1">
                <Image
                  src={getTeamLogo(pickedTeam.name)}
                  alt={pickedTeam.name}
                  width={32}
                  height={32}
                  className="mr-2"
                />
                <div>
                  <div className="font-bold">{pickedTeam.name}</div>
                </div>
                <div className="ml-auto text-right">
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
};

export default WeekPicks;

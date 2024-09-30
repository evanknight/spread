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
  const renderWeekPicks = (week: number, title: string) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 mb-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
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
            <span className="text-sm dark:text-white">{user.name}:</span>
            {pickedTeam && game && (
              <div className="flex items-center mt-1">
                <Image
                  src={getTeamLogo(pickedTeam.name)}
                  alt={pickedTeam.name}
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <div className="text-sm dark:text-white">
                  {pickedTeam.name.split(" ").pop()}
                </div>
                <div className="ml-auto text-right text-sm dark:text-white">
                  {calculatePotentialPoints(
                    game,
                    userPick.team_picked === game.home_team.id
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
    <>
      {renderWeekPicks(currentWeek, `Week ${currentWeek} Picks`)}
      {renderWeekPicks(currentWeek + 1, "Next Week's Games")}
    </>
  );
};

export default WeekPicks;

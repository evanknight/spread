import React from "react";
import Image from "next/image";
import { Game, Pick, User } from "@/types/types";

interface GameListProps {
  games: Game[];
  picks: Pick[];
  currentUser: User | null;
  makePick: (gameId: number, teamId: number) => void;
  formatGameTime: (dateString: string) => string;
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (spread: number | undefined) => number;
}

const GameList: React.FC<GameListProps> = ({
  games,
  picks,
  currentUser,
  makePick,
  formatGameTime,
  getTeamLogo,
  calculatePotentialPoints,
}) => {
  return (
    <>
      {games.map((game, index) => (
        <div key={game.id}>
          <div className="py-4 flex justify-between items-center border-gray-300 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatGameTime(game.commence_time)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center py-2">
            <div className="flex items-center space-x-2">
              <Image
                src={getTeamLogo(game.away_team.name)}
                alt={game.away_team.name}
                width={48}
                height={48}
              />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.away_team.name.split(" ").slice(0, -1).join(" ")}
                </div>
                <div className="font-bold">
                  {game.away_team.name.split(" ").slice(-1)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{game.away_spread}</span>
              <span>{calculatePotentialPoints(game.away_spread)} pts</span>
              {new Date() < new Date(game.commence_time) && (
                <button
                  onClick={() => makePick(game.id, game.away_team.id)}
                  className={`w-24 px-4 py-2 rounded hover:bg-blue-600 hover:text-white ${
                    picks.some(
                      (p) =>
                        p.user_id === currentUser?.id &&
                        p.game_id === game.id &&
                        p.team_picked === game.away_team.id
                    )
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500 dark:bg-gray-800 dark:text-white border border-blue-500"
                  }`}
                >
                  {picks.some(
                    (p) =>
                      p.user_id === currentUser?.id &&
                      p.game_id === game.id &&
                      p.team_picked === game.away_team.id
                  )
                    ? "Locked"
                    : "Lock"}
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center py-2">
            <div className="flex items-center space-x-2">
              <Image
                src={getTeamLogo(game.home_team.name)}
                alt={game.home_team.name}
                width={48}
                height={48}
              />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.home_team.name.split(" ").slice(0, -1).join(" ")}
                </div>
                <div className="font-bold">
                  {game.home_team.name.split(" ").slice(-1)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{game.home_spread}</span>
              <span>{calculatePotentialPoints(game.home_spread)} pts</span>
              {new Date() < new Date(game.commence_time) && (
                <button
                  onClick={() => makePick(game.id, game.home_team.id)}
                  className={`w-24 px-4 py-2 rounded hover:bg-blue-600 hover:text-white ${
                    picks.some(
                      (p) =>
                        p.user_id === currentUser?.id &&
                        p.game_id === game.id &&
                        p.team_picked === game.home_team.id
                    )
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500 dark:bg-gray-800 dark:text-white border border-blue-500"
                  }`}
                >
                  {picks.some(
                    (p) =>
                      p.user_id === currentUser?.id &&
                      p.game_id === game.id &&
                      p.team_picked === game.home_team.id
                  )
                    ? "Locked"
                    : "Lock"}
                </button>
              )}
            </div>
          </div>
          {index < games.length - 1 && (
            <hr className="border-gray-300 dark:border-gray-700 my-4" />
          )}
        </div>
      ))}
    </>
  );
};

export default GameList;

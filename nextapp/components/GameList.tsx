import React from "react";
import { Game, User, Pick } from "@/types/types";
import WeekCountdown from "./WeekCountdown";
import Image from "next/image";

interface GameListProps {
  games: Game[];
  picks: Pick[];
  currentUser: User | null;
  makePick: (gameId: number, teamId: number, week: number) => void;
  formatGameTime: (dateString: string) => string;
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (game: Game, isHomeTeam: boolean) => number;
  currentWeek: number;
}

const GameList: React.FC<GameListProps> = ({
  games,
  picks,
  currentUser,
  makePick,
  formatGameTime,
  getTeamLogo,
  calculatePotentialPoints,
  currentWeek,
}) => {
  const getFirstGameTime = (weekGames: Game[]): Date => {
    if (weekGames.length === 0) return new Date();
    return new Date(weekGames[0].commence_time);
  };

  const getTeamNameOnly = (fullName: string) => {
    return fullName.split(" ").pop() || "";
  };

  const SpreadChip: React.FC<{ spread: number }> = ({ spread }) => {
    const isPositive = spread > 0;
    const bgColor = isPositive ? "bg-green-100" : "bg-red-100";
    const textColor = isPositive ? "text-green-800" : "text-red-800";
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor} ml-2`}
      >
        {isPositive ? "+" : ""}
        {spread}
      </span>
    );
  };

  const renderWeekGames = (week: number) => {
    const weekGames = games.filter((game) => game.week === week);

    if (weekGames.length === 0) {
      return null;
    }

    const isCurrentWeek = week === currentWeek;

    return (
      <div
        key={week}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 shadow-lg mb-4"
      >
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Week {week} Games
        </h2>
        {isCurrentWeek ? (
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            Games in progress, picks are locked.
          </div>
        ) : (
          <WeekCountdown
            currentWeek={week}
            firstGameTime={getFirstGameTime(weekGames)}
          />
        )}
        {weekGames.map((game) => {
          const userPick = picks.find(
            (pick) =>
              pick.game_id === game.id && pick.user_id === currentUser?.id
          );
          const homeTeamPicked = userPick?.team_picked === game.home_team.id;
          const awayTeamPicked = userPick?.team_picked === game.away_team.id;

          return (
            <div
              key={game.id}
              className="border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatGameTime(game.commence_time)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center w-5/12">
                  <Image
                    src={getTeamLogo(game.away_team.name)}
                    alt={game.away_team.name}
                    width={40}
                    height={40}
                    className="mr-2"
                  />
                  <span className="text-lg text-black dark:text-white">
                    {game.away_team.name}
                  </span>
                  <SpreadChip spread={game.away_spread} />
                </div>
                <div className="w-2/12 text-center">
                  <span className="text-sm dark:text-white">@</span>
                </div>
                <div className="flex items-center justify-end w-5/12">
                  <Image
                    src={getTeamLogo(game.home_team.name)}
                    alt={game.home_team.name}
                    width={40}
                    height={40}
                    className="mr-2"
                  />
                  <span className="text-lg text-black dark:text-white">
                    {game.home_team.name}
                  </span>
                  <SpreadChip spread={game.home_spread} />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                {new Date(game.commence_time) < new Date() ? (
                  userPick && (
                    <div className="w-full text-center text-gray-600 dark:text-gray-300">
                      {homeTeamPicked &&
                        `Locked ${getTeamNameOnly(
                          game.home_team.name
                        )} (${calculatePotentialPoints(game, true)}pt)`}
                      {awayTeamPicked &&
                        `Locked ${getTeamNameOnly(
                          game.away_team.name
                        )} (${calculatePotentialPoints(game, false)}pt)`}
                    </div>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => makePick(game.id, game.away_team.id, week)}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                        awayTeamPicked
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white"
                      }`}
                      disabled={!!userPick}
                    >
                      <span className="text-sm">
                        {awayTeamPicked ? "Locked" : "Lock"}{" "}
                        {getTeamNameOnly(game.away_team.name)} (
                        {calculatePotentialPoints(game, false)}pt)
                      </span>
                    </button>
                    <button
                      onClick={() => makePick(game.id, game.home_team.id, week)}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                        homeTeamPicked
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white"
                      }`}
                      disabled={!!userPick}
                    >
                      <span className="text-sm">
                        {homeTeamPicked ? "Locked" : "Lock"}{" "}
                        {getTeamNameOnly(game.home_team.name)} (
                        {calculatePotentialPoints(game, true)}pt)
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {renderWeekGames(currentWeek)}
      {renderWeekGames(currentWeek + 1)}
    </>
  );
};

export default GameList;

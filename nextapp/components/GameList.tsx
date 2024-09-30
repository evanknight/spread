import React from "react";
import { Game, User, Pick } from "@/types/types";
import WeekCountdown from "./WeekCountdown";
import Image from "next/image";

interface GameListProps {
  games: Game[];
  picks: Pick[];
  currentUser: User | null;
  makePick: (gameId: number, teamId: number) => void;
  formatGameTime: (dateString: string) => string;
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (spread: number) => number;
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
          const userPick = picks.find((pick) => pick.game_id === game.id);
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
                <span className="text-sm font-semibold dark:text-white">
                  Spread: {game.home_spread}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center w-5/12">
                  <img
                    src={getTeamLogo(game.home_team.name)}
                    alt={game.home_team.name}
                    className="w-8 h-8 mr-2"
                  />
                  <span className="font-semibold dark:text-white">
                    {game.home_team.name}
                  </span>
                </div>
                <div className="w-2/12 text-center">
                  <span className="text-sm font-semibold dark:text-white">
                    vs
                  </span>
                </div>
                <div className="flex items-center justify-end w-5/12">
                  <span className="font-semibold dark:text-white">
                    {game.away_team.name}
                  </span>
                  <img
                    src={getTeamLogo(game.away_team.name)}
                    alt={game.away_team.name}
                    className="w-8 h-8 ml-2"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                {isCurrentWeek ? (
                  <div className="w-full text-center text-gray-600 dark:text-gray-300">
                    {homeTeamPicked &&
                      `Locked ${getTeamNameOnly(
                        game.home_team.name
                      )} (${calculatePotentialPoints(game.home_spread)}pt)`}
                    {awayTeamPicked &&
                      `Locked ${getTeamNameOnly(
                        game.away_team.name
                      )} (${calculatePotentialPoints(game.away_spread)}pt)`}
                    {!homeTeamPicked && !awayTeamPicked && "No pick made"}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => makePick(game.id, game.home_team.id)}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                        homeTeamPicked
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white"
                      }`}
                      disabled={homeTeamPicked || awayTeamPicked}
                    >
                      {homeTeamPicked ? "Locked" : "Lock"}{" "}
                      {getTeamNameOnly(game.home_team.name)} (
                      {calculatePotentialPoints(game.home_spread)}pt)
                    </button>
                    <button
                      onClick={() => makePick(game.id, game.away_team.id)}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                        awayTeamPicked
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white"
                      }`}
                      disabled={homeTeamPicked || awayTeamPicked}
                    >
                      {awayTeamPicked ? "Locked" : "Lock"}{" "}
                      {getTeamNameOnly(game.away_team.name)} (
                      {calculatePotentialPoints(game.away_spread)}pt)
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

import React, { useState, useEffect } from "react";
import { Game, User, Pick } from "@/types/types";
import WeekCountdown from "./WeekCountdown";
import Image from "next/image";
import { FiLock } from "react-icons/fi";

interface GameListProps {
  games: Game[];
  picks: Pick[];
  currentUser: User | null;
  makePick: (gameId: number, teamId: number, week: number) => void;
  formatGameTime: (dateString: string) => string;
  getTeamLogo: (teamName: string) => string;
  calculatePotentialPoints: (game: Game, isHomeTeam: boolean) => number;
  currentWeek: number;
  apiWeek: number;
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
  apiWeek,
}) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(
    null
  );

  useEffect(() => {
    if (currentUser && picks.length > 0) {
      const userPick = picks.find(
        (p) => p.user_id === currentUser.id && p.week === apiWeek
      );
      if (userPick) {
        const pickedGame = games.find((g) => g.id === userPick.game_id);
        if (pickedGame) {
          setSelectedGame(pickedGame);
          setSelectedTeam(
            userPick.team_picked === pickedGame.home_team.id ? "home" : "away"
          );
        }
      } else {
        setSelectedGame(null);
        setSelectedTeam(null);
      }
    }
  }, [currentUser, picks, games, apiWeek]);

  const getFirstGameTime = (weekGames: Game[]): Date => {
    if (weekGames.length === 0) return new Date();
    return new Date(weekGames[0].commence_time);
  };

  const handlePick = (game: Game, teamType: "home" | "away") => {
    const teamId = teamType === "home" ? game.home_team.id : game.away_team.id;
    makePick(game.id, teamId, apiWeek); // Use apiWeek instead of currentWeek
    setSelectedGame(game);
    setSelectedTeam(teamType);
  };

  const handleCancelPick = () => {
    if (selectedGame) {
      makePick(selectedGame.id, 0, apiWeek); // Use apiWeek instead of currentWeek
      setSelectedGame(null);
      setSelectedTeam(null);
    }
  };

  const renderTeamCard = (game: Game, isHome: boolean) => {
    const team = isHome ? game.home_team : game.away_team;
    const spread = isHome ? game.home_spread : game.away_spread;
    const points = calculatePotentialPoints(game, isHome);
    const isPicked =
      selectedGame?.id === game.id &&
      ((isHome && selectedTeam === "home") ||
        (!isHome && selectedTeam === "away"));

    // Extract city name and team name
    const nameParts = team.name.split(" ");
    const teamName = nameParts.pop() || "";
    const cityName = nameParts.join(" ");

    return (
      <div
        className={`relative bg-white dark:bg-gray-800 p-4 rounded-xl border ${
          isPicked
            ? "border-blue-500 dark:border-blue-400"
            : "border-gray-200 dark:border-gray-700"
        } hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group`}
        onClick={() => handlePick(game, isHome ? "home" : "away")}
      >
        {/* Lock Emoji on Hover (desktop only) */}
        <div className="absolute bottom-2 right-2 hidden group-hover:block">
          <FiLock className="text-gray-400" />
        </div>

        {/* Spread chip for mobile only */}
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-sm rounded-full md:hidden ${
            spread > 0
              ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-100"
              : "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {spread > 0 ? `+${spread}` : spread}
        </span>

        <div className="flex md:flex-row flex-col md:items-center items-center justify-center md:justify-between">
          {/* Team logo and info (centered on mobile) */}
          <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
            <Image
              src={getTeamLogo(team.name)}
              alt={team.name}
              width={48}
              height={48}
              className="mr-2"
            />
            <div className="text-center md:text-left">
              {/* Show city name on desktop only */}
              <p className="text-sm text-gray-500 dark:text-gray-400 md:block hidden">
                {cityName}
              </p>
              <h3 className="text-lg font-bold dark:text-white">{teamName}</h3>
            </div>
          </div>

          {/* Spread chip and points (desktop layout) */}
          <div className="hidden md:flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-sm rounded-full ${
                spread > 0
                  ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-100"
                  : "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-100"
              }`}
            >
              {spread > 0 ? `+${spread}` : spread}
            </span>
            <span className="text-lg font-bold dark:text-white">
              {points} pts
            </span>
          </div>

          {/* Spread chip and points (mobile layout, centered) */}
          <div className="md:hidden flex flex-col items-center">
            <span className="text-xl font-bold dark:text-white">
              {points} pts
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderGameCard = (game: Game) => {
    const isGameSelected = selectedGame?.id === game.id;

    if (selectedGame && !isGameSelected) {
      return null;
    }

    return (
      <div key={game.id} className="mb-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {formatGameTime(game.commence_time)}
        </div>

        {isGameSelected ? (
          <>
            {renderTeamCard(game, selectedTeam === "home")}

            {/* My Week # Lock inside the card */}
            <div className="text-center mb-4 text-lg font-bold text-blue-500 flex items-center justify-center">
              <FiLock className="mr-1" /> My Week {currentWeek} Lock
            </div>

            {/* Cancel pick button (inside the card) */}
            <div className="text-center mt-4">
              <button
                onClick={handleCancelPick}
                className="bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors"
              >
                Cancel Pick
              </button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            {renderTeamCard(game, false)}
            <span className="text-lg font-bold text-center dark:text-white">
              vs.
            </span>
            {renderTeamCard(game, true)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold dark:text-white">
          Week {currentWeek} Games
        </h2>
        <div className="mt-2 md:mt-0">
          <WeekCountdown
            firstGameTime={getFirstGameTime(games)}
            currentWeek={currentWeek}
          />
        </div>
      </div>
      {games.map((game) => renderGameCard(game))}
    </>
  );
};

export default GameList;

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
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(
    null
  );

  // Filter games for the current week
  const currentWeekGames = games.filter((game) => game.week === currentWeek);

  useEffect(() => {
    if (currentUser && picks.length > 0) {
      const userPick = picks.find(
        (p) => p.user_id === currentUser.id && p.week === currentWeek
      );
      if (userPick) {
        const pickedGame = currentWeekGames.find(
          (g) => g.id === userPick.game_id
        );
        if (pickedGame) {
          setSelectedGame(pickedGame);
          setSelectedTeam(
            userPick.team_picked === pickedGame.home_team_id ? "home" : "away"
          );
        }
      } else {
        setSelectedGame(null);
        setSelectedTeam(null);
      }
    }
  }, [currentUser, picks, currentWeekGames, currentWeek]);

  const getFirstGameTime = (weekGames: Game[]): Date => {
    if (weekGames.length === 0) return new Date();
    return new Date(weekGames[0].commence_time);
  };

  const handlePick = (game: Game, teamType: "home" | "away") => {
    const teamId = teamType === "home" ? game.home_team_id : game.away_team_id;
    makePick(game.id, teamId, currentWeek);
    setSelectedGame(game);
    setSelectedTeam(teamType);
  };

  const handleCancelPick = () => {
    if (selectedGame) {
      makePick(selectedGame.id, 0, currentWeek);
      setSelectedGame(null);
      setSelectedTeam(null);
    }
  };

  const renderTeamCard = (
    game: Game,
    isHome: boolean,
    isSelected: boolean,
    isDisabled: boolean
  ) => {
    const teamId = isHome ? game.home_team_id : game.away_team_id;
    const team = isHome ? game.home_team : game.away_team;
    const spread = isHome ? game.home_spread : game.away_spread;
    const points = calculatePotentialPoints(game, isHome);

    const teamName = team?.name || `Team ${teamId}`;
    let cityName = "";
    if (team?.name) {
      const nameParts = team.name.split(" ");
      const teamNamePart = nameParts.pop() || "";
      cityName = nameParts.join(" ");
    }

    return (
      <div
        className={`relative bg-white dark:bg-gray-800 p-4 rounded-xl border ${
          isSelected
            ? "border-blue-500 dark:border-blue-400"
            : "border-gray-200 dark:border-gray-700"
        } ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md transition-shadow"
        }`}
        onClick={() =>
          !isDisabled && handlePick(game, isHome ? "home" : "away")
        }
      >
        <div className="flex md:flex-row flex-col md:items-center items-center justify-center md:justify-between">
          {/* Team logo and info (centered on mobile) */}
          <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
            <Image
              src={getTeamLogo(teamName)}
              alt={teamName}
              width={48}
              height={48}
              className="mr-2"
            />
            <div className="text-center md:text-left">
              {/* Show city name on desktop only */}
              {cityName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 md:block hidden">
                  {cityName}
                </p>
              )}
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
            <span
              className={`px-2 py-1 text-sm rounded-full mb-1 ${
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
        </div>
      </div>
    );
  };

  const renderGameCard = (game: Game) => {
    const isGameSelected = selectedGame?.id === game.id;
    const isDisabled = selectedGame !== null && !isGameSelected;

    return (
      <div key={game.id} className="mb-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {formatGameTime(game.commence_time)}
        </div>

        {isGameSelected ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border ">
            <div className="flex items-center justify-center mb-4">
              <FiLock className="text-black-900 dark:text-white mr-2" />
              <span className="text-xl font-bold">
                My Week {currentWeek} Lock
              </span>
            </div>
            {renderTeamCard(game, selectedTeam === "home", true, false)}
            <div className="text-center mt-4">
              <button
                onClick={handleCancelPick}
                className="bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors"
              >
                Cancel Pick
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            {renderTeamCard(game, false, false, isDisabled)}
            <span className="text-lg font-bold text-center dark:text-white">
              vs.
            </span>
            {renderTeamCard(game, true, false, isDisabled)}
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
            firstGameTime={getFirstGameTime(currentWeekGames)}
            currentWeek={currentWeek}
          />
        </div>
      </div>
      {currentWeekGames.length === 0 ? (
        <p>No games available for Week {currentWeek}.</p>
      ) : (
        currentWeekGames.map((game) => renderGameCard(game))
      )}
    </>
  );
};

export default GameList;

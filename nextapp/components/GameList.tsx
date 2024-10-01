import React, { useState, useEffect } from "react";
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

    return (
      <div
        className={`bg-white dark:bg-gray-800 p-4 rounded-lg border ${
          isPicked
            ? "border-blue-500 dark:border-blue-400"
            : "border-gray-200 dark:border-gray-700"
        } hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer`}
        onClick={() => handlePick(game, isHome ? "home" : "away")}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Image
              src={getTeamLogo(team.name)}
              alt={team.name}
              width={48}
              height={48}
              className="mr-4"
            />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {team.city}
              </p>
              <h3 className="text-lg font-bold dark:text-white">
                {team.name.split(" ").pop()}
              </h3>
            </div>
          </div>
          <div>
            <span
              className={`text-sm font-semibold ${
                spread > 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {spread > 0 ? `+${spread}` : spread}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold dark:text-white">
            {points} pts
          </span>
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
            <button
              onClick={handleCancelPick}
              className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              Cancel Pick
            </button>
          </>
        ) : (
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            {renderTeamCard(game, false)}
            <span className="text-2xl font-bold text-center dark:text-white">
              VS
            </span>
            {renderTeamCard(game, true)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        Week {currentWeek} Games
      </h2>
      <WeekCountdown firstGameTime={getFirstGameTime(games)} />
      {games.map((game) => renderGameCard(game))}
    </>
  );
};

export default GameList;

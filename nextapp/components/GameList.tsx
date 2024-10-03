import React, { useState, useEffect } from "react";
import { Game, User, Pick } from "@/types/types";
import WeekCountdown from "./WeekCountdown";
import Image from "next/image";
import { FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

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
    const team = teamType === "home" ? game.home_team : game.away_team;
    const teamName = team?.name || `Team ${teamId}`;
    const points = calculatePotentialPoints(game, teamType === "home");

    makePick(game.id, teamId, currentWeek);
    setSelectedGame(game);
    setSelectedTeam(teamType);

    // Show toast notification
    toast.success(`${teamName} locked for ${points} points`, {
      duration: 3000,
      position: "bottom-center",
    });
  };

  const handleCancelPick = () => {
    if (selectedGame) {
      makePick(selectedGame.id, 0, currentWeek); // Use 0 as teamId to indicate cancellation
      setSelectedGame(null);
      setSelectedTeam(null);
      toast.success("Pick cancelled", {
        duration: 3000,
        position: "bottom-center",
      });
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
    let shortTeamName = teamName;
    if (team?.name) {
      const nameParts = team.name.split(" ");
      shortTeamName = nameParts.pop() || "";
      cityName = nameParts.join(" ");
    }

    return (
      <div
        className={`relative bg-white dark:bg-gray-800 p-4 rounded-xl ${
          isSelected
            ? "border border-blue-500 dark:border-blue-400"
            : isDisabled
            ? "border-transparent"
            : "border border-gray-200 dark:border-gray-700"
        } ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : isSelected
            ? "cursor-default"
            : "cursor-pointer hover:shadow-md transition-shadow"
        }`}
        onClick={() =>
          !isDisabled &&
          !isSelected &&
          handlePick(game, isHome ? "home" : "away")
        }
      >
        <div className="flex lg:flex-row flex-col lg:items-center items-center justify-center lg:justify-between">
          {/* Team logo and info (centered and stacked on mobile, side by side on desktop) */}
          <div className="flex lg:flex-row flex-col items-center lg:justify-start mb-2 lg:mb-0">
            <Image
              src={getTeamLogo(teamName)}
              alt={teamName}
              width={48}
              height={48}
              className="lg:mr-2 mb-2 lg:mb-0"
            />
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400 lg:block hidden">
                {cityName}
              </p>
              <h3 className="text-lg font-bold dark:text-white">
                <span className="lg:hidden">{shortTeamName}</span>
                <span className="hidden lg:inline">{shortTeamName}</span>
              </h3>
            </div>
          </div>

          {/* Spread chip and points */}
          <div className="flex flex-col items-center lg:items-end mt-2 lg:mt-0">
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

    const getSelectedTeamName = () => {
      if (selectedTeam === "home") {
        return game.home_team?.name || "Home Team";
      } else if (selectedTeam === "away") {
        return game.away_team?.name || "Away Team";
      }
      return "";
    };

    return (
      <div key={game.id} className="mb-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {formatGameTime(game.commence_time)}
        </div>

        {isGameSelected ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl ">
            <div className="flex items-center justify-center mb-4">
              <FiLock className="text-black dark:text-white mr-2" />
              <span className="text-lg font-medium text-black dark:text-white">
                My Week {currentWeek} Lock:
                <span className="font-bold"> {getSelectedTeamName()}</span>
              </span>
            </div>
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              {renderTeamCard(
                game,
                false,
                selectedTeam === "away",
                selectedTeam !== "away"
              )}
              <span className="text-lg font-bold text-center dark:text-white">
                vs.
              </span>
              {renderTeamCard(
                game,
                true,
                selectedTeam === "home",
                selectedTeam !== "home"
              )}
            </div>
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

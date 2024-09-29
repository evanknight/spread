"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu } from "@headlessui/react";
import {
  SunIcon,
  MoonIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Team {
  id: number;
  name: string;
}

interface Game {
  id: number;
  commence_time: string;
  home_team: Team;
  away_team: Team;
  home_spread: number;
  away_spread: number;
  week: number | null;
}

interface User {
  id: string;
  name: string;
  total_points: number;
}

interface Pick {
  id: number;
  user_id: string;
  game_id: number;
  team_picked: number;
  week: number;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [currentWeek] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const router = useRouter();

  const checkUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await fetchCurrentUser(user.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchGames = useCallback(async () => {
    try {
      console.log("Fetching games...");
      const { data, error } = await supabase
        .from("games")
        .select(
          `
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `
        )
        .eq("week", currentWeek)
        .order("commence_time", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched games for week", currentWeek, ":", data);

      if (!data || data.length === 0) {
        console.log(
          "No games found for week",
          currentWeek,
          ". Fetching all games..."
        );
        const allGamesResult = await supabase
          .from("games")
          .select(
            `
            *,
            home_team:teams!home_team_id(*),
            away_team:teams!away_team_id(*)
          `
          )
          .order("commence_time", { ascending: true });

        if (allGamesResult.error) {
          console.error(
            "Supabase error when fetching all games:",
            allGamesResult.error
          );
          throw allGamesResult.error;
        }

        const allGames = allGamesResult.data;
        console.log("Fetched all games:", allGames);

        const currentDate = new Date();
        const startOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
        );
        const endOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
        );

        const filteredGames = allGames.filter((game) => {
          const gameDate = new Date(game.commence_time);
          return gameDate >= startOfWeek && gameDate <= endOfWeek;
        });

        console.log("Filtered games for current week:", filteredGames);
        setGames(filteredGames);
      } else {
        setGames(data);
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to fetch games");
    }
  }, [currentWeek]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    }
  }, []);

  const fetchPicks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("picks")
        .select("*")
        .eq("week", currentWeek);
      if (error) throw error;
      setPicks(data || []);
    } catch (err) {
      console.error("Error fetching picks:", err);
      setError("Failed to fetch picks");
    }
  }, [currentWeek]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }

    checkUser();
  }, [checkUser]);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      await fetchGames();
      await fetchUsers();
      await fetchPicks();
      setIsLoading(false);
    }
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser, fetchGames, fetchUsers, fetchPicks]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const firstGame = games[0];
      if (!firstGame) return;

      const gameStart = new Date(firstGame.commence_time);
      const diff = gameStart.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Picks are locked");
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [games]);

  async function fetchCurrentUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // User not found, create a new user
          const { data: userData } = await supabase.auth.getUser();
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({ id: userId, name: userData.user?.email, total_points: 0 })
            .select()
            .single();

          if (createError) throw createError;
          setCurrentUser(newUser);
        } else {
          throw error;
        }
      } else {
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to fetch current user");
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  }

  function formatGameTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getTeamLogo(teamName: string) {
    const simplifiedName = teamName.split(" ").pop() || teamName;
    return `/assets/${simplifiedName}.png`;
  }

  function calculatePotentialPoints(spread: number | undefined): number {
    return 10 + (spread ?? 0);
  }

  async function makePick(gameId: number, teamId: number) {
    if (!currentUser) {
      setError("You must be logged in to make a pick");
      return;
    }

    try {
      const existingPick = picks.find(
        (p) => p.user_id === currentUser.id && p.week === currentWeek
      );

      if (existingPick) {
        const { error } = await supabase
          .from("picks")
          .update({ game_id: gameId, team_picked: teamId })
          .eq("id", existingPick.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("picks").insert({
          user_id: currentUser.id,
          game_id: gameId,
          team_picked: teamId,
          week: currentWeek,
        });

        if (error) throw error;
      }

      await fetchPicks();
    } catch (err) {
      console.error("Error making pick:", err);
      setError("Failed to make pick");
    }
  }

  function toggleDarkMode() {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  async function fetchGamesFromAPI() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/update-games", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to fetch games from API");
      }
      await response.json();
      await fetchGames();
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching games from API:", err);
      setError("Failed to fetch games from API");
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <div className="ml-4 text-2xl text-gray-500 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">The Spread</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-500 dark:text-gray-300"
            >
              {isDarkMode ? (
                <SunIcon className="w-7 h-7" />
              ) : (
                <MoonIcon className="w-7 h-7" />
              )}
            </button>
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <EllipsisHorizontalIcon
                  className="w-7 h-7 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>
              <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={fetchGamesFromAPI}
                        className={`${
                          active
                            ? "bg-blue-500 text-white"
                            : "text-gray-900 dark:text-gray-300"
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        Fetch Games from API
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={signOut}
                        className={`${
                          active
                            ? "bg-blue-500 text-white"
                            : "text-gray-900 dark:text-gray-300"
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border border-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="mb-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 p-4 rounded-lg font-mono text-center">
          <div className="text-sm mb-1">Time until first game:</div>
          <div className="text-2xl">{timeRemaining}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
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
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
            {users
              .sort((a, b) => b.total_points - a.total_points)
              .map((user) => (
                <div key={user.id} className="mb-2">
                  <span className="font-bold">{user.name}:</span>{" "}
                  {user.total_points} points
                </div>
              ))}
          </div>
        </div>

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

        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <h3 className="font-bold mb-1">Debug Info:</h3>
          <p>Number of games: {games.length}</p>
          <p>Current Week: {currentWeek}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GameList from "@/components/GameList";
import Leaderboard from "@/components/Leaderboard";
import WeekPicks from "@/components/WeekPicks";
import { supabase } from "@/lib/supabase";
import { Team, Game, User, Pick } from "@/types/types";
import { getBaseUrl } from "@/utils/environment";
import {
  fetchGames,
  fetchUsers,
  fetchPicks,
  makePick,
  fetchGamesFromAPI,
} from "@/utils/dataFetchers";
import {
  formatGameTime,
  getTeamLogo,
  calculatePotentialPoints,
} from "@/utils/helpers";
import { getCurrentNFLWeek } from "@/utils/dateUtils";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState<number>(getCurrentNFLWeek());
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const checkUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await fetchCurrentUser(user.id);
    } else {
      window.location.href = `${getBaseUrl()}/login`;
    }
  }, []);

  const fetchCurrentUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
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
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = `${getBaseUrl()}/login`;
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  };

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      await fetchGames(supabase, currentWeek, setGames, setError);
      await fetchUsers(supabase, setUsers, setError);
      await fetchPicks(supabase, currentWeek, setPicks, setError);
      await fetchPicks(
        supabase,
        currentWeek - 1,
        (lastWeekPicks) => {
          setPicks((prevPicks) => [...prevPicks, ...lastWeekPicks]);
        },
        setError
      );
      setIsLoading(false);
    }
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser, currentWeek]);

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
    <div className="container mx-auto p-4">
      <Header
        fetchGamesFromAPI={() =>
          fetchGamesFromAPI(
            supabase,
            currentWeek,
            setGames,
            setError,
            setIsLoading
          )
        }
        signOut={signOut}
      />
      {error && (
        <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border border-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <GameList
            games={games}
            picks={picks}
            currentUser={currentUser}
            makePick={(gameId, teamId) =>
              makePick(
                supabase,
                gameId,
                teamId,
                currentUser,
                currentWeek,
                setPicks,
                setError
              )
            }
            formatGameTime={formatGameTime}
            getTeamLogo={getTeamLogo}
            calculatePotentialPoints={calculatePotentialPoints}
          />
        </div>
        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg font-mono text-center">
            <div className="text-sm mb-1 dark:text-white">
              Time until first game:
            </div>
            <div className="text-xl dark:text-white">{timeRemaining}</div>
          </div>
          <WeekPicks
            currentWeek={currentWeek}
            users={users}
            picks={picks}
            games={games}
            getTeamLogo={getTeamLogo}
            calculatePotentialPoints={calculatePotentialPoints}
          />
          <Leaderboard users={users} />
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
        <h3 className="font-bold mb-1">Debug Info:</h3>
        <p>Number of games: {games.length}</p>
        <p>Current Week: {currentWeek}</p>
      </div>
    </div>
  );
}

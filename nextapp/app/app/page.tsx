"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GameList from "@/components/GameList";
import Leaderboard from "@/components/Leaderboard";
import WeekPicks from "@/components/WeekPicks";
import { supabase } from "@/lib/supabase";
import { Game, User, Pick } from "@/types/types";
import {
  fetchGames,
  fetchUsers,
  fetchPicks,
  fetchGamesFromAPI,
  calculateNFLWeek,
  makePick,
} from "@/utils/dataFetchers";
import {
  formatGameTime,
  getTeamLogo,
  calculatePotentialPoints,
} from "@/utils/gameUtils";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(calculateNFLWeek(new Date()));

  const router = useRouter();

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // User not found in the database, create a new user
          const { data: userData } = await supabase.auth.getUser();
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              name: userData.user?.email,
              total_points: 0,
            })
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
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  };

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentWeekGames = await fetchGames(supabase, currentWeek);
        const nextWeekGames = await fetchGames(supabase, currentWeek + 1);
        setGames([...currentWeekGames, ...nextWeekGames]);
        const usersData = await fetchUsers(supabase);
        setUsers(usersData);
        const picksData = await fetchPicks(supabase, currentWeek);
        setPicks(picksData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentWeek]);

  const handleMakePick = async (
    gameId: number,
    teamId: number,
    week: number
  ) => {
    if (!currentUser) return;

    try {
      // Remove any existing pick for this week
      const { error: deleteError } = await supabase
        .from("picks")
        .delete()
        .match({ user_id: currentUser.id, week: week });

      if (deleteError) throw deleteError;

      // Insert the new pick
      const { data, error } = await supabase
        .from("picks")
        .insert({
          user_id: currentUser.id,
          game_id: gameId,
          team_picked: teamId,
          week: week,
        })
        .select();

      if (error) throw error;

      // Update the picks state with the new pick
      setPicks((prevPicks) => {
        const newPicks = prevPicks.filter(
          (pick) => pick.week !== week || pick.user_id !== currentUser.id
        );
        return [...newPicks, data[0]];
      });
    } catch (error) {
      console.error("Error making pick:", error);
      setError("Failed to make pick");
    }
  };

  const handleFetchGames = async () => {
    try {
      setIsLoading(true);
      const fetchedGames = await fetchGamesFromAPI(supabase, currentWeek);
      setGames(fetchedGames);
    } catch (err) {
      console.error("Error fetching games from API:", err);
      setError("Failed to fetch games from API");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        currentUser={currentUser}
        signOut={signOut}
        fetchGamesFromAPI={handleFetchGames}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 order-1 md:order-1 space-y-4">
            <Leaderboard users={users} />
            <WeekPicks
              currentWeek={currentWeek}
              users={users}
              picks={picks}
              games={games}
              getTeamLogo={getTeamLogo}
              calculatePotentialPoints={calculatePotentialPoints}
            />
          </div>
          <div className="w-full md:w-2/3 order-2 md:order-2">
            <GameList
              games={games}
              picks={picks}
              currentUser={currentUser}
              makePick={handleMakePick}
              formatGameTime={formatGameTime}
              getTeamLogo={getTeamLogo}
              calculatePotentialPoints={calculatePotentialPoints}
              currentWeek={currentWeek}
            />
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <h3 className="font-bold mb-1">Debug Info:</h3>
          <p>Number of games: {games.length}</p>
          <p>Current Week: {currentWeek}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GameList from "@/components/GameList";
import Leaderboard from "@/components/Leaderboard";
import WeekPicks from "@/components/WeekPicks";
import { supabase } from "@/lib/supabase";
import { Game, User, Pick } from "@/types";
import {
  fetchGames,
  fetchUsers,
  fetchPicks,
  fetchGamesFromAPI,
} from "@/utils/dataFetchers";
import {
  formatGameTime,
  getTeamLogo,
  calculatePotentialPoints,
  getCurrentNFLWeek,
} from "@/utils/dateUtils"; // Updated import
import { ClipLoader } from "react-spinners";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNFLWeek, setCurrentNFLWeek] = useState<number>(5);

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

  const updateUserName = async (newName: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name: newName })
        .eq("id", currentUser.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentUser(data);
    } catch (err) {
      console.error("Error updating user name:", err);
      setError("Failed to update user name");
    }
  };

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
        const { games: fetchedGames, currentWeek } = await fetchGames(supabase);
        setGames(fetchedGames);
        setCurrentNFLWeek(currentWeek);
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
  }, []);

  const handleMakePick = async (
    gameId: number,
    teamId: number,
    week: number
  ) => {
    if (!currentUser) return;

    try {
      if (teamId === 0) {
        // If teamId is 0, it means we're cancelling the pick
        const { error: deleteError } = await supabase
          .from("picks")
          .delete()
          .match({ user_id: currentUser.id, game_id: gameId });

        if (deleteError) throw deleteError;

        setPicks((prevPicks) =>
          prevPicks.filter(
            (p) => p.user_id !== currentUser.id || p.game_id !== gameId
          )
        );
        return;
      }

      // Get the current spread for the game
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("home_spread, away_spread, home_team_id, away_team_id")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;

      const spread =
        teamId === gameData.home_team_id
          ? gameData.home_spread
          : gameData.away_spread;

      // Upsert the pick (insert if not exists, update if exists)
      const { data, error } = await supabase
        .from("picks")
        .upsert(
          {
            user_id: currentUser.id,
            game_id: gameId,
            team_picked: teamId,
            week: currentNFLWeek,
            spread_at_time: spread,
          },
          { onConflict: "user_id,game_id" }
        )
        .select();

      if (error) throw error;

      const newPick = data[0];

      // Update the picks state with the new pick
      setPicks((prevPicks) => {
        const newPicks = prevPicks.filter(
          (pick) => pick.game_id !== gameId || pick.user_id !== currentUser.id
        );
        return [...newPicks, newPick];
      });

      console.log("Pick saved successfully:", newPick);
    } catch (error) {
      console.error("Error making pick:", error);
      setError("Failed to make pick");
    }
  };

  const handleFetchGames = async () => {
    try {
      setIsLoading(true);
      const fetchedGames = await fetchGamesFromAPI(supabase);
      setGames(fetchedGames);
    } catch (err) {
      console.error("Error fetching games from API:", err);
      setError("Failed to fetch games from API");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#3B82F6" size={50} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster />
      <Header
        currentUser={currentUser}
        signOut={signOut}
        fetchGamesFromAPI={handleFetchGames}
        updateUserName={updateUserName}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="w-full xl:w-1/3 order-1 xl:order-1 space-y-4">
            <Leaderboard users={users} />
            <WeekPicks
              currentWeek={currentNFLWeek}
              users={users}
              picks={picks}
              games={games}
              getTeamLogo={getTeamLogo}
              calculatePotentialPoints={calculatePotentialPoints}
            />
          </div>
          <div className="w-full xl:w-2/3 order-2 xl:order-2">
            <GameList
              games={games}
              picks={picks}
              currentUser={currentUser}
              makePick={handleMakePick}
              formatGameTime={formatGameTime}
              getTeamLogo={getTeamLogo}
              calculatePotentialPoints={calculatePotentialPoints}
              currentWeek={currentNFLWeek}
            />
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <h3 className="font-bold mb-1">Debug Info:</h3>
          <p>Number of games: {games.length}</p>
          <p>Current NFL Week: {currentNFLWeek}</p>
        </div>
      </div>
    </div>
  );
}

import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/types/types";

export const fetchUsers = async (
  supabase: SupabaseClient,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("total_points", { ascending: false });
    if (error) throw error;
    setUsers(data.map((user) => ({ ...user, points: user.total_points })));
  } catch (err) {
    console.error("Error fetching users:", err);
    setError("Failed to fetch users");
  }
};

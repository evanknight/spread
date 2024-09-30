export const fetchUsers = async (supabase, setUsers, setError) => {
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

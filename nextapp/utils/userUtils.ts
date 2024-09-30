export const fetchUsers = async (supabase, setUsers, setError) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    setUsers(data);
  } catch (err) {
    console.error("Error fetching users:", err);
    setError("Failed to fetch users");
  }
};

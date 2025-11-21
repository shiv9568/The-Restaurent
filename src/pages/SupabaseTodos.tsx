import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Todo = {
  id: string | number;
  title?: string;
  [key: string]: any;
};

function SupabaseTodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from("todos").select("*");
        if (error) throw error;
        setTodos(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch todos");
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  if (loading) return <div>Loading todos…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h2>Supabase Todos</h2>
      {todos.length === 0 ? (
        <p>No todos found.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={String(todo.id)}>{todo.title ?? JSON.stringify(todo)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SupabaseTodosPage;

